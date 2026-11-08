import { Dumbbell, Timer, TrendingUp } from "lucide-react";

import { Card, CardHeading, Stat } from "@/components/ui/card";
import { Heatmap } from "@/components/ui/heatmap";
import { Code, Label } from "@/components/ui/typography";
import type { GymSummary } from "@/db/queries";
import { formatShortDate } from "@/lib/date";

type GymHeatmapCardProps = {
  gym: GymSummary;
};

export function GymHeatmapCard({ gym }: GymHeatmapCardProps) {
  return (
    <Card glow="bg-accent-emerald/10" className="md:col-span-2 xl:col-span-7">
      <CardHeading
        icon={<Dumbbell className="size-5 text-accent-emerald-ink" />}
        iconClassName="shadow-[inset_0_0_20px_rgba(245,158,11,0.12)]"
        title="Gym consistency"
      />

      <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
        <Stat label="Workouts" value={gym.totalWorkouts} />
        <Stat label="Sets logged" value={gym.totalSets} />
        <Stat label="Favorite split" value={gym.favoriteSplit ?? "—"} />
        <Stat
          label="Latest session"
          value={
            gym.recent[0] ? formatShortDate(gym.recent[0].date) : "—"
          }
        />
      </div>

      <div className="inset-panel mt-6 p-3 sm:p-4">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-text-secondary">
          <TrendingUp className="size-3.5" aria-hidden="true" />
          <span>Recent activity</span>
        </div>
        <Heatmap
          data={gym.heatmap}
          variant="gym"
          unit="min"
        />
      </div>

      <div className="mt-auto pt-5">
        <Label as="p" className="mb-3 flex items-center gap-2">
          <Timer className="size-3.5" aria-hidden="true" />
          Recent splits
        </Label>
        {gym.recent.length > 0 ? (
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-secondary">
            {gym.recent.slice(0, 4).map((workout) => (
              <span key={workout.id} className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent-emerald" />
                <span className="font-medium text-text-primary">{workout.split}</span>
                <span>{formatShortDate(workout.date)}</span>
                {workout.durationMinutes ? (
                  <span>{workout.durationMinutes}m</span>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            No sessions yet. Send <Code>/gym</Code> from Telegram to start the
            graph.
          </p>
        )}
      </div>
    </Card>
  );
}
