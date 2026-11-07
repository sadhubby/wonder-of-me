import { cn } from "@/lib/utils";

const cards = [
  { variant: "glass", className: "md:col-span-2 xl:col-span-7 h-[420px]" },
  { variant: "solid", className: "xl:col-span-5 h-[420px]" },
  { variant: "glass", className: "md:col-span-2 xl:col-span-7 h-[420px]" },
  { variant: "solid", className: "xl:col-span-5 h-[420px]" },
  { variant: "glass", className: "md:col-span-2 xl:col-span-8 h-[280px]" },
  { variant: "glass", className: "xl:col-span-4 h-[280px]" },
  { variant: "solid", className: "xl:col-span-3 h-[176px]" },
  { variant: "solid", className: "xl:col-span-3 h-[176px]" },
  { variant: "solid", className: "md:col-span-2 xl:col-span-6 h-[176px]" },
];

export function DashboardSkeleton() {
  return (
    <div
      className="space-y-5"
      aria-label="Loading dashboard"
      aria-busy="true"
    >
      <div className="flex items-center justify-between px-1">
        <div className="h-3 w-44 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-3 w-32 animate-pulse rounded-full bg-white/[0.06]" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-12">
        {cards.map((card, index) => (
          <div
            key={index}
            className={cn(
              "rounded-[28px] p-6",
              card.variant === "glass" ? "glass-card" : "solid-card",
              card.className,
            )}
          >
            <div className="flex items-center gap-3">
              <div className="size-10 animate-pulse rounded-2xl bg-white/[0.05]" />
              <div className="space-y-2">
                <div className="h-2 w-20 animate-pulse rounded-full bg-white/[0.05]" />
                <div className="h-3 w-32 animate-pulse rounded-full bg-white/[0.07]" />
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, statIndex) => (
                <div key={statIndex} className="space-y-2">
                  <div className="h-2 w-16 animate-pulse rounded-full bg-white/[0.05]" />
                  <div className="h-7 w-20 animate-pulse rounded-lg bg-white/[0.06]" />
                </div>
              ))}
            </div>
            <div className="mt-7 h-24 animate-pulse rounded-2xl bg-white/[0.035]" />
          </div>
        ))}
      </div>
    </div>
  );
}
