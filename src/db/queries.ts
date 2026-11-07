import { desc, eq, sql } from "drizzle-orm";
import { connection } from "next/server";

import {
  getDashboardConfig,
  type DashboardConfig,
  type NutritionTargets,
} from "@/lib/config";
import { getTodayInTimeZone } from "@/lib/date";
import {
  buildHeatmap,
  calculateStreaks,
  type HeatmapDay,
} from "@/lib/heatmap";

import { getDb } from "./index";
import {
  books,
  gymWorkouts,
  meals,
  mtgDecks,
  readingLogs,
  type MtgColor,
  type WorkoutExercise,
} from "./schema";

export type DashboardStatus = {
  ok: boolean;
  message?: string;
};

export type GymWorkoutSummary = {
  id: number;
  date: string;
  split: string;
  durationMinutes: number | null;
  exercises: WorkoutExercise[];
  notes: string | null;
};

export type ReadingLogSummary = {
  id: number;
  date: string;
  title: string;
  author: string | null;
  pages: number;
  minutes: number | null;
};

export type GymSummary = {
  heatmap: HeatmapDay[];
  totalWorkouts: number;
  totalSets: number;
  currentStreak: number;
  longestStreak: number;
  favoriteSplit: string | null;
  recent: GymWorkoutSummary[];
};

export type ReadingSummary = {
  heatmap: HeatmapDay[];
  totalPages: number;
  activeDays: number;
  averagePagesPerActiveDay: number;
  currentStreak: number;
  longestStreak: number;
  booksFinished: number;
  recent: ReadingLogSummary[];
};

export type BookSummary = {
  id: number;
  title: string;
  author: string | null;
  coverUrl: string | null;
  totalPages: number | null;
  loggedPages: number;
  progress: number | null;
  startedAt: string | null;
};

export type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type NutritionSummary = {
  totals: NutritionTotals;
  targets: NutritionTargets;
  remainingCalories: number;
};

export type DeckSummary = {
  id: number;
  name: string;
  commander: string;
  colorIdentity: MtgColor[];
  commanderArtUrl: string | null;
  decklistUrl: string | null;
  notes: string | null;
};

export type DashboardSnapshot = {
  today: string;
  generatedAt: string;
  timezone: string;
  status: DashboardStatus;
  gym: GymSummary;
  reading: ReadingSummary;
  books: BookSummary[];
  nutrition: NutritionSummary;
  decks: DeckSummary[];
  links: DashboardConfig["links"];
  spotify: null;
};

const gymHeatmapThresholds = [30, 60, 90] as const;
const readingHeatmapThresholds = [15, 35, 70] as const;

function safeConfig(): DashboardConfig {
  try {
    return getDashboardConfig();
  } catch {
    return {
      timezone: "UTC",
      targets: {
        calories: 2200,
        protein: 150,
        carbs: 250,
        fat: 70,
      },
      links: {
        portfolio: undefined,
        garden: undefined,
      },
    };
  }
}

