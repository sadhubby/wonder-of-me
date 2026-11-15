import { desc, eq, sql } from "drizzle-orm";

import type { getDb } from "@/db";
import { books, gymWorkouts, meals, readingLogs } from "@/db/schema";
import { getDashboardConfig } from "@/lib/config";
import { getTodayInTimeZone } from "@/lib/date";

import {
  helpText,
  type ParsedCommand,
  type ParsedBookCommand,
  type ParsedEatCommand,
  type ParsedFinishCommand,
  type ParsedGymCommand,
  type ParsedReadCommand,
  type ParsedUndoCommand,
} from "./parse";

type CommandDatabase = Pick<
  ReturnType<typeof getDb>,
  "delete" | "insert" | "select" | "update"
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

  return [
    "Workout logged",
    "",
    `Split: ${command.split}`,
    command.durationMinutes ? `Duration: ${command.durationMinutes} min` : null,
    totalSets > 0 ? `Sets: ${totalSets}` : null,
    "",
    "Nice work.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
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

  return [
    "Reading logged",
    "",
    `Book: ${book.title}`,
    `Pages: ${formatNumber(command.pages)}`,
    command.minutes ? `Time: ${command.minutes} min` : null,
    `Total for book: ${formatNumber(Number(progress?.pages ?? 0))} pages`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
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
    "Meal logged",
    "",
    `Added: ${formatNumber(command.calories)} kcal`,
    "",
    "Today's total",
    `${formatNumber(calories)} / ${formatNumber(config.targets.calories)} kcal`,
    `Protein: ${formatNumber(Number(totals?.protein ?? 0))}g`,
    `Carbs: ${formatNumber(Number(totals?.carbs ?? 0))}g`,
    `Fat: ${formatNumber(Number(totals?.fat ?? 0))}g`,
    `Remaining: ${formatNumber(remaining)} kcal`,
  ].join("\n");
}

async function handleBook(
  db: CommandDatabase,
  command: ParsedBookCommand,
): Promise<string> {
  const [existing] = await db
    .select()
    .from(books)
    .where(sql`lower(${books.title}) = lower(${command.title})`)
    .limit(1);

  if (!existing) {
    await db.insert(books).values({
      title: command.title,
      author: command.author,
      totalPages: command.totalPages,
      status: command.status,
      finishedAt: command.status === "finished"
        ? getTodayInTimeZone(getDashboardConfig().timezone)
        : null,
    });
    return [
      "Book added",
      "",
      `Title: ${command.title}`,
      `Status: ${command.status}`,
    ].join("\n");
  }

  await db
    .update(books)
    .set({
      author: command.author ?? existing.author,
      totalPages: command.totalPages ?? existing.totalPages,
      status: command.status,
      finishedAt:
        command.status === "finished"
          ? existing.finishedAt ??
            getTodayInTimeZone(getDashboardConfig().timezone)
          : null,
    })
    .where(eq(books.id, existing.id));

  return [
    "Book updated",
    "",
    `Title: ${existing.title}`,
    `Status: ${command.status}`,
  ].join("\n");
}

async function handleFinish(
  db: CommandDatabase,
  command: ParsedFinishCommand,
): Promise<string> {
  const [book] = await db
    .select()
    .from(books)
    .where(sql`lower(${books.title}) = lower(${command.title})`)
    .limit(1);

  if (!book) {
    return `I couldn't find "${command.title}" in your library. Use /book to add it first.`;
  }

  if (book.status === "finished") {
    return [`Already finished`, "", book.title].join("\n");
  }

  await db
    .update(books)
    .set({
      status: "finished",
      finishedAt: getTodayInTimeZone(getDashboardConfig().timezone),
    })
    .where(eq(books.id, book.id));

  return ["Book finished", "", book.title].join("\n");
}

