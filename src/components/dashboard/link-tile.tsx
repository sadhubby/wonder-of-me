import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LinkTileProps = {
  title: string;
  eyebrow: string;
  description: string;
  href?: string;
  icon: ReactNode;
  accentClassName: string;
  emptyHint: string;
  className?: string;
};

export function LinkTile({
  title,
  eyebrow,
  description,
  href,
  icon,
  accentClassName,
  emptyHint,
  className,
}: LinkTileProps) {
  return (
    <Card
      variant="solid"
      className={cn(
        "group/tile min-h-[176px] transition-colors hover:border-white/[0.14]",
        className,
      )}
    >
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Open ${title}`}
          className="absolute inset-0 z-20 rounded-[28px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
        />
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]",
            accentClassName,
          )}
        >
          {icon}
        </div>
        {href ? (
          <ArrowUpRight
            className="size-4 text-text-secondary transition-transform duration-300 group-hover/tile:-translate-y-0.5 group-hover/tile:translate-x-0.5 group-hover/tile:text-text-primary"
            aria-hidden="true"
          />
        ) : (
          <span className="rounded-full border border-white/[0.07] bg-white/[0.02] px-2 py-1 text-[0.6rem] uppercase tracking-[0.14em] text-text-secondary">
            Not set
          </span>
        )}
      </div>

      <div className="mt-auto pt-6">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-text-secondary">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-text-primary">
          {title}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
          {description}
        </p>
        {!href ? (
          <p className="mt-3 font-mono text-[0.65rem] text-text-secondary/70">
            Set {emptyHint} in your environment
          </p>
        ) : null}
      </div>
    </Card>
  );
}
