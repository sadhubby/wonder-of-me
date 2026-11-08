import Image from "next/image";
import { Camera } from "lucide-react";

import { site } from "@/lib/site";

export function AboutSection() {
  return (
    <section
      aria-labelledby="about-heading"
      className="glass-card relative overflow-hidden rounded-card p-5 sm:p-6 lg:p-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-accent-violet/15 blur-3xl"
      />
      <div className="relative grid gap-6 sm:gap-8 md:grid-cols-[minmax(240px,0.85fr)_1.15fr] md:items-center lg:gap-12">
        <div className="relative aspect-[4/3] overflow-hidden rounded-panel border border-white/15 bg-[linear-gradient(145deg,rgba(244,114,182,0.2),rgba(245,158,11,0.16))] shadow-[0_0_50px_-24px_rgba(244,114,182,0.5)] md:aspect-[4/5]">
          {site.portraitUrl ? (
            <Image
              src={site.portraitUrl}
              alt={`Portrait of ${site.name}`}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-3 border border-dashed border-white/20 text-center text-text-secondary">
              <Camera className="size-8 text-accent-violet-ink" aria-hidden="true" />
              <span className="text-sm font-medium">Your portrait goes here</span>
              <span className="text-xs text-text-secondary/75">
                Photo coming soon
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 py-1 md:py-6">
          <p className="text-eyebrow font-medium uppercase tracking-[0.2em] text-accent-violet-ink">
            A little about me
          </p>
          <h2
            id="about-heading"
            className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-text-primary sm:text-3xl"
          >
            The person behind the dashboard
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
            {site.description}
          </p>
        </div>
      </div>
    </section>
  );
}
