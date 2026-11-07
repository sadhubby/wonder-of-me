import { describe, expect, it } from "vitest";

import { buildHeatmap, calculateStreaks, levelForValue } from "./heatmap";

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

  it("calculates current and longest streaks", () => {
    expect(
      calculateStreaks(
        ["2026-11-05", "2026-11-04", "2026-11-03", "2026-10-01"],
        "2026-11-05",
      ),
    ).toEqual({ current: 3, longest: 3 });
  });

  it("allows a current streak to end yesterday", () => {
    expect(
      calculateStreaks(["2026-11-04", "2026-11-03"], "2026-11-05"),
    ).toEqual({ current: 2, longest: 2 });
  });
});
