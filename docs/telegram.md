# Telegram gateway

Telegram is the only write surface for the dashboard. The webhook validates a secret header, allowlists your chat, parses a slash command, writes through Drizzle, and replies with a confirmation.

## 1. Create the bot

1. Open [@BotFather](https://t.me/BotFather) in Telegram.
2. Send `/newbot`, choose a name and username.
3. Save the HTTP API token as `TELEGRAM_BOT_TOKEN`.

## 2. Find your chat ID

Send any message to your new bot, then open:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates
```

Look for `message.chat.id`. For a private chat this is usually a positive number; for groups it is negative. Set it as `TELEGRAM_CHAT_ID`.

Multiple allowlisted chats are supported with a comma-separated value:

```env
TELEGRAM_CHAT_ID=123456789,-1001234567890
```

## 3. Set environment variables

```env
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_WEBHOOK_SECRET=generate-a-long-random-string
TELEGRAM_CHAT_ID=123456789
APP_URL=https://your-dashboard.vercel.app
```

Generate a secret with something like:

```bash
openssl rand -hex 32
```

## 4. Register the webhook and bot commands

After the app is deployed:

```bash
npm run telegram:set-webhook
```

The script:

- registers `${APP_URL}/api/telegram`
- sends `secret_token` as `TELEGRAM_WEBHOOK_SECRET`
- restricts allowed updates to `message`
- registers `/gym`, `/read`, `/eat`, and `/help` in the Telegram command menu

If you change the secret, rerun the script. Telegram only accepts the secret when the webhook is registered.

## Command grammar

### `/gym`

```text
/gym <split> [duration_minutes] [| exercise details]
```

Examples:

```text
/gym push 45 | bench press 4x8, cable fly 3x12
/gym legs 60
/gym conditioning | rowing intervals 6x1
```

- `split` is required and capped at 40 characters.
- Duration is optional, 1–600 minutes.
- Details after `|` are split on commas.
- A trailing `sets x reps` pattern is parsed into JSON: `{ name, sets, reps }`.
- Free text before `|` is stored as notes.

### `/read`

```text
/read <title> <pages> [minutes]
/read "<title with spaces>" <pages> [minutes]
```

Examples:

```text
/read Dune 32 45
/read "The Name of the Wind" 24 40
/read Piranesi 18
```

- Trailing numbers are pages, then optional minutes.
- If the title does not exist, a book row is created with status `reading`.
- Existing books are matched case-insensitively and marked `reading`.
- Pages must be 1–5000; minutes must be 1–1440.

### `/eat`

```text
/eat <calories> [protein_g] [carbs_g] [fat_g] [description]
```

Examples:

```text
/eat 620 45 60 20 chicken bowl
/eat 450 35 40 12
```

- Each command appends a meal to today.
- Missing macros default to `0`.
- The reply includes today's running totals and remaining calories against `DAILY_CALORIE_TARGET`.

### `/help`

Returns the command reference, also available as `/start`.

## Security model

- `X-Telegram-Bot-Api-Secret-Token` must match `TELEGRAM_WEBHOOK_SECRET`.
- Comparison is timing-safe: both values are SHA-256 hashed, then compared with `crypto.timingSafeEqual`.
- Only `TELEGRAM_CHAT_ID` entries are accepted. Other chats receive `403` and no database write.
- The dashboard has no write routes or Server Actions.
- Parsed values are bounded before they reach the database.
- Telegram replies use plain text to avoid HTML/Markdown injection issues.

## Local testing

You can test the webhook route without Telegram once the route has env configured:

```bash
curl -i -X POST http://localhost:3000/api/telegram \
  -H "content-type: application/json" \
  -H "x-telegram-bot-api-secret-token: $TELEGRAM_WEBHOOK_SECRET" \
  -d '{"message":{"chat":{"id":123},"text":"/help"}}'
```

Expected behavior without configuration: `503` with a generic “not configured” message. With a wrong secret: `401`. With a non-allowlisted chat: `403`.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Bot does not respond | Confirm the webhook is registered and `APP_URL` is public HTTPS |
| `401` in logs | Secret mismatch; rerun `npm run telegram:set-webhook` |
| `403` in logs | Chat ID is not in `TELEGRAM_CHAT_ID` |
| `503` | Telegram env vars missing in the deployment |
| Data not appearing | Run migrations, confirm Turso URL/token, check Vercel function logs |
| Commands show in Telegram but fail | Check `DASHBOARD_TIMEZONE`; log dates are based on it |

Telegram retries failed deliveries. The route returns `200` for ignored or malformed updates after authentication so that bad payloads do not create retry loops.
