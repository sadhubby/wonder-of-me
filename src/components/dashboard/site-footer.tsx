export function SiteFooter() {
  return (
    <footer className="mt-2 flex flex-col gap-2 border-t border-white/[0.06] py-5 text-xs text-text-secondary sm:flex-row sm:items-center sm:justify-between">
      <p>Built for one. Read-only by design.</p>
      <p className="font-mono tracking-tight">
        gym · read · eat → Telegram → Turso → Next.js
      </p>
    </footer>
  );
}
