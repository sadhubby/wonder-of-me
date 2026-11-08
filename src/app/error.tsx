"use client";

import { CircleAlert, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div className="solid-card flex w-full flex-col items-center rounded-[28px] px-6 py-10">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-coral/10">
          <CircleAlert className="size-6 text-coral-ink" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-text-primary">
          The dashboard hit a snag
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
          {error.message || "An unexpected error interrupted the telemetry feed."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="glass-button mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-text-primary"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    </div>
  );
}