function emptySnapshot(
  today: string,
  config: DashboardConfig,
  status: DashboardStatus,
): DashboardSnapshot {
  const emptyHeatmap = buildHeatmap(
    {},
    {
      today,
      thresholds: gymHeatmapThresholds,
    },
  );

  return {
    today,
    generatedAt: new Date().toISOString(),
    timezone: config.timezone,
    status,
    gym: {
      heatmap: emptyHeatmap,
      totalWorkouts: 0,
      totalSets: 0,
      currentStreak: 0,
      longestStreak: 0,
      favoriteSplit: null,
      recent: [],
    },
    reading: {
      heatmap: buildHeatmap(
        {},
        {
          today,
          thresholds: readingHeatmapThresholds,
        },
      ),
      totalPages: 0,
      activeDays: 0,
      averagePagesPerActiveDay: 0,
      currentStreak: 0,
      longestStreak: 0,
      booksFinished: 0,
      recent: [],
    },
    books: [],
    nutrition: {
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      targets: config.targets,
      remainingCalories: config.targets.calories,
    },
    decks: [],
    links: config.links,
    spotify: null,
  };
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  await connection();

  const config = safeConfig();
  const today = getTodayInTimeZone(config.timezone);

  try {
    const db = getDb();

    const [gymRows, readingRows, bookRows, deckRows, mealTotals, recentReading] =
      await Promise.all([
        db.select().from(gymWorkouts).orderBy(desc(gymWorkouts.workoutDate)),
        db.select().from(readingLogs).orderBy(desc(readingLogs.logDate)),
        db
          .select({
            id: books.id,
            title: books.title,
            author: books.author,
            coverUrl: books.coverUrl,
            totalPages: books.totalPages,
            status: books.status,
            startedAt: books.startedAt,
            loggedPages: sql<number>`coalesce(sum(${readingLogs.pages}), 0)`,
          })
          .from(books)
          .leftJoin(readingLogs, eq(readingLogs.bookId, books.id))
          .groupBy(
            books.id,
            books.title,
            books.author,
            books.coverUrl,
            books.totalPages,
            books.status,
            books.startedAt,
          )
          .orderBy(desc(books.startedAt)),
        db.select().from(mtgDecks).orderBy(desc(mtgDecks.createdAt)),
        db
          .select({
            calories: sql<number>`coalesce(sum(${meals.calories}), 0)`,
            protein: sql<number>`coalesce(sum(${meals.proteinG}), 0)`,
            carbs: sql<number>`coalesce(sum(${meals.carbsG}), 0)`,
            fat: sql<number>`coalesce(sum(${meals.fatG}), 0)`,
          })
          .from(meals)
          .where(eq(meals.logDate, today)),
        db
          .select({
            id: readingLogs.id,
            date: readingLogs.logDate,
            title: books.title,
            author: books.author,
            pages: readingLogs.pages,
            minutes: readingLogs.minutes,
          })
          .from(readingLogs)
          .innerJoin(books, eq(readingLogs.bookId, books.id))
          .orderBy(desc(readingLogs.logDate), desc(readingLogs.id))
          .limit(6),
      ]);

    const gymValuesByDate: Record<string, number> = {};
    const gymDates: string[] = [];
    const splitCounts = new Map<string, number>();
    let totalSets = 0;

    for (const workout of gymRows) {
      const sets = workout.exercises.reduce(
        (total, exercise) => total + (exercise.sets ?? 1),
        0,
      );
      totalSets += sets;
      gymDates.push(workout.workoutDate);
      gymValuesByDate[workout.workoutDate] =
        (gymValuesByDate[workout.workoutDate] ?? 0) +
        (workout.durationMinutes ?? Math.max(1, sets * 5));
      splitCounts.set(
        workout.split,
        (splitCounts.get(workout.split) ?? 0) + 1,
      );
    }

    const gymStreaks = calculateStreaks(gymDates, today);
    const favoriteSplit =
      [...splitCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const readingValuesByDate: Record<string, number> = {};
    const readingDates: string[] = [];
    let totalPages = 0;

    for (const log of readingRows) {
      totalPages += log.pages;
      readingDates.push(log.logDate);
      readingValuesByDate[log.logDate] =
        (readingValuesByDate[log.logDate] ?? 0) + log.pages;
    }

    const readingStreaks = calculateStreaks(readingDates, today);
    const activeReadingDays = new Set(readingDates).size;
    const readingBooks = bookRows
      .filter((book) => book.status === "reading")
      .map((book) => {
        const loggedPages = Number(book.loggedPages);
        return {
          id: book.id,
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl,
          totalPages: book.totalPages,
          loggedPages,
          progress:
            book.totalPages && book.totalPages > 0
              ? Math.min(100, Math.round((loggedPages / book.totalPages) * 100))
              : null,
          startedAt: book.startedAt,
        };
      });

    const totalsRow = mealTotals[0] ?? {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };

    const totals: NutritionTotals = {
      calories: Number(totalsRow.calories),
      protein: Number(totalsRow.protein),
      carbs: Number(totalsRow.carbs),
      fat: Number(totalsRow.fat),
    };

    return {
      today,
      generatedAt: new Date().toISOString(),
      timezone: config.timezone,
      status: { ok: true },
      gym: {
        heatmap: buildHeatmap(gymValuesByDate, {
          today,
          thresholds: gymHeatmapThresholds,
        }),
        totalWorkouts: gymRows.length,
        totalSets,
        currentStreak: gymStreaks.current,
        longestStreak: gymStreaks.longest,
        favoriteSplit,
        recent: gymRows.slice(0, 5).map((workout) => ({
          id: workout.id,
          date: workout.workoutDate,
          split: workout.split,
          durationMinutes: workout.durationMinutes,
          exercises: workout.exercises,
          notes: workout.notes,
        })),
      },
      reading: {
        heatmap: buildHeatmap(readingValuesByDate, {
          today,
          thresholds: readingHeatmapThresholds,
        }),
        totalPages,
        activeDays: activeReadingDays,
        averagePagesPerActiveDay:
          activeReadingDays > 0
            ? Math.round(totalPages / activeReadingDays)
            : 0,
        currentStreak: readingStreaks.current,
        longestStreak: readingStreaks.longest,
        booksFinished: bookRows.filter((book) => book.status === "finished")
          .length,
        recent: recentReading.map((log) => ({
          id: log.id,
          date: log.date,
          title: log.title,
          author: log.author,
          pages: log.pages,
          minutes: log.minutes,
        })),
      },
      books: readingBooks,
      nutrition: {
        totals,
        targets: config.targets,
        remainingCalories: Math.max(
          0,
          config.targets.calories - totals.calories,
        ),
      },
      decks: deckRows.map((deck) => ({
        id: deck.id,
        name: deck.name,
        commander: deck.commander,
        colorIdentity: deck.colorIdentity,
        commanderArtUrl: deck.commanderArtUrl,
        decklistUrl: deck.decklistUrl,
        notes: deck.notes,
      })),
      links: config.links,
      spotify: null,
    };
  } catch (error) {
    console.error("[dashboard] Failed to load snapshot", error);

    return emptySnapshot(today, config, {
      ok: false,
      message:
        "Data is temporarily unavailable. Confirm the Turso credentials and run the database migrations.",
    });
  }
}
