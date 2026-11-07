import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.string().url().optional(),
);

const dashboardConfigSchema = z.object({
  timezone: z.string().min(1).default("UTC"),
  targets: z.object({
    calories: z.coerce.number().positive().default(2200),
    protein: z.coerce.number().positive().default(150),
    carbs: z.coerce.number().positive().default(250),
    fat: z.coerce.number().positive().default(70),
  }),
  links: z.object({
    portfolio: optionalUrl,
    garden: optionalUrl,
  }),
});

export type DashboardConfig = z.infer<typeof dashboardConfigSchema>;
export type NutritionTargets = DashboardConfig["targets"];

let cachedConfig: DashboardConfig | null = null;

export function getDashboardConfig(): DashboardConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const parsed = dashboardConfigSchema.parse({
    timezone: process.env.DASHBOARD_TIMEZONE,
    targets: {
      calories:
        process.env.DAILY_CALORIE_TARGET ?? process.env.DAILY_CALORIES_TARGET,
      protein: process.env.DAILY_PROTEIN_TARGET,
      carbs: process.env.DAILY_CARBS_TARGET,
      fat: process.env.DAILY_FAT_TARGET,
    },
    links: {
      portfolio: process.env.PORTFOLIO_URL,
      garden: process.env.GARDEN_URL,
    },
  });

  cachedConfig = parsed;
  return parsed;
}

export function getStaticLinks(): DashboardConfig["links"] {
  try {
    return getDashboardConfig().links;
  } catch {
    return { portfolio: undefined, garden: undefined };
  }
}
