import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import * as schema from "@/db/schema";

vi.mock("@/db", () => ({ getDb: vi.fn() }));

import { getDb } from "@/db";
import { books, gymWorkouts, readingLogs, telegramUpdates } from "@/db/schema";
import { POST } from "@/app/api/telegram/route";

const webhookSecret = "test-webhook-secret";
const chatId = "123";
let client: ReturnType<typeof createClient>;
let directory: string;

function createDatabase(databaseClient: ReturnType<typeof createClient>) {
  return drizzle(databaseClient, { schema });
}

type TestDatabase = ReturnType<typeof createDatabase>;

let db: TestDatabase;

function makeRequest(
  updateId: number,
  text: string,
  requestChatId = chatId,
  secret = webhookSecret,
) {
  return new Request("http://localhost/api/telegram", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-telegram-bot-api-secret-token": secret,
    },
    body: JSON.stringify({
      update_id: updateId,
      message: { chat: { id: requestChatId }, text },
    }),
  });
}

describe("Telegram webhook update processing", () => {
  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "wonder-telegram-test-"));
    client = createClient({
      url: `file:${join(directory, "test.db")}`,
    });
    db = createDatabase(client);
    await migrate(db, { migrationsFolder: resolve(process.cwd(), "drizzle") });
    vi.mocked(getDb).mockReturnValue(db);
  });

  beforeEach(async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "test-token");
    vi.stubEnv("TELEGRAM_WEBHOOK_SECRET", webhookSecret);
    vi.stubEnv("TELEGRAM_CHAT_ID", chatId);
    await db.delete(telegramUpdates);
    await db.delete(gymWorkouts);
    await db.delete(readingLogs);
    await db.delete(books);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), {
          status: 200,
        }),
      ),
    );
  });

  afterAll(async () => {
    await client.close();
    await rm(directory, { recursive: true, force: true });
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("writes a command once and retries only a pending reply", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: false, description: "temporary error" }), {
          status: 502,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true, result: { message_id: 2 } }), {
          status: 200,
        }),
      );

    const firstResponse = await POST(makeRequest(1001, "/gym push 45"));
    expect(firstResponse.status).toBe(503);

    const retryResponse = await POST(makeRequest(1001, "/gym push 45"));
    expect(retryResponse.status).toBe(200);

    const duplicateResponse = await POST(makeRequest(1001, "/gym push 45"));
    expect(duplicateResponse.status).toBe(200);

    expect(await db.select().from(gymWorkouts)).toHaveLength(1);
    expect(await db.select().from(telegramUpdates)).toMatchObject([
      { updateId: 1001, replyStatus: "sent" },
    ]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("rolls back the update record when the command write fails", async () => {
    await db.$client.execute({
      sql: `CREATE TRIGGER reject_gym_insert
        BEFORE INSERT ON gym_workouts
        BEGIN SELECT RAISE(ABORT, 'forced test failure'); END;`,
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const response = await POST(makeRequest(1002, "/gym push 45"));

      expect(response.status).toBe(500);
      expect(await db.select().from(gymWorkouts)).toHaveLength(0);
      expect(await db.select().from(telegramUpdates)).toHaveLength(0);
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      await db.$client.execute({ sql: "DROP TRIGGER reject_gym_insert" });
      errorSpy.mockRestore();
    }
  });

  it("acknowledges unauthorized chats without writing updates", async () => {
    const response = await POST(makeRequest(1003, "/gym push 45", "999"));

    expect(response.status).toBe(200);
    expect(await db.select().from(gymWorkouts)).toHaveLength(0);
    expect(await db.select().from(telegramUpdates)).toHaveLength(0);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("matches reading titles case-insensitively without creating duplicate books", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true, result: { message_id: 2 } }), {
          status: 200,
        }),
      );

    const firstResponse = await POST(makeRequest(1005, "/read Dune 32"));
    const secondResponse = await POST(makeRequest(1006, "/read dune 18"));

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    expect(await db.select().from(books)).toHaveLength(1);
    expect(await db.select().from(readingLogs)).toHaveLength(2);
    expect(await db.select().from(readingLogs)).toMatchObject([
      { previousBookStatus: null, previousBookStartedAt: null, createdBook: true },
      { previousBookStatus: "reading", createdBook: false },
    ]);
  });

  it("rolls back a newly created book when the reading log fails", async () => {
    await db.$client.execute({
      sql: `CREATE TRIGGER reject_reading_insert
        BEFORE INSERT ON reading_logs
        BEGIN SELECT RAISE(ABORT, 'forced test failure'); END;`,
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const response = await POST(makeRequest(1007, "/read Dune 32"));

      expect(response.status).toBe(500);
      expect(await db.select().from(books)).toHaveLength(0);
      expect(await db.select().from(readingLogs)).toHaveLength(0);
      expect(await db.select().from(telegramUpdates)).toHaveLength(0);
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      await db.$client.execute({ sql: "DROP TRIGGER reject_reading_insert" });
      errorSpy.mockRestore();
    }
  });

  it("rejects invalid secrets and acknowledges malformed updates without writes", async () => {
    const invalidSecretResponse = await POST(
      makeRequest(1004, "/gym push 45", chatId, "wrong-secret"),
    );
    const malformedResponse = await POST(
      new Request("http://localhost/api/telegram", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-telegram-bot-api-secret-token": webhookSecret,
        },
        body: JSON.stringify({
          message: { chat: { id: chatId }, text: "/gym push 45" },
        }),
      }),
    );

    expect(invalidSecretResponse.status).toBe(401);
    expect(malformedResponse.status).toBe(200);
    expect(await db.select().from(gymWorkouts)).toHaveLength(0);
    expect(await db.select().from(telegramUpdates)).toHaveLength(0);
    expect(fetch).not.toHaveBeenCalled();
  });
});
