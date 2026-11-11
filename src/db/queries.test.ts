import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeAll, beforeEach, afterAll, describe, expect, it, vi } from "vitest";

import * as schema from "./schema";

vi.mock("next/server", () => ({ connection: vi.fn() }));
vi.mock("@/db", () => ({ getDb: vi.fn() }));

import { getDb } from "@/db";
import { books, readingLogs } from "./schema";
import { getDashboardSnapshot } from "./queries";

const createDatabase = (databaseClient: ReturnType<typeof createClient>) =>
  drizzle(databaseClient, { schema });

type TestDatabase = ReturnType<typeof createDatabase>;

let client: ReturnType<typeof createClient>;
let directory: string;
let db: TestDatabase;

describe("getDashboardSnapshot library", () => {
  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "wonder-library-test-"));
    client = createClient({
      url: `file:${join(directory, "test.db")}`,
    });
    db = createDatabase(client);
    await migrate(db, { migrationsFolder: resolve(process.cwd(), "drizzle") });
    vi.mocked(getDb).mockReturnValue(db);
    vi.stubEnv("DASHBOARD_TIMEZONE", "UTC");
    vi.stubEnv("DAILY_CALORIE_TARGET", "2200");
    vi.stubEnv("DAILY_PROTEIN_TARGET", "150");
    vi.stubEnv("DAILY_CARBS_TARGET", "250");
    vi.stubEnv("DAILY_FAT_TARGET", "70");
  });

  beforeEach(async () => {
    await db.delete(readingLogs);
    await db.delete(books);
  });

  afterAll(async () => {
    await client.close();
    await rm(directory, { recursive: true, force: true });
    vi.unstubAllEnvs();
  });

  it("returns every book status with progress details", async () => {
    const [reading, finished] = await db
      .insert(books)
      .values([
        {
          title: "Reading Book",
          totalPages: 200,
          status: "reading",
          startedAt: "2026-01-01",
        },
        {
          title: "Finished Book",
          totalPages: 100,
          status: "finished",
          startedAt: "2025-01-01",
        },
        {
          title: "Paused Book",
          status: "paused",
          startedAt: "2024-01-01",
        },
      ])
      .returning();

    await db.insert(readingLogs).values([
      { bookId: reading.id, logDate: "2026-01-02", pages: 50 },
      { bookId: finished.id, logDate: "2026-01-02", pages: 125 },
    ]);

    const snapshot = await getDashboardSnapshot();

    expect(snapshot.books).toHaveLength(3);
    expect(snapshot.books).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Reading Book",
          status: "reading",
          loggedPages: 50,
          progress: 25,
          startedAt: "2026-01-01",
        }),
        expect.objectContaining({
          title: "Finished Book",
          status: "finished",
          loggedPages: 125,
          progress: 100,
        }),
        expect.objectContaining({
          title: "Paused Book",
          status: "paused",
          loggedPages: 0,
          progress: null,
        }),
      ]),
    );
  });

  it("returns an empty library when no books exist", async () => {
    const snapshot = await getDashboardSnapshot();

    expect(snapshot.books).toEqual([]);
  });
});
