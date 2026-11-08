import Image from "next/image";
import { LockKeyhole, Send } from "lucide-react";

import { site } from "@/lib/site";

export function Hero() {
  return (
    <header className="glass-bar relative overflow-hidden rounded-card px-5 py-5 sm:px-6 sm:py-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-accent-violet/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-accent-emerald/15 blur-3xl"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-[1.4rem] border border-white/20 bg-[linear-gradient(145deg,rgba(244,114,182,0.35),rgba(245,158,11,0.25))] shadow-[0_0_50px_-16px_rgba(244,114,182,0.65)] sm:size-24">
          {site.portraitUrl ? (
            <Image
              src={site.portraitUrl}
              alt={`Portrait of ${site.name}`}
              fill
              sizes="96px"
              className="object-cover"
              priority
            />
          ) : (
            <span className="flex size-full items-center justify-center text-2xl font-semibold tracking-[-0.04em] text-text-primary sm:text-3xl">
              WM
            </span>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-text-primary sm:text-4xl">
            {site.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
            {site.description}
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-text-secondary">
            <LockKeyhole className="size-3.5" aria-hidden="true" />
            Read-only
            <span className="text-text-secondary/50" aria-hidden="true">
              ·
            </span>
            <Send
              className="size-3.5 text-accent-emerald-ink"
              aria-hidden="true"
            />
            Telegram → Turso
          </p>
        </div>
      </div>
    </header>
  );
}
