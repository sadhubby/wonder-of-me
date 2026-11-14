# Deployment

Target setup: Turso for the database, Vercel for the Next.js app, Telegram for writes.

## 1. Create the Turso database

Install the [Turso CLI](https://docs.turso.tech/cli/introduction) and authenticate, then:

```bash
turso db create dashboard-of-me
turso db show dashboard-of-me --url
turso db tokens create dashboard-of-me
```

Save the URL as `TURSO_DATABASE_URL` and the token as `TURSO_AUTH_TOKEN`.

## 2. Apply migrations and seed

From the project root, set the production database credentials in `.env.local` temporarily:

```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
```

Then run:

```bash
npm run db:migrate
npm run db:seed
```

The seed is idempotent. Skip it if you prefer an empty dashboard.

## 3. Configure Vercel

Import the repository into Vercel and add these environment variables for Production (and Preview if desired):

```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token

TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_WEBHOOK_SECRET=your-long-random-secret
TELEGRAM_CHAT_ID=123456789

DASHBOARD_TIMEZONE=America/Los_Angeles
DAILY_CALORIE_TARGET=2200
DAILY_PROTEIN_TARGET=150
DAILY_CARBS_TARGET=250
DAILY_FAT_TARGET=70

PORTFOLIO_URL=https://your-portfolio.example
GARDEN_URL=https://your-garden.example

APP_URL=https://your-dashboard.vercel.app
```

Notes:

- **Do not use `file:./local.db` on Vercel.** Serverless filesystems are ephemeral. Production must point at Turso.
- `APP_URL` is used by the webhook helper script, not by the running app.
- `TELEGRAM_CHAT_ID` accepts comma-separated IDs.
- `DASHBOARD_TIMEZONE` should be your IANA timezone so `/gym`, `/read`, and `/eat` land on the correct local date.

Deploy. The default build command (`npm run build`) is correct.

## 4. Register the webhook

Locally, with the production bot values in `.env.local`:

```bash
npm run telegram:set-webhook
```

This registers:

```text
https://your-dashboard.vercel.app/api/telegram
```

and sets the secret token plus the bot command menu.

## 5. Verify

1. Open the deployed dashboard. The static shell should appear immediately, then the data should stream in.
2. Send `/help` to the bot. You should receive the command reference.
3. Send `/gym push 45 | bench 4x8`.
4. Refresh the dashboard. The gym heatmap and recent splits should update.
5. Check Vercel function logs if the bot does not reply.

### Health endpoint

Use `GET /api/health` for uptime checks:

```bash
curl -i https://wonder-of-me.vercel.app/api/health
```

The endpoint returns `200` with `{"ok":true,"database":"ok"}` when the
application can connect to its database. It returns `503` with
`{"ok":false,"database":"unavailable"}` when configuration or database
connectivity is unavailable. It does not expose credentials, SQL details, or
personal data.

## Local development

```bash
cp .env.example .env.local
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

With `TURSO_DATABASE_URL` blank or set to `file:./local.db`, the app uses local SQLite. Telegram is optional locally; without its env vars the webhook returns `503` by design.

## Operational notes

- **Read-only UI.** No public mutation routes exist outside the authenticated Telegram webhook.
- **No caching of telemetry.** The snapshot is request-time. The static shell is safe to cache; data is streamed.
- **Backups.** Use Turso's backup/export features or `turso db dump` for periodic snapshots.
- **Secrets.** Never expose Turso or Telegram credentials with `NEXT_PUBLIC_`.
- **Rotating the webhook secret.** Update `TELEGRAM_WEBHOOK_SECRET`, redeploy, then rerun `npm run telegram:set-webhook` so Telegram sends the new token.
- **Spotify.** Live playback is intentionally stubbed. See [Architecture → Spotify seam](./architecture.md#spotify-seam).

## Production checklist

- [ ] Turso database created
- [ ] Migrations applied
- [ ] Seed run or real data loaded
- [ ] Vercel environment variables set
- [ ] `DASHBOARD_TIMEZONE` matches your local day boundary
- [ ] Telegram bot created and chat ID allowlisted
- [ ] Webhook registered with the secret token
- [ ] `/help`, `/gym`, `/read`, and `/eat` tested
- [ ] Dashboard shows live data after a webhook write
