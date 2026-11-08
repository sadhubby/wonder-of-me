import { describe, expect, it } from "vitest";

import {
  buildHeatmap,
  levelForValue,
  sliceHeatmapWeeks,
  sliceRecentHeatmap,
} from "./heatmap";

describe("heatmap helpers", () => {
  it("maps values to the expected levels", () => {
    const thresholds = [10, 25, 50] as const;

    expect(levelForValue(0, thresholds)).toBe(0);
    expect(levelForValue(5, thresholds)).toBe(1);
    expect(levelForValue(20, thresholds)).toBe(2);
    expect(levelForValue(60, thresholds)).toBe(4);
  });

  it("returns a full year of calendar days ending today", () => {
    const data = buildHeatmap(
      { "2026-11-05": 40 },
      {
        today: "2026-11-05",
        days: 365,
        thresholds: [10, 25, 50],
      },
    );

    expect(data).toHaveLength(365);
    expect(data[data.length - 1]).toEqual({
      date: "2026-11-05",
      count: 40,
      level: 3,
    });
  });

  it("slices the most recent range for compact calendars", () => {
    const data = buildHeatmap(
      {},
      {
        today: "2026-11-05",
        days: 365,
        thresholds: [10, 25, 50],
      },
    );

    const recent = sliceRecentHeatmap(data, 90);

    expect(recent).toHaveLength(90);
    expect(recent[recent.length - 1]?.date).toBe("2026-11-05");
    expect(recent[0]?.date).toBe("2026-08-08");
  });

  it("keeps a fixed number of Sunday-based columns and advances by a week", () => {
    const data = buildHeatmap(
      { "2026-11-05": 40 },
      {
        today: "2026-11-05",
        days: 365,
        thresholds: [10, 25, 50],
      },
    );
    const fourWeeks = sliceHeatmapWeeks(data, 4);
    const nextWeek = sliceHeatmapWeeks(
      buildHeatmap(
        {},
        {
          today: "2026-11-08",
          days: 365,
          thresholds: [10, 25, 50],
        },
      ),
      4,
    );

    expect(fourWeeks[0]?.date).toBe("2026-10-11");
    expect(fourWeeks).toHaveLength(26);
    expect(fourWeeks[fourWeeks.length - 1]?.date).toBe("2026-11-05");
    expect(nextWeek[0]?.date).toBe("2026-10-18");
    expect(nextWeek[nextWeek.length - 1]?.date).toBe("2026-11-08");
  });

  it("keeps the newest date when trimming the year to 52 columns", () => {
    const data = buildHeatmap(
      {},
      {
        today: "2026-11-05",
        days: 365,
        thresholds: [10, 25, 50],
      },
    );
    const trimmed = sliceHeatmapWeeks(data, 52);

    expect(trimmed[0]?.date).toBe("2025-11-09");
    expect(trimmed[trimmed.length - 1]?.date).toBe("2026-11-05");
    expect(trimmed).toHaveLength(362);
  });
});
