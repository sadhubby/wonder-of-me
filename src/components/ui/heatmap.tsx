"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityCalendar } from "react-activity-calendar";

import { sliceHeatmapWeeks, type HeatmapDay } from "@/lib/heatmap";

type HeatmapProps = {
  data: HeatmapDay[];
  variant: "gym" | "reading";
  unit: string;
};

const blockSize = 9;
const blockMargin = 2;
const weekdayLabelWidth = 24;
const weekdayLabelGap = 8;
const monthLabelHeight = 19;
const fontSize = 11;
const maxVisibleWeeks = 52;
const weekdayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

const themes: Record<"gym" | "reading", { dark: string[] }> = {
  gym: {
    dark: [
      "var(--color-heat-gym-0)",
      "var(--color-heat-gym-1)",
      "var(--color-heat-gym-2)",
      "var(--color-heat-gym-3)",
      "var(--color-heat-gym-4)",
    ],
  },
  reading: {
    dark: [
      "var(--color-heat-reading-0)",
      "var(--color-heat-reading-1)",
      "var(--color-heat-reading-2)",
      "var(--color-heat-reading-3)",
      "var(--color-heat-reading-4)",
    ],
  },
};

type CalendarProps = {
  data: HeatmapDay[];
  variant: "gym" | "reading";
  unit: string;
  blockSize: number;
};

function Calendar({ data, variant, unit, blockSize }: CalendarProps) {
  return (
    <ActivityCalendar
      data={data}
      colorScheme="dark"
      theme={themes[variant]}
      blockSize={blockSize}
      blockMargin={blockMargin}
      blockRadius={2}
      fontSize={fontSize}
      showWeekdayLabels={false}
      showTotalCount={false}
      labels={{
        legend: {
          less: "Less",
          more: "More",
        },
      }}
      tooltips={{
        activity: {
          text: (activity) => {
            const date = new Date(`${activity.date}T12:00:00`).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            );

            return activity.count > 0
              ? `${activity.count} ${unit} · ${date}`
              : `No activity · ${date}`;
          },
        },
      }}
    />
  );
}

export function Heatmap({ data, variant, unit }: HeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const width = Math.floor(entry.contentRect.width);
      setContainerWidth((current) => (current === width ? current : width));
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const availableCalendarWidth = Math.max(
    1,
    containerWidth - weekdayLabelWidth - weekdayLabelGap,
  );
  const visibleWeeks =
    containerWidth === 0
      ? maxVisibleWeeks
      : Math.max(
          1,
          Math.min(
            maxVisibleWeeks,
            Math.floor(
              (availableCalendarWidth + blockMargin) /
                (blockSize + blockMargin),
            ),
          ),
        );
  const visibleBlockSize =
    containerWidth === 0
      ? blockSize
      : Math.max(
          blockSize,
          (availableCalendarWidth + blockMargin) / visibleWeeks - blockMargin,
        );
  const visibleData = useMemo(
    () => sliceHeatmapWeeks(data, visibleWeeks),
    [data, visibleWeeks],
  );

  return (
    <div ref={containerRef} className="flex w-full min-w-0 items-start">
      <div
        aria-hidden="true"
        className="grid shrink-0 text-right text-text-secondary"
        style={{
          width: weekdayLabelWidth,
          marginRight: weekdayLabelGap,
          paddingTop: monthLabelHeight + Math.ceil(fontSize * 0.1),
          gridTemplateRows: `repeat(7, ${visibleBlockSize + blockMargin}px)`,
          fontSize,
          lineHeight: 1,
        }}
      >
        {weekdayLabels.map((label, index) => (
          <span key={index} className="flex items-center justify-end">
            {label}
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <Calendar
          data={visibleData}
          variant={variant}
          unit={unit}
          blockSize={visibleBlockSize}
        />
      </div>
    </div>
  );
}
