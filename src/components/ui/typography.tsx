import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type LabelProps = {
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
};

export function Label({ children, className, as: Tag = "p" }: LabelProps) {
  return (
    <Tag
      className={cn(
        "text-eyebrow font-medium uppercase tracking-eyebrow text-text-secondary",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

const metricSizes = {
  sm: "text-metric-sm",
  md: "text-metric",
  lg: "text-metric-lg",
} as const;

type MetricProps = {
  children: ReactNode;
  className?: string;
  as?: "p" | "span";
  size?: keyof typeof metricSizes;
};

export function Metric({
  children,
  className,
  as: Tag = "p",
  size = "md",
}: MetricProps) {
  return (
    <Tag
      className={cn(
        "font-sans font-semibold tracking-tight tabular-nums text-text-primary",
        metricSizes[size],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

type CodeProps = {
  children: ReactNode;
  className?: string;
};

export function Code({ children, className }: CodeProps) {
  return (
    <code className={cn("font-mono text-[0.9em] text-text-primary", className)}>
      {children}
    </code>
  );
}

type HintProps = {
  children: ReactNode;
  className?: string;
  as?: "p" | "span";
};

export function Hint({ children, className, as: Tag = "p" }: HintProps) {
  return (
    <Tag
      className={cn("text-caption leading-relaxed text-text-secondary", className)}
    >
      {children}
    </Tag>
  );
}
