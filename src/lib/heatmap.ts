import {
  eachDayOfInterval,
  format,
  parseISO,
  startOfWeek,
  subWeeks,
} from "date-fns";

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

export function sliceRecentHeatmap(
  data: readonly HeatmapDay[],
  days = 90,
): HeatmapDay[] {
  return data.slice(-days);
}

export function sliceHeatmapWeeks(
  data: readonly HeatmapDay[],
  weeks: number,
): HeatmapDay[] {
  if (!Number.isInteger(weeks) || weeks < 1) {
    throw new RangeError("Heatmap weeks must be a positive integer.");
  }

  const lastDay = data[data.length - 1];
  if (!lastDay) {
    throw new RangeError("Heatmap data must not be empty.");
  }

  const end = parseISO(lastDay.date);
  const start = startOfWeek(subWeeks(end, weeks - 1), { weekStartsOn: 0 });
  const valuesByDate = new Map(data.map((day) => [day.date, day]));

  return eachDayOfInterval({ start, end }).map((day) => {
    const date = format(day, "yyyy-MM-dd");
    return (
      valuesByDate.get(date) ?? {
        date,
        count: 0,
        level: 0,
      }
    );
  });
}
