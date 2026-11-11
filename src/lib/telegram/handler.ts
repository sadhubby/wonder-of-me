import { eq, sql } from "drizzle-orm";

import type { getDb } from "@/db";
import { books, gymWorkouts, meals, readingLogs } from "@/db/schema";
import { getDashboardConfig } from "@/lib/config";
import { getTodayInTimeZone } from "@/lib/date";

import {
  helpText,
  type ParsedCommand,
  type ParsedEatCommand,
  type ParsedGymCommand,
  type ParsedReadCommand,
} from "./parse";

type CommandDatabase = Pick<
  ReturnType<typeof getDb>,
  "insert" | "select" | "update"
>;

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

async function handleGym(
  db: CommandDatabase,
  command: ParsedGymCommand,
): Promise<string> {
  const today = getTodayInTimeZone(getDashboardConfig().timezone);
  const totalSets = command.exercises.reduce(
    (total, exercise) => total + (exercise.sets ?? 1),
    0,
  );

  await db.insert(gymWorkouts).values({
    workoutDate: today,
    split: command.split,
    durationMinutes: command.durationMinutes,
    exercises: command.exercises,
    notes: command.notes,
  });

  const duration = command.durationMinutes
    ? ` · ${command.durationMinutes} min`
    : "";
  const sets = totalSets > 0 ? ` · ${totalSets} sets` : "";

  return `Logged ${command.split}${duration}${sets}. Nice work.`;
}

async function handleRead(
  db: CommandDatabase,
  command: ParsedReadCommand,
): Promise<string> {
  const today = getTodayInTimeZone(getDashboardConfig().timezone);

  let book = (
    await db
      .select()
      .from(books)
      .where(sql`lower(${books.title}) = lower(${command.title})`)
      .limit(1)
  )[0];
  const previousBookStatus = book?.status;
  const previousBookStartedAt = book?.startedAt;
  let createdBook = false;

  if (!book) {
    const inserted = await db
      .insert(books)
      .values({
        title: command.title,
        status: "reading",
        startedAt: today,
      })
      .onConflictDoNothing()
      .returning();
    book = inserted[0];
    createdBook = Boolean(book);

    if (!book) {
      book = (
        await db
          .select()
          .from(books)
          .where(sql`lower(${books.title}) = lower(${command.title})`)
          .limit(1)
      )[0];
    }
  } else {
    await db
      .update(books)
      .set({
        status: "reading",
        startedAt: book.startedAt ?? today,
      })
      .where(eq(books.id, book.id));
  }

  if (!book) {
    throw new Error(`Book "${command.title}" was not found after insert.`);
  }

  await db.insert(readingLogs).values({
    logDate: today,
    bookId: book.id,
    pages: command.pages,
    minutes: command.minutes,
    previousBookStatus,
    previousBookStartedAt,
    createdBook,
  });

  const [progress] = await db
    .select({
      pages: sql<number>`coalesce(sum(${readingLogs.pages}), 0)`,
    })
    .from(readingLogs)
    .where(eq(readingLogs.bookId, book.id));

  const minutes = command.minutes ? ` in ${command.minutes} min` : "";

  return `Read ${command.pages} pages of ${book.title}${minutes}. ${formatNumber(Number(progress?.pages ?? 0))} pages logged for this book.`;
}

async function handleEat(
  db: CommandDatabase,
  command: ParsedEatCommand,
): Promise<string> {
  const config = getDashboardConfig();
  const today = getTodayInTimeZone(config.timezone);

  await db.insert(meals).values({
    logDate: today,
    description: command.description,
    calories: command.calories,
    proteinG: command.protein,
    carbsG: command.carbs,
    fatG: command.fat,
  });

  const [totals] = await db
    .select({
      calories: sql<number>`coalesce(sum(${meals.calories}), 0)`,
      protein: sql<number>`coalesce(sum(${meals.proteinG}), 0)`,
      carbs: sql<number>`coalesce(sum(${meals.carbsG}), 0)`,
      fat: sql<number>`coalesce(sum(${meals.fatG}), 0)`,
    })
    .from(meals)
    .where(eq(meals.logDate, today));

  const calories = Number(totals?.calories ?? 0);
  const remaining = Math.max(0, config.targets.calories - calories);

  return [
    `Logged ${formatNumber(command.calories)} kcal.`,
    `Today: ${formatNumber(calories)} / ${formatNumber(config.targets.calories)} kcal`,
    `P ${formatNumber(Number(totals?.protein ?? 0))}g · C ${formatNumber(Number(totals?.carbs ?? 0))}g · F ${formatNumber(Number(totals?.fat ?? 0))}g`,
    `${formatNumber(remaining)} kcal remaining`,
  ].join("\n");
}

export async function processTelegramCommand(
  db: CommandDatabase,
  command: ParsedCommand,
): Promise<string> {
  switch (command.type) {
    case "gym":
      return handleGym(db, command);
    case "read":
      return handleRead(db, command);
    case "eat":
      return handleEat(db, command);
    case "help":
      return helpText;
    case "error":
      return `${command.message}\n\nSend /help for the command reference.`;
  }
}
