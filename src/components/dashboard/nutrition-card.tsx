import { Flame, Target, UtensilsCrossed } from "lucide-react";

import { Card, CardHeading, ProgressBar } from "@/components/ui/card";
import { Code, Label, Metric } from "@/components/ui/typography";
import type { NutritionSummary } from "@/db/queries";

type NutritionCardProps = {
  nutrition: NutritionSummary;
};

export function NutritionCard({ nutrition }: NutritionCardProps) {
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
      text: "text-coral-ink",
    },
    {
      label: "Carbs",
      value: totals.carbs,
      target: targets.carbs,
      bar: "bg-gold",
      text: "text-gold-ink",
    },
    {
      label: "Fat",
      value: totals.fat,
      target: targets.fat,
      bar: "bg-sky",
      text: "text-sky-ink",
    },
  ];

  return (
    <Card variant="solid" glow="bg-accent-emerald/[0.055]" className="xl:col-span-5">
      <CardHeading
        icon={<Flame className="size-5 text-coral-ink" />}
        iconClassName="shadow-[inset_0_0_20px_rgba(225,29,72,0.12)]"
        title="Fuel for today"
      />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div
          className="relative mx-auto flex size-36 shrink-0 items-center justify-center rounded-full p-2 sm:mx-0"
          style={{
            background: `conic-gradient(var(--color-accent-emerald) ${caloriePercent * 3.6}deg, rgba(255,255,255,0.065) 0deg)`,
          }}
          role="img"
          aria-label={`${caloriePercent}% of daily calorie target consumed`}
        >
          <div className="flex size-full flex-col items-center justify-center rounded-full border border-white/[0.05] bg-surface">
            <Metric as="span" size="lg">
              {totals.calories.toLocaleString("en-US")}
            </Metric>
            <Label as="span">kcal eaten</Label>
            <span className="mt-1.5 text-[0.65rem] font-medium text-accent-emerald-ink">
              {caloriePercent}% of target
            </span>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-1">
          <div>
            <Label>Remaining</Label>
            <Metric className="mt-1">
              {remainingCalories.toLocaleString("en-US")}
              <span className="ml-1 text-xs font-normal text-text-secondary">
                kcal
              </span>
            </Metric>
          </div>
          <div>
            <Label>Daily target</Label>
            <Metric className="mt-1">
              {targets.calories.toLocaleString("en-US")}
              <span className="ml-1 text-xs font-normal text-text-secondary">
                kcal
              </span>
            </Metric>
          </div>
        </div>
      </div>

      <div className="mt-7 space-y-4">
        <Label className="inline-flex items-center gap-2">
          <Target className="size-3.5" aria-hidden="true" />
          Macro split
        </Label>

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
                <span className="text-xs tabular-nums text-text-secondary">
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
          Log meals with <Code>/eat 620 45 60 20 chicken bowl</Code>. Macros are
          optional.
        </p>
      </div>
    </Card>
  );
}
