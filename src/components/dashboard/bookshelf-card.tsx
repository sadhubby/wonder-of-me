import Image from "next/image";
import { BookOpen, Library } from "lucide-react";

import { Card, CardHeading, ProgressBar } from "@/components/ui/card";
import type { BookSummary } from "@/db/queries";

type BookshelfCardProps = {
  books: BookSummary[];
};

export function BookshelfCard({ books }: BookshelfCardProps) {
  return (
    <Card variant="solid" glow="bg-accent-violet/[0.045]" className="xl:col-span-5">
      <CardHeading
        icon={<Library className="size-5 text-accent-violet" />}
        iconClassName="shadow-[inset_0_0_20px_rgba(139,92,246,0.08)]"
        eyebrow="On the nightstand"
        title="Active bookshelf"
        action={
          <span className="rounded-full border border-accent-violet/20 bg-accent-violet/[0.06] px-2.5 py-1 text-[0.65rem] font-medium text-accent-violet">
            {books.length} reading
          </span>
        }
      />

      {books.length > 0 ? (
        <div className="space-y-4">
          {books.slice(0, 4).map((book) => (
            <div key={book.id} className="flex gap-3">
              <div className="relative h-[72px] w-12 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[linear-gradient(150deg,rgba(139,92,246,0.25),rgba(26,67,78,0.35))]">
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
                      className="size-5 text-accent-violet/70"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 py-0.5">
                <p className="truncate text-sm font-medium text-text-primary">
                  {book.title}
                </p>
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
                      {book.loggedPages.toLocaleString("en-US")} pages logged
                    </span>
                    <span className="font-mono text-text-primary">
                      {book.progress !== null
                        ? `${book.progress}%`
                        : book.totalPages
                          ? `${book.totalPages} pp`
                          : "in progress"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] px-6 py-10 text-center">
          <BookOpen className="size-6 text-accent-violet/70" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-text-primary">
            The shelf is empty
          </p>
          <p className="mt-1 max-w-[24ch] text-xs leading-relaxed text-text-secondary">
            Log a reading session from Telegram with{" "}
            <span className="font-mono text-text-primary">/read</span>.
          </p>
        </div>
      )}
    </Card>
  );
}
