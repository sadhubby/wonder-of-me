import { BookOpen, BookMarked, Clock3, TrendingUp } from "lucide-react";

import { Card, CardHeading, Stat } from "@/components/ui/card";
import { Heatmap } from "@/components/ui/heatmap";
import { Code, Label } from "@/components/ui/typography";
import type { ReadingSummary } from "@/db/queries";
import { formatShortDate } from "@/lib/date";

type ReadingHeatmapCardProps = {
  reading: ReadingSummary;
};

export function ReadingHeatmapCard({ reading }: ReadingHeatmapCardProps) {
  return (
    <Card glow="bg-accent-violet/10" className="md:col-span-2 xl:col-span-7">
      <CardHeading
        icon={<BookOpen className="size-5 text-accent-violet-ink" />}
        iconClassName="shadow-[inset_0_0_20px_rgba(244,114,182,0.12)]"
        title="Reading velocity"
      />

      <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
        <Stat
          label="Pages logged"
          value={reading.totalPages.toLocaleString("en-US")}
        />
        <Stat label="Active days" value={reading.activeDays} />
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
        />
        <Stat label="Books finished" value={reading.booksFinished} />
      </div>

      <div className="inset-panel mt-6 p-3 sm:p-4">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-text-secondary">
          <TrendingUp className="size-3.5" aria-hidden="true" />
          <span>Recent activity</span>
        </div>
        <Heatmap
          data={reading.heatmap}
          variant="reading"
          unit="pages"
        />
      </div>

      <div className="mt-auto pt-5">
        <Label as="p" className="mb-3 flex items-center gap-2">
          <BookMarked className="size-3.5" aria-hidden="true" />
          Latest reading logs
        </Label>
        {reading.recent.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {reading.recent.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="inset-tile flex items-center gap-3 px-3 py-2"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-control bg-accent-violet/10 text-accent-violet-ink">
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
            No logs yet. Send <Code>/read</Code> from Telegram to start the graph.
          </p>
        )}
      </div>
    </Card>
  );
}
