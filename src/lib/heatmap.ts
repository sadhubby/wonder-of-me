import { differenceInCalendarDays, parseISO } from "date-fns";

import { getLastDates } from "./date";

export type HeatmapDay = {
  date: string;
  count: number;
  level: number;
};

export type HeatmapOptions = {
  today: string;
  days?: number;
  thresholds: readonly [number, number, number];
};

export function levelForValue(
  value: number,
  thresholds: readonly [number, number, number],
): number {
  if (value <= 0) {
    return 0;
  }

  if (value < thresholds[0]) {
    return 1;
  }

  if (value < thresholds[1]) {
    return 2;
  }

  if (value < thresholds[2]) {
    return 3;
  }

  return 4;
}

export function buildHeatmap(
  valuesByDate: Readonly<Record<string, number>>,
  options: HeatmapOptions,
): HeatmapDay[] {
  return getLastDates(options.today, options.days ?? 365).map((date) => {
    const count = valuesByDate[date] ?? 0;
    return {
      date,
      count,
      level: levelForValue(count, options.thresholds),
    };
  });
}

export function calculateStreaks(
  dates: readonly string[],
  today: string,
): { current: number; longest: number } {
  const uniqueDates = [...new Set(dates)].sort();
  if (uniqueDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  let longest = 1;
  let run = 1;

  for (let index = 1; index < uniqueDates.length; index += 1) {
    const previous = parseISO(uniqueDates[index - 1]);
    const current = parseISO(uniqueDates[index]);

    if (differenceInCalendarDays(current, previous) === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  const lastDate = parseISO(uniqueDates[uniqueDates.length - 1]);
  const todayDate = parseISO(today);
  const daysSinceLast = differenceInCalendarDays(todayDate, lastDate);

  if (daysSinceLast > 1) {
    return { current: 0, longest };
  }

  let current = 1;
  for (let index = uniqueDates.length - 1; index > 0; index -= 1) {
    const later = parseISO(uniqueDates[index]);
    const earlier = parseISO(uniqueDates[index - 1]);

    if (differenceInCalendarDays(later, earlier) === 1) {
      current += 1;
    } else {
      break;
    }
  }

  return { current, longest: Math.max(longest, current) };
}
