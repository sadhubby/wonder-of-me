import { BriefcaseBusiness, CircleAlert, Sprout } from "lucide-react";

import type { DashboardSnapshot } from "@/db/queries";
import { formatLongDate } from "@/lib/date";

import { BookshelfCard } from "./bookshelf-card";
import { CommandGuideCard } from "./command-guide-card";
import { DeckVault } from "./deck-vault";
import { GymHeatmapCard } from "./gym-heatmap-card";
import { LinkTile } from "./link-tile";
import { NutritionCard } from "./nutrition-card";
import { ReadingHeatmapCard } from "./reading-heatmap-card";
import { SpotifyCard } from "./spotify-card";

type DashboardProps = {
  data: DashboardSnapshot;
};

export function Dashboard({ data }: DashboardProps) {
  return (
    <div className="space-y-5">
      <div className="glass-bar flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs text-text-secondary">
        <span>
          Snapshot for{" "}
          <span className="text-text-primary">{formatLongDate(data.today)}</span>
        </span>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em]">
          {data.timezone} · live from Turso
        </span>
      </div>

      {!data.status.ok ? (
        <div
          role="status"
          className="solid-card flex items-start gap-3 rounded-2xl px-4 py-3 text-sm text-text-secondary"
        >
          <CircleAlert
            className="mt-0.5 size-4 shrink-0 text-gold-ink"
            aria-hidden="true"
          />
          <p>{data.status.message}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-12">
        <GymHeatmapCard gym={data.gym} />
        <NutritionCard nutrition={data.nutrition} />
        <ReadingHeatmapCard reading={data.reading} />
        <BookshelfCard books={data.books} />
        <DeckVault decks={data.decks} />
        <SpotifyCard />

        <LinkTile
          title="Portfolio"
          eyebrow="Selected work"
          description="The polished case studies, experiments, and shipped products."
          href={data.links.portfolio}
          icon={<BriefcaseBusiness className="size-5" />}
          accentClassName="text-coral-ink"
          emptyHint="PORTFOLIO_URL"
          className="xl:col-span-3"
        />

        <LinkTile
          title="Digital garden"
          eyebrow="Notes in progress"
          description="Half-formed ideas, permanent notes, and the reading trail behind them."
          href={data.links.garden}
          icon={<Sprout className="size-5" />}
          accentClassName="text-sky-ink"
          emptyHint="GARDEN_URL"
          className="xl:col-span-3"
        />

        <CommandGuideCard />
      </div>
    </div>
  );
}
