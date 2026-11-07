import { BookOpen, BookMarked, Clock3, Flame, TrendingUp } from "lucide-react";

import { Card, CardHeading, Stat } from "@/components/ui/card";
import { Heatmap } from "@/components/ui/heatmap";
import type { ReadingSummary } from "@/db/queries";
import { formatShortDate } from "@/lib/date";

type ReadingHeatmapCardProps = {
  reading: ReadingSummary;
};

export function ReadingHeatmapCard({ reading }: ReadingHeatmapCardProps) {
  return (
    <Card glow="bg-accent-violet/10" className="md:col-span-2 xl:col-span-7">
      <CardHeading
        icon={<BookOpen className="size-5 text-accent-violet" />}
        iconClassName="shadow-[inset_0_0_20px_rgba(139,92,246,0.08)]"
        eyebrow="Reading log"
        title="Reading velocity"
        action={
          <span className="hidden items-center gap-1.5 rounded-full border border-accent-violet/20 bg-accent-violet/[0.06] px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-accent-violet sm:inline-flex">
            <Flame className="size-3" aria-hidden="true" />
            {reading.currentStreak}d streak
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
        <Stat
          label="Pages logged"
          value={reading.totalPages.toLocaleString("en-US")}
          hint="All-time"
        />
        <Stat
          label="Active days"
          value={reading.activeDays}
          hint="Days with a log"
        />
        <Stat
          label="Daily average"
          value={
            <>
              {reading.averagePagesPerActiveDay}
              <span className="ml-1 text-sm font-normal text-text-secondary">
                pp/day
              </span>
            </>
          }
          hint="On active days"
        />
        <Stat
          label="Books finished"
          value={reading.booksFinished}
          hint="All-time"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-white/[0.06] bg-black/10 p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="size-3.5" aria-hidden="true" />
            Last 365 days
          </span>
          <span className="font-mono text-[0.7rem]">
            {reading.totalPages.toLocaleString("en-US")} pages
          </span>
        </div>
        <Heatmap data={reading.heatmap} variant="reading" unit="pages" />
      </div>

      <div className="mt-auto pt-5">
        <div className="mb-3 flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-text-secondary">
          <BookMarked className="size-3.5" aria-hidden="true" />
          Latest reading logs
        </div>
        {reading.recent.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {reading.recent.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-violet/10 text-accent-violet">
                  <BookOpen className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-text-primary">
                    {log.title}
                  </p>
                  <p className="flex items-center gap-1.5 text-[0.65rem] text-text-secondary">
                    <span>{formatShortDate(log.date)}</span>
                    <span className="size-0.5 rounded-full bg-text-secondary/50" />
                    <span>{log.pages} pages</span>
                    {log.minutes ? (
                      <>
                        <span className="size-0.5 rounded-full bg-text-secondary/50" />
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="size-2.5" aria-hidden="true" />
                          {log.minutes}m
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            No logs yet. Send <span className="font-mono text-text-primary">/read</span>{" "}
            from Telegram to start the graph.
          </p>
        )}
      </div>
    </Card>
  );
}
