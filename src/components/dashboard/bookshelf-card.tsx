import Image from "next/image";
import { BookOpen, Library } from "lucide-react";

import { Card, CardHeading, ProgressBar } from "@/components/ui/card";
import { Code, Label } from "@/components/ui/typography";
import type { BookSummary } from "@/db/queries";
import { formatShortDate } from "@/lib/date";

type BookshelfCardProps = {
  books: BookSummary[];
};

const statusLabels: Record<BookSummary["status"], string> = {
  reading: "Reading",
  finished: "Finished",
  paused: "Paused",
};

export function BookshelfCard({ books }: BookshelfCardProps) {
  return (
    <Card variant="solid" glow="bg-accent-violet/[0.045]" className="xl:col-span-5">
      <CardHeading
        icon={<Library className="size-5 text-accent-violet-ink" />}
        iconClassName="shadow-[inset_0_0_20px_rgba(244,114,182,0.12)]"
        title="Library"
      />

      {books.length > 0 ? (
        <div className="space-y-4">
          {books.map((book) => (
            <div key={book.id} className="flex gap-3">
              <div className="relative h-[72px] w-12 shrink-0 overflow-hidden rounded-control border border-white/[0.1] bg-[linear-gradient(150deg,rgba(244,114,182,0.28),rgba(225,29,72,0.35))]">
                {book.coverUrl ? (
                  <Image
                    src={book.coverUrl}
                    alt={`Cover of ${book.title}`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen
                      className="size-5 text-accent-violet-ink/70"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 py-0.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {book.title}
                  </p>
                  <Label
                    as="span"
                    className="shrink-0 rounded-full bg-accent-violet/10 px-2 py-1 text-[0.55rem] text-accent-violet-ink"
                  >
                    {statusLabels[book.status]}
                  </Label>
                </div>
                <p className="truncate text-xs text-text-secondary">
                  {book.author ?? "Unknown author"}
                </p>

                <div className="mt-2.5 space-y-1.5">
                  <ProgressBar
                    value={book.progress ?? 0}
                    barClassName="bg-accent-violet"
                    label={
                      book.progress !== null
                        ? `${book.progress}% complete`
                        : "Reading progress"
                    }
                  />
                  <div className="flex items-center justify-between text-[0.65rem] text-text-secondary">
                    <span>
                      {book.loggedPages.toLocaleString("en-US")} pages
                      {book.totalPages ? ` / ${book.totalPages.toLocaleString("en-US")}` : " logged"}
                    </span>
                    <span className="tabular-nums text-text-primary">
                      {book.progress !== null
                        ? `${book.progress}%`
                        : "Pages logged"}
                    </span>
                  </div>
                  {book.startedAt ? (
                    <p className="text-[0.65rem] text-text-secondary">
                      Started {formatShortDate(book.startedAt)}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center rounded-panel border border-dashed border-white/[0.08] px-6 py-10 text-center">
          <BookOpen className="size-6 text-accent-violet-ink/70" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-text-primary">
            The library is empty
          </p>
          <p className="mt-1 max-w-[24ch] text-xs leading-relaxed text-text-secondary">
            Log a reading session from Telegram with <Code>/read</Code>.
          </p>
        </div>
      )}
    </Card>
  );
}
