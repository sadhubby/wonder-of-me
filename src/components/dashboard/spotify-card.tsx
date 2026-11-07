import { AudioLines, Music2, Radio } from "lucide-react";

import { Card, CardHeading } from "@/components/ui/card";

const bars = [0.55, 0.9, 0.4, 1, 0.65, 0.8, 0.45];

export function SpotifyCard() {
  return (
    <Card glow="bg-accent-spotify/10" className="xl:col-span-4">
      <CardHeading
        icon={<Music2 className="size-5 text-accent-spotify" />}
        iconClassName="shadow-[inset_0_0_20px_rgba(29,185,84,0.08)]"
        eyebrow="Listening"
        title="Now playing"
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-text-secondary">
            <span className="size-1.5 rounded-full bg-accent-spotify" />
            Spotify
          </span>
        }
      />

      <div className="flex flex-1 flex-col justify-center">
        <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-black/15 p-3">
          <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-[linear-gradient(145deg,rgba(29,185,84,0.18),rgba(59,45,107,0.4))]">
            <Music2 className="size-7 text-white/35" aria-hidden="true" />
            <div className="absolute bottom-2 left-2 right-2 flex h-5 items-end gap-1">
              {bars.map((height, index) => (
                <span
                  key={index}
                  className="equalizer-bar flex-1 rounded-sm bg-accent-spotify/55"
                  style={{
                    height: `${height * 100}%`,
                    animationDelay: `${index * 0.13}s`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">
              Nothing playing
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-text-primary">
              Spotify is not connected
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
              Live playback will appear here once Spotify credentials are wired
              up.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.08] px-3 py-3 text-[0.65rem] uppercase tracking-[0.16em] text-text-secondary">
          <Radio className="size-3.5 text-accent-spotify/70" aria-hidden="true" />
          Player shell ready
          <AudioLines className="size-3.5 text-accent-spotify/70" aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}
