# Roadmap

Implementation plan for the dashboard. Phase 0 is external setup only. Phases 1–7 cover code, tests, content, and operations.

## Status of the four external connections

The Telegram and Turso integrations are already implemented in the scaffold. Spotify is not.

| # | Connection | Status |
| --- | --- | --- |
| 1 | Telegram → Next.js inbound webhook | Implemented in `src/app/api/telegram/route.ts`; secret check and chat allowlist included |
| 2 | Next.js → Telegram `sendMessage` reply | Implemented in `src/lib/telegram/send.ts`, called from the webhook route |
| 3 | Next.js → Turso via Drizzle | Implemented in `src/db/index.ts` and `src/lib/env.ts` |
| 4 | Next.js → Spotify Web API | Missing; `spotify` is `null` in queries and the card is a static shell |

Turbo is not a connection. It is an optional task runner and is not present or required for this single-app project.

---

## Phase 0 — External setup only

No code changes. Create accounts, credentials, and databases, deploy the app, and register the webhook.

### 0.1 External services inventory

| Service | Required now? | Why | What you get |
| --- | --- | --- | --- |
| Turso | Yes for production; optional for local | Production database | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` |
| Telegram / BotFather | Yes | Only write surface | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, webhook secret |
| Vercel | Yes for the webhook | Telegram requires a public HTTPS URL | `APP_URL` |
| GitHub | Already configured | Vercel deploys from it | — |
| Spotify Developer | No, Phase 3 | Live now-playing | Future `SPOTIFY_*` |
| Scryfall / OpenLibrary | No account needed | Deck/book cover images | Public URLs already allowlisted in `next.config.ts` |
| Google Fonts | No account needed | Geist fonts at build time | — |
| cloudflared / ngrok | Optional | Local webhook testing | Temporary HTTPS URL |
| Sentry / Vercel Analytics | No, later | Monitoring | — |
| Upstash / Redis / auth provider / email | Not used | — | — |

### 0.2 Turso setup (production database)

Install the CLI on Linux:

```bash
curl -sSfL https://get.tur.so/install.sh | bash
# open a new shell, then:
turso auth signup   # or: turso auth login
```

Create the database and credentials:

```bash
turso db create wonder-of-me
turso db show wonder-of-me --url
turso db tokens create wonder-of-me
```

Create `.env.local` (never commit it):

```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

Apply the existing migration and seed:

```bash
npm install
npm run db:migrate
npm run db:seed        # optional sample data
```

Verify the tables exist:

```bash
turso db shell wonder-of-me "select name from sqlite_master where type='table';"
```

Expected: `gym_workouts`, `books`, `reading_logs`, `meals`, `mtg_decks`, and `__drizzle_migrations`.

Drizzle is not an external app. It is already installed as a library plus the `drizzle-kit` CLI and only needs the two Turso values above. The initial SQL migration already exists at `drizzle/0000_numerous_vanisher.sql`.

### 0.3 Telegram bot setup

