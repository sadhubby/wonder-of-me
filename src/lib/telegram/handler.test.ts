import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeAll, beforeEach, afterAll, describe, expect, it, vi } from "vitest";

import * as schema from "@/db/schema";

import { processTelegramCommand } from "./handler";
import { parseTelegramCommand } from "./parse";

const createDatabase = (databaseClient: ReturnType<typeof createClient>) =>
  drizzle(databaseClient, { schema });

let client: ReturnType<typeof createClient>;
let directory: string;
let db: ReturnType<typeof createDatabase>;

describe("Telegram command handlers", () => {
  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "wonder-telegram-test-"));
    client = createClient({ url: `file:${join(directory, "test.db")}` });
    db = createDatabase(client);
    await migrate(db, { migrationsFolder: resolve(process.cwd(), "drizzle") });
    vi.stubEnv("DASHBOARD_TIMEZONE", "UTC");
    vi.stubEnv("DAILY_CALORIE_TARGET", "2200");
    vi.stubEnv("DAILY_PROTEIN_TARGET", "150");
    vi.stubEnv("DAILY_CARBS_TARGET", "250");
    vi.stubEnv("DAILY_FAT_TARGET", "70");
  });

  beforeEach(async () => {
    await db.delete(schema.readingLogs);
    await db.delete(schema.books);
    await db.delete(schema.meals);
    await db.delete(schema.gymWorkouts);
  });

  afterAll(async () => {
    await client.close();
    await rm(directory, { recursive: true, force: true });
    vi.unstubAllEnvs();
  });

  it("adds and updates books, then finishes them", async () => {
    const add = parseTelegramCommand(
      '/book "Dune" | author=Frank Herbert pages=412',
    );
    expect(add).not.toBeNull();
    expect(await processTelegramCommand(db, add!)).toContain("Book added");

    const update = parseTelegramCommand("/book dune | status=paused");
    expect(update).not.toBeNull();
    expect(await processTelegramCommand(db, update!)).toContain("Book updated");

    const finish = parseTelegramCommand("/finish DUNE");
    expect(finish).not.toBeNull();
    expect(await processTelegramCommand(db, finish!)).toContain("Book finished");

    const [book] = await db.select().from(schema.books);
    expect(book).toMatchObject({
      title: "Dune",
      author: "Frank Herbert",
      totalPages: 412,
      status: "finished",
    });
    expect(book.finishedAt).toBeTruthy();
  });

  it("returns an explicit response for an unknown book", async () => {
    const command = parseTelegramCommand("/finish Dune");
    expect(command).not.toBeNull();
    await expect(processTelegramCommand(db, command!)).resolves.toContain(
      "couldn't find",
    );
  });

  it("reports today's nutrition, training, and reading status", async () => {
    const today = new Date().toISOString().slice(0, 10);
    const [book] = await db
      .insert(schema.books)
      .values({ title: "Dune", status: "reading" })
      .returning();
    await db.insert(schema.meals).values({
      logDate: today,
      calories: 620,
      proteinG: 45,
      carbsG: 60,
      fatG: 20,
    });
    await db.insert(schema.gymWorkouts).values({
      workoutDate: today,
      split: "push",
      durationMinutes: 45,
      exercises: [],
    });
    await db.insert(schema.readingLogs).values({
      logDate: today,
      bookId: book.id,
      pages: 32,
    });

    const command = parseTelegramCommand("/status");
    expect(command).not.toBeNull();
    const response = await processTelegramCommand(db, command!);

    expect(response).toContain("620 / 2,200 kcal");
    expect(response).toContain("push · 45 min");
    expect(response).toContain("32 pages · Dune");
    expect(response).toContain("Now reading: Dune");
  });
});
