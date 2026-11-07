import { z } from "zod";

const databaseEnvSchema = z.object({
  url: z.string().min(1).default("file:./local.db"),
  authToken: z.string().min(1).optional(),
});

const telegramEnvSchema = z.object({
  token: z.string().min(1),
  webhookSecret: z.string().min(1),
  chatIds: z.array(z.string().min(1)).min(1),
});

export type DatabaseConfig = z.infer<typeof databaseEnvSchema>;
export type TelegramConfig = z.infer<typeof telegramEnvSchema>;

export class MissingEnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingEnvironmentError";
  }
}

export function getDatabaseConfig(): DatabaseConfig {
  return databaseEnvSchema.parse({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });
}

export function getTelegramConfig(): TelegramConfig {
  const parsed = telegramEnvSchema.safeParse({
    token: process.env.TELEGRAM_BOT_TOKEN,
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
    chatIds: (process.env.TELEGRAM_CHAT_ID ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  });

  if (!parsed.success) {
    throw new MissingEnvironmentError(
      "TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, and TELEGRAM_CHAT_ID are required.",
    );
  }

  return parsed.data;
}