1. Open [@BotFather](https://t.me/BotFather), send `/newbot`, pick a name and a username ending in `bot`.
2. Save the HTTP API token as `TELEGRAM_BOT_TOKEN`.
3. Open your new bot and send `/start` (the bot cannot message you first).
4. Get your chat ID:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates"
```

Use `message.chat.id` as `TELEGRAM_CHAT_ID`. Private chats are positive; groups are negative.

5. Generate the webhook secret:

```bash
openssl rand -hex 32
```

6. Add to `.env.local`:

```env
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_WEBHOOK_SECRET=<generated-secret>
TELEGRAM_CHAT_ID=123456789
APP_URL=https://your-dashboard.vercel.app
```

### 0.4 Vercel setup

1. Import `sadhubby/wonder-of-me` into Vercel.
2. Add all production env vars:

```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEBHOOK_SECRET=...
TELEGRAM_CHAT_ID=...
APP_URL=https://your-dashboard.vercel.app
DASHBOARD_TIMEZONE=America/Los_Angeles
DAILY_CALORIE_TARGET=2200
DAILY_PROTEIN_TARGET=150
DAILY_CARBS_TARGET=250
DAILY_FAT_TARGET=70
PORTFOLIO_URL=https://...
GARDEN_URL=https://...
```

3. Deploy.
4. **Important:** if Vercel Deployment Protection / Vercel Authentication is enabled, Telegram requests will be blocked. Production must be publicly reachable.
5. Never use `file:./local.db` on Vercel; serverless storage is ephemeral.

### 0.5 Register the webhook

After the deployment is live, run locally:

```bash
npm run telegram:set-webhook
```

This registers `https://<APP_URL>/api/telegram`, sets the secret token, and registers the `/gym`, `/read`, `/eat`, and `/help` command menu.

Verify:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

Check that the URL is correct, `pending_update_count` is `0`, and there is no `last_error_message`.

### 0.6 End-to-end test

Send the bot:

```text
/help
/gym push 45 | bench press 4x8, cable fly 3x12
/read Dune 32 45
/eat 620 45 60 20 chicken bowl
```

Then verify in Turso:

```bash
turso db shell wonder-of-me "select * from gym_workouts order by id desc limit 3;"
turso db shell wonder-of-me "select * from reading_logs order by id desc limit 3;"
turso db shell wonder-of-me "select * from meals order by id desc limit 3;"
```

Refresh the dashboard. The heatmaps and nutrition card should update.

### 0.7 Local-only alternative

If you only want to see the app first, you do not need Turso or Telegram yet:

```bash
cp .env.example .env.local
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

With no `TURSO_DATABASE_URL`, it uses `file:./local.db`. Telegram returns `503` until configured, and that is expected.

### 0.8 Gotchas

- **One webhook per bot.** Switching between a tunnel and production means rerunning `set-webhook`.
- **Changing the secret** requires rerunning `npm run telegram:set-webhook`.
- **Node version:** use Node `>=20.12` (ideally 22 LTS). The scripts use `process.loadEnvFile`, which was added in Node 20.12; Next itself only requires 20.9.
- **Chat allowlist:** a wrong `TELEGRAM_CHAT_ID` makes the webhook return `403`.
- **Secrets:** only `.env.example` belongs in Git; `.env.local` must stay ignored.
- **Telegram retries:** duplicate-write protection is not in the scaffold yet; that is Phase 2.
- **Vercel env changes** usually require a redeploy.
- **Preview deployments** share the production Turso DB unless you create a separate preview database.

### 0.9 Phase 0 exit checklist

- [ ] Turso database created and credentials saved
- [ ] Migration applied; all five app tables exist
- [ ] Seed run or intentionally skipped
- [ ] Local app connects successfully
- [ ] Telegram bot created; bot token and chat ID captured
- [ ] Webhook secret generated
- [ ] Vercel project imported with all env vars
- [ ] Production deployment live and unprotected
- [ ] `getWebhookInfo` reports no errors
- [ ] `/help`, `/gym`, `/read`, `/eat` all reply
- [ ] Database rows created and dashboard updated
- [ ] `DASHBOARD_TIMEZONE` matches your real day boundary

---

## Phase 1 — Repo hygiene and CI

- Fix `.gitignore` (remove duplicate `.env.example` ignore).
- Add `.nvmrc` and `engines.node >=20.12.0` (Next 16 requires 20.9; scripts require 20.12).
- Add `.github/workflows/ci.yml`: `npm ci`, lint, typecheck, test, build.
- Add a `check` script aggregating lint/typecheck/test.
- Optional: Prettier + format check; Dependabot/Renovate.
- Confirm `package-lock.json` stays committed; only `node_modules/`, build outputs, local DB, and env files are ignored.

## Phase 2 — Telegram hardening and completion

- **Fix duplicate writes:** Telegram retries updates. Add an `update_id` dedupe table (`telegram_updates`) and skip already-processed updates.
- **Transactions:** wrap multi-step `/read` (book upsert + reading log) in a transaction.
- **Race-safe books:** use `insert … onConflict` instead of select-then-insert; make title uniqueness case-insensitive.
- **Missing commands:** at minimum `/undo`, `/status`, `/book`, `/finish`. Decide whether `/decks` and `/target` are in scope.
- **Reply reliability:** handle Telegram `429 retry_after`, split messages over 4096 characters, log failures.
- **Local development:** add `scripts/telegram-poll.ts` using `getUpdates` so you can test without a public HTTPS webhook; keep the existing webhook for production.
- **Tests:** handler tests, route tests (secret/allowlist/error paths), mocked Telegram API.

## Phase 3 — Spotify live playback

- Add `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` to `.env.example` and docs.
- Add `src/lib/spotify/`: token refresh against `accounts.spotify.com/api/token`, access-token cache, `getNowPlaying()`.
- Add `scripts/spotify-auth.ts` to obtain the refresh token and document scopes/redirect URI.
- Add `i.scdn.co` to `next.config.ts` `images.remotePatterns`.
- Replace `spotify: null` in queries; cache now-playing for ~15–30 seconds to avoid rate limits.
- Update `SpotifyCard` to accept real data: track, artist, art, progress, link; fall back to recently played/empty.
- Verify the Next 16 Cache Components pattern (`use cache` / `cacheLife`) in `node_modules/next/dist/docs/` before implementing caching.

## Phase 4 — Database and real content

- Add migration for `telegram_updates`; add NOCASE title uniqueness (or normalized title).
- Enable `PRAGMA foreign_keys = ON` on the LibSQL connection (cascade deletes currently rely on it).
- Improve seed idempotency (table-count checks can skip partially seeded data).
- Replace sample books/decks/logs with real content.
- Add backup/export instructions (`turso db dump`).

## Phase 5 — UI, SEO, content

- Replace the static Spotify shell only after Phase 3.
- Add `manifest.ts`, `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`, `not-found.tsx`, `loading.tsx`.
- Add real screenshots/GIF and a "current status/roadmap" section to README.
- Optional extra link tiles (GitHub, LinkedIn, email) driven by env config.
- Accessibility pass on heatmap tooltips and keyboard navigation.

## Phase 6 — Operations

- Add `/api/health` for DB connectivity.
- Add error monitoring (Sentry) and analytics (Vercel).
- Separate preview-deployment database from production.
- Optional per-chat rate limiting.

## Phase 7 — Turbo (only if needed)

- Single app → do nothing.
- Monorepo → `apps/web`, `apps/bot`, `packages/db`, `packages/core`, root `turbo.json`; configure Vercel root/build command accordingly.

**Recommended order:** Phase 1 → 2 → 3 → 4 → 5 → 6. Skip Phase 7 unless you add a second deployable service.

**Definition of done per phase:** lint, typecheck, tests, and production build pass; webhook tested end-to-end with curl and a real Telegram message; docs updated.
