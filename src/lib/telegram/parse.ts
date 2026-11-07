import type { WorkoutExercise } from "@/db/schema";

export type ParsedGymCommand = {
  type: "gym";
  split: string;
  durationMinutes: number | null;
  exercises: WorkoutExercise[];
  notes: string | null;
};

export type ParsedReadCommand = {
  type: "read";
  title: string;
  pages: number;
  minutes: number | null;
};

export type ParsedEatCommand = {
  type: "eat";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string | null;
};

export type ParsedHelpCommand = {
  type: "help";
};

export type ParsedErrorCommand = {
  type: "error";
  command: string;
  message: string;
};

export type ParsedCommand =
  | ParsedGymCommand
  | ParsedReadCommand
  | ParsedEatCommand
  | ParsedHelpCommand
  | ParsedErrorCommand;

const maxTextLength = 1000;

function error(command: string, message: string): ParsedErrorCommand {
  return { type: "error", command, message };
}

function parsePositiveInteger(
  value: string,
  min: number,
  max: number,
): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return parsed >= min && parsed <= max ? parsed : null;
}

function parseExercises(details: string | null): WorkoutExercise[] {
  if (!details) {
    return [];
  }

  return details
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((part) => {
      const match = part.match(/^(.*?)\s*(\d+)\s*[x×]\s*(\d+)\s*$/i);
      if (!match) {
        return { name: part.slice(0, 80) };
      }

      return {
        name: match[1].trim().slice(0, 80) || "Exercise",
        sets: Number(match[2]),
        reps: Number(match[3]),
      };
    });
}

function parseGym(body: string): ParsedCommand {
  const [main = "", detailPart] = body.split("|", 2);
  const tokens = main.trim().split(/\s+/).filter(Boolean);
  const split = tokens.shift()?.trim();

  if (!split) {
    return error("gym", "Add a split, for example `/gym push 45 | bench 4x8`.");
  }

  let durationMinutes: number | null = null;
  if (tokens[0] && /^\d+$/.test(tokens[0])) {
    durationMinutes = parsePositiveInteger(tokens.shift() as string, 1, 600);
    if (durationMinutes === null) {
      return error("gym", "Workout duration must be between 1 and 600 minutes.");
    }
  }

  const notes = tokens.join(" ").trim();
  const details = detailPart?.trim() ?? "";

  return {
    type: "gym",
    split: split.slice(0, 40),
    durationMinutes,
    exercises: parseExercises(details),
    notes: notes ? notes.slice(0, 300) : null,
  };
}

function parseRead(body: string): ParsedCommand {
  const trimmed = body.trim();
  if (!trimmed) {
    return error(
      "read",
      "Add a title and pages, for example `/read Dune 32 45`.",
    );
  }

  let title = "";
  let numberTokens: string[] = [];

  const quoted = trimmed.match(/^["“](.+?)["”]\s*(.*)$/);
  if (quoted) {
    title = quoted[1].trim();
    numberTokens = quoted[2].trim().split(/\s+/).filter(Boolean);
  } else {
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    const numbers: number[] = [];

    while (
      tokens.length > 1 &&
      numbers.length < 2 &&
      /^\d+$/.test(tokens[tokens.length - 1])
    ) {
      numbers.unshift(Number(tokens.pop()));
    }

    title = tokens.join(" ").trim();
    numberTokens = numbers.map(String);
  }

  if (!title) {
    return error("read", "Reading title is required.");
  }

  if (numberTokens.length === 0) {
    return error("read", "Add the pages read, for example `/read Dune 32`.");
  }

  const parsedNumbers = numberTokens
    .slice(0, 2)
    .map((value) => parsePositiveInteger(value, 1, 5000));

  if (parsedNumbers.some((value) => value === null)) {
    return error("read", "Pages must be between 1 and 5000.");
  }

  const pages = parsedNumbers[0] as number;
  const minutes =
    parsedNumbers.length > 1 ? (parsedNumbers[1] as number) : null;

  if (minutes !== null && minutes > 1440) {
    return error("read", "Reading minutes must be between 1 and 1440.");
  }

  return {
    type: "read",
    title: title.slice(0, 200),
    pages,
    minutes,
  };
}

function parseEat(body: string): ParsedCommand {
  const tokens = body.trim().split(/\s+/).filter(Boolean);
  const calories = tokens[0]
    ? parsePositiveInteger(tokens[0], 1, 10000)
    : null;

  if (calories === null) {
    return error(
      "eat",
      "Add calories first, for example `/eat 620 45 60 20 chicken bowl`.",
    );
  }

  tokens.shift();

  const macros: number[] = [];
  while (
    tokens.length > 0 &&
    macros.length < 3 &&
    /^\d+$/.test(tokens[0])
  ) {
    const macro = parsePositiveInteger(tokens.shift() as string, 0, 1000);
    if (macro === null) {
      return error("eat", "Each macro must be between 0 and 1000 grams.");
    }
    macros.push(macro);
  }

  const description = tokens.join(" ").trim();

  return {
    type: "eat",
    calories,
    protein: macros[0] ?? 0,
    carbs: macros[1] ?? 0,
    fat: macros[2] ?? 0,
    description: description ? description.slice(0, 200) : null,
  };
}

export function parseTelegramCommand(text: string): ParsedCommand | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("/")) {
    return null;
  }

  const [head, ...rest] = trimmed.split(/\s+/);
  const command = head.slice(1).split("@")[0]?.toLowerCase();
  const body = rest.join(" ").slice(0, maxTextLength);

  switch (command) {
    case "gym":
      return parseGym(body);
    case "read":
      return parseRead(body);
    case "eat":
      return parseEat(body);
    case "help":
    case "start":
      return { type: "help" };
    default:
      return error(
        command ?? "unknown",
        "That command is not recognized. Use /gym, /read, /eat, or /help.",
      );
  }
}

export const helpText = [
  "Dashboard of Me commands:",
  "",
  "/gym <split> [minutes] [| exercise details]",
  "  /gym push 45 | bench 4x8, cable fly 3x12",
  "",
  "/read <title> <pages> [minutes]",
  '  /read Dune 32 45',
  '  /read "The Name of the Wind" 24 40',
  "",
  "/eat <calories> [protein] [carbs] [fat] [description]",
  "  /eat 620 45 60 20 chicken bowl",
].join("\n");
