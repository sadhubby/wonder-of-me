import { Flame, Target, UtensilsCrossed } from "lucide-react";

import { Card, CardHeading, ProgressBar } from "@/components/ui/card";
import type { NutritionSummary } from "@/db/queries";
import { formatLongDate } from "@/lib/date";

type NutritionCardProps = {
  nutrition: NutritionSummary;
  today: string;
};

export function NutritionCard({ nutrition, today }: NutritionCardProps) {
  const { totals, targets, remainingCalories } = nutrition;
  const caloriePercent = Math.min(
    100,
    Math.round((totals.calories / targets.calories) * 100),
  );

  const macros = [
    {
      label: "Protein",
      value: totals.protein,
      target: targets.protein,
      bar: "bg-coral",
      text: "text-coral",
    },
    {
      label: "Carbs",
      value: totals.carbs,
      target: targets.carbs,
      bar: "bg-gold",
      text: "text-gold",
    },
    {
      label: "Fat",
      value: totals.fat,
      target: targets.fat,
      bar: "bg-sky",
      text: "text-sky",
    },
  ];

  return (
    <Card variant="solid" glow="bg-accent-emerald/[0.055]" className="xl:col-span-5">
      <CardHeading
        icon={<Flame className="size-5 text-coral" />}
        iconClassName="shadow-[inset_0_0_20px_rgba(255,126,95,0.08)]"
        eyebrow="Nutrition"
        title="Fuel for today"
        action={
          <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[0.65rem] text-text-secondary">
            {formatLongDate(today)}
          </span>
        }
      />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div
          className="relative mx-auto flex size-36 shrink-0 items-center justify-center rounded-full p-2 sm:mx-0"
          style={{
            background: `conic-gradient(#10b981 ${caloriePercent * 3.6}deg, rgba(255,255,255,0.065) 0deg)`,
          }}
          role="img"
          aria-label={`${caloriePercent}% of daily calorie target consumed`}
        >
          <div className="flex size-full flex-col items-center justify-center rounded-full border border-white/[0.05] bg-[#0c0e1d]">
            <span className="font-mono text-3xl font-semibold tracking-tight text-text-primary">
              {totals.calories.toLocaleString("en-US")}
            </span>
            <span className="text-[0.65rem] uppercase tracking-[0.18em] text-text-secondary">
              kcal eaten
            </span>
            <span className="mt-1.5 rounded-full bg-accent-emerald/10 px-2 py-0.5 text-[0.65rem] font-medium text-accent-emerald">
              {caloriePercent}% of target
            </span>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-1">
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-text-secondary">
              Remaining
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-text-primary">
              {remainingCalories.toLocaleString("en-US")}
              <span className="ml-1 text-xs font-normal text-text-secondary">
                kcal
              </span>
            </p>
          </div>
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-text-secondary">
              Daily target
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-text-primary">
              {targets.calories.toLocaleString("en-US")}
              <span className="ml-1 text-xs font-normal text-text-secondary">
                kcal
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 space-y-4">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-text-secondary">
            <Target className="size-3.5" aria-hidden="true" />
            Macro split
          </p>
          <span className="text-[0.65rem] text-text-secondary">grams / target</span>
        </div>

        {macros.map((macro) => {
          const percent = Math.min(
            100,
            Math.round((macro.value / macro.target) * 100),
          );

          return (
            <div key={macro.label} className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className={`text-sm font-medium ${macro.text}`}>
                  {macro.label}
                </span>
                <span className="font-mono text-xs text-text-secondary">
                  <span className="text-text-primary">{macro.value}</span> /{" "}
                  {macro.target}g
                </span>
              </div>
              <ProgressBar
                value={percent}
                barClassName={macro.bar}
                label={`${macro.label}: ${percent}% of target`}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex items-start gap-2.5 pt-6 text-xs leading-relaxed text-text-secondary">
        <UtensilsCrossed
          className="mt-0.5 size-3.5 shrink-0 text-peach"
          aria-hidden="true"
        />
        <p>
          Log meals with{" "}
          <span className="font-mono text-text-primary">
            /eat 620 45 60 20 chicken bowl
          </span>
          . Macros are optional.
        </p>
      </div>
    </Card>
  );
}
