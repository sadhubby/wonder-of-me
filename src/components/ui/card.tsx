import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
  variant?: "glass" | "solid";
  glow?: string;
};

export function Card({
  children,
  className,
  variant = "glass",
  glow,
}: CardProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[28px] p-5 transition-colors duration-300 sm:p-6",
        variant === "glass" ? "glass-card" : "solid-card",
        className,
      )}
    >
      {glow ? (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full blur-3xl",
            glow,
          )}
        />
      ) : null}
      <div className="relative z-10 flex h-full min-w-0 flex-col">
        {children}
      </div>
    </article>
  );
}

type CardHeadingProps = {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  action?: ReactNode;
  iconClassName?: string;
};

export function CardHeading({
  icon,
  eyebrow,
  title,
  action,
  iconClassName,
}: CardHeadingProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035]",
            iconClassName,
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-text-secondary">
            {eyebrow}
          </p>
          <h2 className="truncate text-base font-semibold tracking-tight text-text-primary sm:text-lg">
            {title}
          </h2>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

type StatProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
};

export function Stat({ label, value, hint, className }: StatProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-text-secondary">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-text-primary">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type ProgressBarProps = {
  value: number;
  className?: string;
  barClassName?: string;
  label?: string;
};

export function ProgressBar({
  value,
  className,
  barClassName,
  label,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      aria-label={label}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-accent-emerald transition-[width] duration-700",
          barClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
