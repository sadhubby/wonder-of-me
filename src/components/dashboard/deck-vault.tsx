import Image from "next/image";
import { ArrowUpRight, Layers3, Sparkles } from "lucide-react";

import { Card, CardHeading } from "@/components/ui/card";
import type { DeckSummary } from "@/db/queries";
import type { MtgColor } from "@/db/schema";
import { cn } from "@/lib/utils";

type DeckVaultProps = {
  decks: DeckSummary[];
};

const colorMeta: Record<MtgColor, { label: string; className: string }> = {
  W: { label: "White", className: "bg-[#f4e8c1] text-[#3d3320]" },
  U: { label: "Blue", className: "bg-[#7dd3fc] text-[#0c2633]" },
  B: { label: "Black", className: "bg-[#7c6f9e] text-[#140f21]" },
  R: { label: "Red", className: "bg-coral text-[#3b140d]" },
  G: { label: "Green", className: "bg-accent-emerald text-[#052e22]" },
};

export function DeckVault({ decks }: DeckVaultProps) {
  return (
    <Card glow="bg-glow-indigo/25" className="md:col-span-2 xl:col-span-8">
      <CardHeading
        icon={<Layers3 className="size-5 text-sky" />}
        iconClassName="shadow-[inset_0_0_20px_rgba(104,176,171,0.08)]"
        eyebrow="Magic: The Gathering"
        title="Commander vault"
        action={
          <span className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-text-secondary sm:inline-flex">
            <Sparkles className="size-3 text-gold" aria-hidden="true" />
            {decks.length} decks
          </span>
        }
      />

      {decks.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {decks.slice(0, 6).map((deck) => (
            <div
              key={deck.id}
              className="group/deck relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/80"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,rgba(139,92,246,0.32),rgba(26,67,78,0.3))]">
                {deck.commanderArtUrl ? (
                  <Image
                    src={deck.commanderArtUrl}
                    alt={`Commander art for ${deck.commander}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 240px"
                    className="object-cover opacity-75 transition duration-500 group-hover/deck:scale-[1.04] group-hover/deck:opacity-90"
                  />
                ) : null}
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,8,17,0.96),rgba(7,8,17,0.08)_60%,transparent)]" />
                <div className="absolute inset-x-3 bottom-2.5">
                  <p className="truncate text-[0.65rem] uppercase tracking-[0.16em] text-text-secondary">
                    {deck.commander}
                  </p>
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {deck.name}
                  </p>
                </div>
                <div className="absolute right-3 top-3 flex gap-1">
                  {deck.colorIdentity.map((color) => (
                    <span
                      key={color}
                      title={colorMeta[color].label}
                      aria-label={colorMeta[color].label}
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full border border-black/20 text-[0.6rem] font-bold shadow-sm",
                        colorMeta[color].className,
                      )}
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <p className="line-clamp-1 text-[0.65rem] text-text-secondary">
                  {deck.notes ?? "Commander deck"}
                </p>
                {deck.decklistUrl ? (
                  <a
                    href={deck.decklistUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[0.65rem] font-medium text-text-secondary transition-colors hover:border-sky/30 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
                  >
                    Decklist
                    <ArrowUpRight className="size-3" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="text-[0.65rem] text-text-secondary/60">
                    No link
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] px-6 py-10 text-center">
          <Layers3 className="size-6 text-sky/70" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-text-primary">
            The vault is empty
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Run the seed script or add decks to the database.
          </p>
        </div>
      )}
    </Card>
  );
}
