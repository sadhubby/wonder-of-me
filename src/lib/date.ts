import { addDays, format, parseISO } from "date-fns";

export function getDateInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function getTodayInTimeZone(timeZone: string): string {
  return getDateInTimeZone(new Date(), timeZone);
}

export function getLastDates(today: string, days: number): string[] {
  const end = parseISO(today);
  return Array.from({ length: days }, (_, index) =>
    format(addDays(end, index - (days - 1)), "yyyy-MM-dd"),
  );
}

export function formatShortDate(date: string): string {
  return format(parseISO(date), "MMM d");
}

export function formatLongDate(date: string): string {
  return format(parseISO(date), "EEEE, MMMM d");
}
