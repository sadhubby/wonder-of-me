import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Code, Label } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type LinkTileProps = {
  title: string;
  description: string;
  href?: string;
  icon: ReactNode;
  accentClassName: string;
  emptyHint: string;
  className?: string;
};

export function LinkTile({
  title,
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
        "group/tile min-h-[176px] transition-colors hover:border-white/30",
        className,
      )}
    >
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Open ${title}`}
          className="absolute inset-0 z-20 rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        />
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-panel border border-white/[0.12] bg-black/[0.08]",
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
          <Label as="span">Not set</Label>
        )}
      </div>

      <div className="mt-auto pt-6">
        <h2 className="text-lg font-semibold tracking-tight text-text-primary">
          {title}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
          {description}
        </p>
        {!href ? (
          <p className="mt-3 text-[0.65rem] text-text-secondary">
            Set <Code>{emptyHint}</Code> in your environment
          </p>
        ) : null}
      </div>
    </Card>
  );
}
