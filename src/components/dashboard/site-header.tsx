import { Activity, LockKeyhole, Send } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="flex flex-col gap-5 pb-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="relative flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(16,185,129,0.18),rgba(139,92,246,0.16))] shadow-[0_0_40px_-12px_rgba(16,185,129,0.55)]">
          <Activity className="size-6 text-accent-emerald" aria-hidden="true" />
          <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-canvas bg-accent-emerald" />
        </div>
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-text-secondary">
            Personal telemetry
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-text-primary sm:text-3xl">
            Dashboard of Me
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-text-secondary">
          <LockKeyhole className="size-3.5" aria-hidden="true" />
          Read-only public view
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-text-secondary">
          <Send className="size-3.5 text-accent-emerald" aria-hidden="true" />
          Telegram → Turso
        </span>
      </div>
    </header>
  );
}
