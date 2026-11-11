import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export type WorkoutExercise = {
  name: string;
  sets?: number;
  reps?: number;
};

export type MtgColor = "W" | "U" | "B" | "R" | "G";

export type BookStatus = "reading" | "finished" | "paused";

export const gymWorkouts = sqliteTable(
  "gym_workouts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    workoutDate: text("workout_date").notNull(),
    split: text("split").notNull(),
    durationMinutes: integer("duration_minutes"),
    exercises: text("exercises", { mode: "json" })
      .$type<WorkoutExercise[]>()
      .notNull(),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("gym_workouts_date_idx").on(table.workoutDate),
    index("gym_workouts_split_idx").on(table.split),
  ],
);

export const books = sqliteTable(
  "books",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    author: text("author"),
    coverUrl: text("cover_url"),
    totalPages: integer("total_pages"),
    status: text("status").$type<BookStatus>().notNull().default("reading"),
    startedAt: text("started_at"),
    finishedAt: text("finished_at"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("books_title_unique").on(sql`lower(${table.title})`),
  ],
);

export const readingLogs = sqliteTable(
  "reading_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    logDate: text("log_date").notNull(),
    bookId: integer("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    pages: integer("pages").notNull(),
    minutes: integer("minutes"),
    notes: text("notes"),
    previousBookStatus: text("previous_book_status").$type<BookStatus>(),
    previousBookStartedAt: text("previous_book_started_at"),
    createdBook: integer("created_book", { mode: "boolean" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("reading_logs_date_idx").on(table.logDate),
    index("reading_logs_book_idx").on(table.bookId),
  ],
);

export const meals = sqliteTable(
  "meals",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    logDate: text("log_date").notNull(),
    description: text("description"),
    calories: integer("calories").notNull(),
    proteinG: integer("protein_g").notNull().default(0),
    carbsG: integer("carbs_g").notNull().default(0),
    fatG: integer("fat_g").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [index("meals_date_idx").on(table.logDate)],
);

export const mtgDecks = sqliteTable(
  "mtg_decks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    commander: text("commander").notNull(),
    colorIdentity: text("color_identity", { mode: "json" })
      .$type<MtgColor[]>()
      .notNull(),
    commanderArtUrl: text("commander_art_url"),
    decklistUrl: text("decklist_url"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex("mtg_decks_name_unique").on(table.name)],
);

export const telegramUpdates = sqliteTable("telegram_updates", {
  updateId: integer("update_id").primaryKey(),
  chatId: text("chat_id").notNull(),
  replyText: text("reply_text").notNull(),
  replyStatus: text("reply_status")
    .$type<"pending" | "sent">()
    .notNull()
    .default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  repliedAt: integer("replied_at", { mode: "timestamp" }),
});

export type GymWorkout = typeof gymWorkouts.$inferSelect;
export type Book = typeof books.$inferSelect;
export type ReadingLog = typeof readingLogs.$inferSelect;
export type Meal = typeof meals.$inferSelect;
export type MtgDeck = typeof mtgDecks.$inferSelect;