async function handleStatus(
  db: CommandDatabase,
): Promise<string> {
  const today = getTodayInTimeZone(getDashboardConfig().timezone);
  const [totals] = await db
    .select({
      calories: sql<number>`coalesce(sum(${meals.calories}), 0)`,
      protein: sql<number>`coalesce(sum(${meals.proteinG}), 0)`,
      carbs: sql<number>`coalesce(sum(${meals.carbsG}), 0)`,
      fat: sql<number>`coalesce(sum(${meals.fatG}), 0)`,
    })
    .from(meals)
    .where(eq(meals.logDate, today));
  const [workout] = await db
    .select()
    .from(gymWorkouts)
    .where(eq(gymWorkouts.workoutDate, today))
    .orderBy(desc(gymWorkouts.createdAt), desc(gymWorkouts.id))
    .limit(1);
  const readingRows = await db
    .select({
      title: books.title,
      pages: readingLogs.pages,
    })
    .from(readingLogs)
    .innerJoin(books, eq(readingLogs.bookId, books.id))
    .where(eq(readingLogs.logDate, today));
  const currentBooks = await db
    .select({ title: books.title })
    .from(books)
    .where(eq(books.status, "reading"));
  const config = getDashboardConfig();
  const calories = Number(totals?.calories ?? 0);
  const pages = readingRows.reduce((total, row) => total + row.pages, 0);

  return [
    "Today's status",
    "",
    "Nutrition",
    `${formatNumber(calories)} / ${formatNumber(config.targets.calories)} kcal`,
    `Protein: ${formatNumber(Number(totals?.protein ?? 0))}g`,
    `Carbs: ${formatNumber(Number(totals?.carbs ?? 0))}g`,
    `Fat: ${formatNumber(Number(totals?.fat ?? 0))}g`,
    `Remaining: ${formatNumber(Math.max(0, config.targets.calories - calories))} kcal`,
    "",
    "Training",
    workout
      ? `${workout.split}${workout.durationMinutes ? ` · ${workout.durationMinutes} min` : ""}`
      : "None logged",
    "",
    "Reading",
    `${formatNumber(pages)} pages${readingRows[0] ? ` · ${readingRows[0].title}` : ""}`,
    `Now reading: ${currentBooks.length ? currentBooks.map((book) => book.title).join(", ") : "None"}`,
  ].join("\n");
}

async function handleUndo(
  db: CommandDatabase,
  command: ParsedUndoCommand,
): Promise<string> {
  if (command.target === "gym") {
    const [workout] = await db
      .select()
      .from(gymWorkouts)
      .orderBy(desc(gymWorkouts.createdAt), desc(gymWorkouts.id))
      .limit(1);

    if (!workout) {
      return "Nothing to undo for gym workouts.";
    }

    await db.delete(gymWorkouts).where(eq(gymWorkouts.id, workout.id));
    return [
      "Workout undone",
      "",
      `Split: ${workout.split}`,
      workout.durationMinutes
        ? `Duration: ${workout.durationMinutes} min`
        : null,
    ]
      .filter((line): line is string => line !== null)
      .join("\n");
  }

  if (command.target === "eat") {
    const [meal] = await db
      .select()
      .from(meals)
      .orderBy(desc(meals.createdAt), desc(meals.id))
      .limit(1);

    if (!meal) {
      return "Nothing to undo for meals.";
    }

    await db.delete(meals).where(eq(meals.id, meal.id));
    return [
      "Meal undone",
      "",
      `Calories: ${formatNumber(meal.calories)} kcal`,
      meal.description ? `Description: ${meal.description}` : null,
    ]
      .filter((line): line is string => line !== null)
      .join("\n");
  }

  const [readingLog] = await db
    .select()
    .from(readingLogs)
    .orderBy(desc(readingLogs.createdAt), desc(readingLogs.id))
    .limit(1);

  if (!readingLog) {
    return "Nothing to undo for reading.";
  }

  await db.delete(readingLogs).where(eq(readingLogs.id, readingLog.id));

  if (readingLog.createdBook) {
    const [remainingLog] = await db
      .select({ id: readingLogs.id })
      .from(readingLogs)
      .where(eq(readingLogs.bookId, readingLog.bookId))
      .limit(1);

    if (!remainingLog) {
      await db.delete(books).where(eq(books.id, readingLog.bookId));
      return [
        "Reading undone",
        "",
        `Pages: ${formatNumber(readingLog.pages)}`,
        "The newly added book was removed.",
      ].join("\n");
    }
  } else {
    await db
      .update(books)
      .set({
        status: readingLog.previousBookStatus ?? "reading",
        startedAt: readingLog.previousBookStartedAt,
      })
      .where(eq(books.id, readingLog.bookId));
  }

  const [book] = await db
    .select({ title: books.title })
    .from(books)
    .where(eq(books.id, readingLog.bookId))
    .limit(1);

  return [
    "Reading undone",
    "",
    `Pages: ${formatNumber(readingLog.pages)}`,
    book ? `Book: ${book.title}` : null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
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
    case "book":
      return handleBook(db, command);
    case "finish":
      return handleFinish(db, command);
    case "status":
      return handleStatus(db);
    case "undo":
      return handleUndo(db, command);
    case "help":
      return helpText;
    case "error":
      return `${command.message}\n\nSend /help for the command reference.`;
  }
}
