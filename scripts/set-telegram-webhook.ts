import { loadEnv } from "../src/lib/load-env";

loadEnv();

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const appUrl = process.env.APP_URL ?? process.env.WEBHOOK_URL;

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is required.");
  process.exit(1);
}

if (!secret) {
  console.error("TELEGRAM_WEBHOOK_SECRET is required.");
  process.exit(1);
}

if (!appUrl) {
  console.error("APP_URL is required. Example: https://your-dashboard.vercel.app");
  process.exit(1);
}

const webhookUrl = `${appUrl.replace(/\/$/, "")}/api/telegram`;

async function telegram(method: string, payload: Record<string, unknown>) {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/${method}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const body = (await response.json().catch(() => null)) as {
    ok?: boolean;
    description?: string;
  } | null;

  if (!response.ok || !body?.ok) {
    throw new Error(
      `${method} failed (${response.status}): ${body?.description ?? "Unknown error"}`,
    );
  }

  return body;
}

async function main() {
  await telegram("setWebhook", {
    url: webhookUrl,
    secret_token: secret,
    allowed_updates: ["message"],
  });

  await telegram("setMyCommands", {
    commands: [
      {
        command: "gym",
        description: "Log a workout: /gym push 45 | bench 4x8",
      },
      {
        command: "read",
        description: "Log reading: /read Dune 32 45",
      },
      {
        command: "eat",
        description: "Log a meal: /eat 620 45 60 20 chicken bowl",
      },
      {
        command: "help",
        description: "Show the command reference",
      },
    ],
  });

  console.log(`Webhook registered: ${webhookUrl}`);
  console.log("Bot commands registered.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
