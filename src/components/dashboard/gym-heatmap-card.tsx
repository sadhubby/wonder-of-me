import { Dumbbell, Flame, Timer, TrendingUp } from "lucide-react";

import { Card, CardHeading, Stat } from "@/components/ui/card";
import { Heatmap } from "@/components/ui/heatmap";
import type { GymSummary } from "@/db/queries";
import { formatShortDate } from "@/lib/date";

type GymHeatmapCardProps = {
  gym: GymSummary;
};

export function GymHeatmapCard({ gym }: GymHeatmapCardProps) {
  return (
    <Card glow="bg-accent-emerald/10" className="md:col-span-2 xl:col-span-7">
      <CardHeading
        icon={<Dumbbell className="size-5 text-accent-emerald" />}
        iconClassName="shadow-[inset_0_0_20px_rgba(16,185,129,0.08)]"
        eyebrow="Training log"
        title="Gym consistency"
        action={
          <span className="hidden items-center gap-1.5 rounded-full border border-accent-emerald/20 bg-accent-emerald/[0.06] px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-accent-emerald sm:inline-flex">
            <Flame className="size-3" aria-hidden="true" />
            {gym.currentStreak}d streak
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
        <Stat
          label="Current streak"
          value={
            <>
              {gym.currentStreak}
              <span className="ml-1 text-sm font-normal text-text-secondary">
                days
              </span>
            </>
          }
        />
        <Stat
          label="Longest"
          value={
            <>
              {gym.longestStreak}
              <span className="ml-1 text-sm font-normal text-text-secondary">
                days
              </span>
            </>
          }
        />
        <Stat
          label="Favorite split"
          value={gym.favoriteSplit ?? "—"}
          hint={`${gym.totalWorkouts} sessions logged`}
        />
        <Stat
          label="Total volume"
          value={
            <>
              {gym.totalSets}
              <span className="ml-1 text-sm font-normal text-text-secondary">
                sets
              </span>
            </>
          }
          hint="All-time"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-white/[0.06] bg-black/10 p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="size-3.5" aria-hidden="true" />
            Last 365 days
          </span>
          <span className="font-mono text-[0.7rem]">{gym.totalWorkouts} sessions</span>
        </div>
        <Heatmap data={gym.heatmap} variant="gym" unit="min" />
      </div>

      <div className="mt-auto pt-5">
        <div className="mb-3 flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-text-secondary">
          <Timer className="size-3.5" aria-hidden="true" />
          Recent splits
        </div>
        {gym.recent.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {gym.recent.slice(0, 4).map((workout) => (
              <span
                key={workout.id}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent-emerald/25 hover:text-text-primary"
              >
                <span className="size-1.5 rounded-full bg-accent-emerald" />
                <span className="font-medium text-text-primary">{workout.split}</span>
                <span>{formatShortDate(workout.date)}</span>
                {workout.durationMinutes ? (
                  <span className="text-text-secondary/80">
                    {workout.durationMinutes}m
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            No sessions yet. Send <span className="font-mono text-text-primary">/gym</span>{" "}
            from Telegram to start the graph.
          </p>
        )}
      </div>
    </Card>
  );
}
