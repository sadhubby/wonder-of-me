"use client";

import { ActivityCalendar } from "react-activity-calendar";

import type { HeatmapDay } from "@/lib/heatmap";

type HeatmapProps = {
  data: HeatmapDay[];
  variant: "gym" | "reading";
  unit: string;
};

const themes: Record<"gym" | "reading", { dark: string[] }> = {
  gym: {
    dark: ["#101b1b", "#064e3b", "#047857", "#10b981", "#6ee7b7"],
  },
  reading: {
    dark: ["#171529", "#4c1d95", "#6d28d9", "#8b5cf6", "#c4b5fd"],
  },
};

export function Heatmap({ data, variant, unit }: HeatmapProps) {
  return (
    <div className="w-full overflow-x-auto pb-1 [scrollbar-width:thin]">
      <div className="min-w-[650px]">
        <ActivityCalendar
          data={data}
          colorScheme="dark"
          theme={themes[variant]}
          blockSize={10}
          blockMargin={3}
          blockRadius={2}
          fontSize={11}
          showWeekdayLabels={["mon", "wed", "fri"]}
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
      </div>
    </div>
  );
}
