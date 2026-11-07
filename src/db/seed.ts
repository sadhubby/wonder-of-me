import { count } from "drizzle-orm";
import { format, parseISO, subDays } from "date-fns";

import { getDashboardConfig } from "../lib/config";
import { getTodayInTimeZone } from "../lib/date";
import { loadEnv } from "../lib/load-env";
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

loadEnv();

const sampleBooks = [
  {
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780756404741-L.jpg",
    totalPages: 662,
    status: "reading" as const,
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg",
    totalPages: 476,
    status: "reading" as const,
  },
  {
    title: "Piranesi",
    author: "Susanna Clarke",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9781635575637-L.jpg",
    totalPages: 245,
    status: "reading" as const,
  },
  {
    title: "The Left Hand of Darkness",
    author: "Ursula K. Le Guin",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780441478125-L.jpg",
    totalPages: 304,
    status: "finished" as const,
  },
];

const sampleDecks: Array<{
  name: string;
  commander: string;
  colorIdentity: MtgColor[];
  commanderArtUrl: string;
  decklistUrl: string;
  notes: string;
}> = [
  {
    name: "Atraxa Counter Culture",
    commander: "Atraxa, Praetors' Voice",
    colorIdentity: ["W", "U", "B", "G"],
    commanderArtUrl:
      "https://cards.scryfall.io/art_crop/front/d/0/d0d33d52-3d28-4635-b985-51e126289259.jpg?1783930136",
    decklistUrl: "https://www.moxfield.com/",
    notes: "Sample deck — replace this link with your own list.",
  },
  {
    name: "Prosper Treasure Opera",
    commander: "Prosper, Tome-Bound",
    colorIdentity: ["B", "R"],
    commanderArtUrl:
      "https://cards.scryfall.io/art_crop/front/d/7/d743336e-d5c7-4053-a23d-92ec7581f74e.jpg?1783926259",
    decklistUrl: "https://www.moxfield.com/",
    notes: "Sample deck — replace this link with your own list.",
  },
  {
    name: "Krenko, Mob Rules",
    commander: "Krenko, Mob Boss",
    colorIdentity: ["R"],
    commanderArtUrl:
      "https://cards.scryfall.io/art_crop/front/8/2/824b2d73-2151-4e5e-9f05-8f63e2bdcaa9.jpg?1783909065",
    decklistUrl: "https://www.moxfield.com/",
    notes: "Sample deck — replace this link with your own list.",
  },
];

const splits = ["Push", "Pull", "Legs", "Upper", "Conditioning"] as const;

const exercisesBySplit: Record<string, WorkoutExercise[]> = {
  Push: [
    { name: "Bench press", sets: 4, reps: 8 },
    { name: "Incline dumbbell press", sets: 3, reps: 10 },
    { name: "Cable fly", sets: 3, reps: 12 },
  ],
  Pull: [
    { name: "Pull-ups", sets: 4, reps: 8 },
    { name: "Barbell row", sets: 4, reps: 8 },
    { name: "Face pull", sets: 3, reps: 15 },
  ],
  Legs: [
    { name: "Back squat", sets: 4, reps: 6 },
    { name: "Romanian deadlift", sets: 3, reps: 8 },
    { name: "Leg press", sets: 3, reps: 12 },
  ],
  Upper: [
    { name: "Overhead press", sets: 4, reps: 8 },
    { name: "Lat pulldown", sets: 3, reps: 10 },
    { name: "Dumbbell row", sets: 3, reps: 10 },
  ],
  Conditioning: [
    { name: "Rowing intervals", sets: 6, reps: 1 },
    { name: "Farmer carry", sets: 4, reps: 1 },
  ],
};

async function seed() {
  const db = getDb();
  const today = getTodayInTimeZone(getDashboardConfig().timezone);

  await db.insert(books).values(sampleBooks).onConflictDoNothing();
  await db.insert(mtgDecks).values(sampleDecks).onConflictDoNothing();

  const bookRows = await db.select().from(books);
  const bookByTitle = new Map(bookRows.map((book) => [book.title, book]));

  const [gymCountRow] = await db
    .select({ value: count() })
    .from(gymWorkouts);
  const gymCount = Number(gymCountRow?.value ?? 0);

  if (gymCount === 0) {
    const end = parseISO(today);
    const workouts = [];

    for (let offset = 0; offset < 120; offset += 1) {
      const date = subDays(end, offset);
      const weekday = date.getDay();

      if (weekday === 0 || weekday === 3 || offset % 17 === 5) {
        continue;
      }

      const split = splits[offset % splits.length];
      workouts.push({
        workoutDate: format(date, "yyyy-MM-dd"),
        split,
        durationMinutes: 38 + ((offset * 7) % 38),
        exercises: exercisesBySplit[split],
        notes: offset % 5 === 0 ? "Felt strong; added a little volume." : null,
      });
    }

    await db.insert(gymWorkouts).values(workouts);
  }

  const [readingCountRow] = await db
    .select({ value: count() })
    .from(readingLogs);
  const readingCount = Number(readingCountRow?.value ?? 0);

  if (readingCount === 0) {
    const end = parseISO(today);
    const logs = [];
    const activeBooks = sampleBooks.filter(
      (book) => book.status === "reading",
    );

    for (let offset = 0; offset < 45; offset += 1) {
      if (offset % 5 === 4) {
        continue;
      }

      const date = subDays(end, offset);
      const book = activeBooks[offset % activeBooks.length];
      const bookRow = bookByTitle.get(book.title);

      if (!bookRow) {
        continue;
      }

      logs.push({
        logDate: format(date, "yyyy-MM-dd"),
        bookId: bookRow.id,
        pages: 12 + ((offset * 5) % 26),
        minutes: 20 + ((offset * 3) % 30),
        notes: offset % 9 === 0 ? "A quiet, focused session." : null,
      });
    }

    await db.insert(readingLogs).values(logs);
  }

  const [mealCountRow] = await db.select({ value: count() }).from(meals);
  const mealCount = Number(mealCountRow?.value ?? 0);

  if (mealCount === 0) {
    await db.insert(meals).values([
      {
        logDate: today,
        description: "Greek yogurt, berries, granola",
        calories: 520,
        proteinG: 38,
        carbsG: 58,
        fatG: 16,
      },
      {
        logDate: today,
        description: "Chicken rice bowl",
        calories: 690,
        proteinG: 52,
        carbsG: 72,
        fatG: 20,
      },
      {
        logDate: today,
        description: "Salmon, potatoes, greens",
        calories: 760,
        proteinG: 54,
        carbsG: 58,
        fatG: 34,
      },
    ]);
  }

  console.log(
    `Seed complete for ${today}: ${sampleBooks.length} books, ${sampleDecks.length} decks, ${gymCount === 0 ? "120-day" : "existing"} gym log, ${readingCount === 0 ? "45-day" : "existing"} reading log, ${mealCount === 0 ? "3" : "existing"} meals.`,
  );
}

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exitCode = 1;
});
