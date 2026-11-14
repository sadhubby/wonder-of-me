# Roadmap

Implementation plan for the dashboard. Phase 0 is external setup only. Phases 1–7 cover code, tests, content, and operations.

## Branch naming convention

Use one focused branch per code change, based on the Conventional Commits
category:

| Work type | Branch prefix | Example |
| --- | --- | --- |
| New capability | `feat/` | `feat/health-endpoint` |
| Bug fix | `fix/` | `fix/telegram-retry` |
| Tests | `test/` | `test/telegram-webhook` |
| Maintenance or tooling | `chore/` | `chore/production-verification` |
| Documentation | `docs/` | `docs/deployment-guide` |
| Refactor | `refactor/` | `refactor/database-config` |

Operational actions such as applying migrations, configuring Vercel variables,
and registering the Telegram webhook do not need branches. Keep branch names
lowercase, short, and hyphen-separated.

## Progress checklist

- [x] Implement the core dashboard, database-backed summaries, and basic Telegram webhook.
- [ ] Complete production setup and verify the live Telegram-to-dashboard flow.
- [ ] Harden Telegram writes and complete the planned bot commands.
- [x] Replace the active-reading shelf with a full Library.
- [ ] Complete the remaining Spotify, database, UI, and operations work below.

## Immediate post-deployment plan

These are the next actions after the first Vercel deployment. The production
database should remain empty until real content is entered; do not run
`npm run db:seed`.

1. **Production verification** — operational, no branch required:
   - Confirm all Vercel environment variables, including
     `DASHBOARD_TIMEZONE=Asia/Singapore` and
     `APP_URL=https://wonder-of-me.vercel.app`.
   - Run `npm run db:migrate` against the intended production Turso database.
   - Run `npm run telegram:set-webhook` after the deployed URL is available.
   - Test `/help`, `/gym`, `/read`, `/eat`, and `/undo`; inspect Vercel logs.
   - Rotate any credential exposed during setup, update Vercel and local
     environment variables, redeploy, and register the webhook again.
   - Suggested branch for any deployment-only fixes:
     `chore/production-verification`.

2. **Continuous integration** — branch:
   `chore/ci-workflow`.
   Add GitHub Actions for `npm ci`, tests, typecheck, lint, and build.

3. **Health endpoint** — branch: `feat/health-endpoint`.
   Add `/api/health` to verify application availability, required
   configuration, and Turso connectivity.

4. **Lint cleanup** — branch: `fix/spotify-unused-import` — complete.
   Remove the existing unused `Label` import and verify a clean lint run.

5. **Real content** — branch: `feat/real-content`.
   Replace sample/static books, decks, links, and other personal content with
   real values. Do not populate production with the seed script.

6. **Production operations** — branch: `chore/production-operations`.
   Document Turso backups, separate preview and production databases, and add
   monitoring/error reporting as needed.

7. **Spotify integration** — branch: `feat/spotify-integration`.
   Implement OAuth/token refresh, now-playing data, artwork, progress, and
   empty/recently-played states. This remains optional and later priority.

`[x]` means confirmed by the repository or handoff notes. `[ ]` means still to do or not yet verified.

## Upcoming execution plan

This is the recommended order for the remaining work. Each code change should
be developed on its named branch, reviewed, and merged independently. Operational
steps do not require a branch, but must be recorded as completed only after they
have been verified in the target environment.

### Priority 0 — Production verification

**Type:** Operations; no branch required
**Suggested branch for deployment-only fixes:** `chore/production-verification`
**Goal:** Confirm that the deployed Vercel app, Turso database, and Telegram
webhook work together before adding more features.

1. Confirm the Vercel project is linked to this repository and the production
   deployment is publicly reachable without Deployment Protection.
2. Verify production environment variables without printing or committing
   secret values:
   `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `TELEGRAM_BOT_TOKEN`,
   `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_CHAT_ID`, `APP_URL`,
   `DASHBOARD_TIMEZONE`, nutrition targets, and public link URLs.
3. Run the existing Drizzle migrations against the intended production Turso
   database. Do not run the seed script unless sample data is explicitly wanted.
4. Register the webhook with `npm run telegram:set-webhook`.
5. Confirm Telegram `getWebhookInfo` reports the expected URL, no webhook error,
   and no growing pending update count.
6. Test `/help`, `/gym`, `/read`, `/eat`, and `/undo` with real messages.
7. Confirm each write appears in Turso and the dashboard reflects it after a
   refresh. Check Vercel function logs for errors.
8. If any credential was exposed during setup, rotate it, update Vercel and
   local environment variables, redeploy, and register the webhook again.

**Exit criteria:** all production checklist items in Phase 0 are verified, and
the live Telegram-to-dashboard flow succeeds without duplicate writes.

### Priority 1 — CI and repository quality

**Branch:** `chore/ci-workflow`
**Goal:** Prevent regressions before the next production change.

- Add `.github/workflows/ci.yml` for `npm ci`, lint, typecheck, tests, and build.
- Add a `check` script for the fast local quality gate.
- Add `.nvmrc` and the supported Node engine (`>=20.12.0`).
- Remove the duplicate `.env.example` ignore entry and verify generated files
  and local databases remain ignored.
- Keep `package-lock.json` committed and ensure CI uses the lockfile.
- Optionally add dependency updates only after the required CI path is stable.

**Validation:** run the same CI commands locally and confirm one clean GitHub
Actions run on the pull request.

### Priority 2 — Health endpoint and deployment observability

**Branch:** `feat/health-endpoint`
**Goal:** Provide a safe endpoint for uptime checks and basic dependency status.

- [x] Add `GET /api/health`.
- [x] Perform a lightweight database connectivity query using the existing
  `getDb()` access point; do not expose credentials, SQL details, or personal
  data.
- [x] Return a success response only when the application and database check pass.
- [x] Return a service-unavailable response when configuration or database access
  fails, with a stable error shape suitable for Vercel monitoring.
- [x] Add focused route tests for success and database/configuration failure.
- [x] Document the endpoint and its expected status codes in deployment docs.
- [x] Decide whether the endpoint should expose only `ok` and `database` status or
  also a version/timestamp; keep the default response minimal.

**Validation:** targeted tests, typecheck, lint, production build, and a
post-deployment `curl` check.

### Priority 3 — Telegram reliability follow-up

**Branches:** `fix/telegram-reliability`, `test/telegram-webhook`,
`feat/telegram-commands`
**Goal:** Finish the command surface and make webhook behavior resilient.

1. **Reliability**
   - Handle Telegram `429` responses according to `retry_after`.
   - Split replies longer than Telegram's 4096-character limit.
   - Preserve pending reply state when delivery fails so retries are safe.
   - Add structured logging for update ID, outcome, and failure category without
     logging tokens or message contents unnecessarily.
2. **Commands**
   - Implement `/status`, `/book`, and `/finish`.
   - Decide explicitly whether `/decks` and `/target` belong in scope before
     implementing them.
   - Keep parser help text, webhook command registration, and BotFather's list
     synchronized.
3. **Local workflow**
   - Add `scripts/telegram-poll.ts` for local `getUpdates` testing without
     changing the production webhook.
4. **Tests**
   - Cover malformed payloads, unauthorized chats, missing configuration,
     duplicate updates, failed replies, rate limiting, and all new commands.

**Validation:** focused Telegram tests first, then the full test suite and a
real production message for each supported command.

### Priority 4 — Database operations and real content

**Branches:** `chore/database-operations`, `feat/real-content`
**Goal:** Make production data safer and replace scaffold content deliberately.

- Confirm the `telegram_updates` migration is applied in production.
- Enable foreign-key enforcement on the LibSQL connection if compatible with
  the deployed database.
- Document and test a Turso backup/export procedure.
- Create separate preview and production databases before allowing preview
  deployments to write real data.
- Improve seed behavior for partially populated local databases.
- Replace sample books, decks, links, and logs with intentional real content.
- Review data ownership and deletion behavior before entering personal data.

**Validation:** migration check, backup restore drill, local seed test, and
preview deployment write-isolation test.

### Priority 5 — UI, accessibility, and SEO

**Branches:** `feat/seo-metadata`, `feat/accessibility-pass`,
`feat/dashboard-links`
**Goal:** Improve discoverability and usability without changing the
read-only/public-write boundary.

- Add `manifest.ts`, `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`,
  `not-found.tsx`, and `loading.tsx` where appropriate.
- Add current screenshots and a concise project status section to the README.
- Add optional GitHub, LinkedIn, and email tiles through environment-backed
  configuration.
- Test heatmap tooltips and keyboard navigation with a keyboard and screen
  reader-oriented pass.
- Verify loading, empty, error, and narrow-screen states for dashboard cards.

**Validation:** lint, typecheck, tests, production build, and a manual
responsive/accessibility review.

### Priority 6 — Monitoring and optional integrations

**Branches:** `chore/production-operations`, `feat/spotify-integration`
**Goal:** Add operational visibility first, then optional product features.

- Add error monitoring and Vercel analytics only after reviewing privacy and
  data collection implications.
- Add alerts around health-check failures, webhook failures, and database
  connectivity.
- For Spotify, first verify the Next 16 Cache Components documentation shipped
  with the installed package.
- Add Spotify environment variables and OAuth/token refresh handling.
- Implement now-playing, artwork, progress, recently played, and empty states.
- Cache Spotify responses for a short interval and handle expired/revoked
  tokens explicitly.

**Validation:** provider configuration in a non-production environment, mocked
API tests, build verification, and a manual empty/error-state review.

### Work sequencing and merge gates

Use this dependency order:

`chore/production-verification` (operations) → `chore/ci-workflow` →
`feat/health-endpoint` → `fix/telegram-reliability` / `feat/telegram-commands`
→ `chore/database-operations` / `feat/real-content` →
`feat/seo-metadata` / `feat/accessibility-pass` →
`chore/production-operations` → `feat/spotify-integration`.

The parallel branches may be developed independently after CI is available.
Every code branch must pass lint, typecheck, targeted tests, and a production
build before merge. Changes that affect Telegram or database behavior also
require an updated migration/test and an end-to-end verification note.

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

Drizzle is not an external app. It is already installed as a library plus the `drizzle-kit` CLI and only needs the two Turso values above. The initial SQL migration already exists at `drizzle/0000_initial_schema.sql`.

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
- **Chat allowlist:** a wrong `TELEGRAM_CHAT_ID` is acknowledged without a database write, preventing Telegram retry loops.
- **Secrets:** only `.env.example` belongs in Git; `.env.local` must stay ignored.
- **Telegram retries:** duplicate updates are recorded and not applied twice; failed
  replies remain pending so Telegram can retry delivery.
- **Vercel env changes** usually require a redeploy.
- **Preview deployments** share the production Turso DB unless you create a separate preview database.

### 0.9 Phase 0 exit checklist

- [x] Turso database created and credentials saved
- [x] Migration applied
- [x] All five app tables independently verified in production
- [x] Seeded data remains present (sample data was not removed)
- [x] Local app connects successfully
- [x] Telegram bot credentials (token and chat ID) saved locally; BotFather commands set
- [x] Webhook secret saved locally
- [x] Vercel project imported with required environment variables
- [x] Production deployment completed on Vercel
- [x] Production deployment confirmed live and accessible
- [x] Production deployment independently confirmed unprotected
- [x] `getWebhookInfo` reports no errors
- [x] `/help`, `/gym`, `/read`, `/eat` all reply
- [x] Database rows created and dashboard updated
- [x] `DASHBOARD_TIMEZONE` matches your real day boundary (`Asia/Singapore`)

Notes:

- Phase 0 operational verification is complete: production tables, deployment
  access, webhook status, Telegram writes, and dashboard updates were checked.
- Local database verification confirms `__drizzle_migrations`, `gym_workouts`,
  `books`, `reading_logs`, `meals`, and `mtg_decks` exist. This does not replace
  verification against the production Turso database.
- Repository verification completed: lint, tests (30/30), typecheck, and
  production build pass.

---

## Phase 1 — Repo hygiene and CI

Suggested branch: `chore/repo-hygiene` for repository-only cleanup, or
`chore/ci-workflow` for CI changes.

- [x] Fix `.gitignore` (remove duplicate `.env.example` ignore).
- [x] Add `.nvmrc` and `engines.node >=20.12.0` (Next 16 requires 20.9; scripts require 20.12).
- [x] Add `.github/workflows/ci.yml` to run `npm ci`, lint, typecheck, tests, and build.
- [x] Add a `check` script aggregating lint, typecheck, and tests.
- [x] Confirm `package-lock.json` stays committed and generated/local files stay ignored.
- [x] Optional: add Dependabot for npm and GitHub Actions updates.

**Phase 1 validation:** `npm run check` and `npm run build` pass locally. The
GitHub Actions workflow still needs one successful run after this branch is
pushed or opened as a pull request.

## Phase 2 — Telegram hardening and completion

Suggested branch: `feat/telegram-commands` for new commands,
`fix/telegram-reliability` for behavior fixes, and `test/telegram-webhook`
for focused test-only work.

- [x] **Fix duplicate writes:** add an `update_id` dedupe table (`telegram_updates`) and skip already-processed updates.
- [x] **Transactions:** wrap multi-step `/read` (book upsert + reading log) in a transaction.
- [x] **Race-safe books:** use `insert … onConflict` instead of select-then-insert; make title uniqueness case-insensitive.
- [ ] **Missing commands:** implement at least `/undo`, `/status`, `/book`, and `/finish`; decide whether `/decks` and `/target` are in scope.
- [ ] **Reply reliability:** handle Telegram `429 retry_after`, split messages over 4096 characters, and log failures.
- [ ] **Local development:** add `scripts/telegram-poll.ts` using `getUpdates` for local testing; keep the webhook for production.
- [x] **Tests:** add handler tests, route tests (secret/allowlist/error paths), and mocked Telegram API tests.

## Phase 3 — Spotify live playback

Suggested branch: `feat/spotify-integration`.

- [ ] Add `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REFRESH_TOKEN` to `.env.example` and docs.
- [ ] Add `src/lib/spotify/` with token refresh, access-token caching, and `getNowPlaying()`.
- [ ] Add `scripts/spotify-auth.ts` and document the required scopes and redirect URI.
- [ ] Add `i.scdn.co` to `next.config.ts` `images.remotePatterns`.
- [ ] Replace `spotify: null` in queries and cache now-playing for ~15–30 seconds.
- [ ] Update `SpotifyCard` to show real track, artist, art, progress, and link; handle recently played/empty states.
- [ ] Verify the Next 16 Cache Components pattern (`use cache` / `cacheLife`) in `node_modules/next/dist/docs/` before implementing caching.

## Phase 4 — Database and real content

Suggested branch: `feat/real-content` for personal content and
`chore/database-operations` for migrations, backups, and database maintenance.

- [ ] Add a migration for `telegram_updates` and case-insensitive book-title uniqueness (or normalized titles).
- [ ] Enable `PRAGMA foreign_keys = ON` on the LibSQL connection.
- [ ] Improve seed idempotency so partially seeded tables are handled safely.
- [ ] Replace sample books, decks, and logs with real content.
- [ ] Add backup/export instructions (`turso db dump`).

## Phase 5 — UI, SEO, content

Suggested branch: `feat/seo-metadata`, `feat/accessibility-pass`, or
`feat/dashboard-links`, depending on the focused change.

- [x] Replace the active-reading bookshelf with a full Library showing reading, finished, and paused books, including status and progress.
- [ ] Replace the static Spotify shell only after Phase 3.
- [ ] Add `manifest.ts`, `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`, `not-found.tsx`, and `loading.tsx`.
- [ ] Add real screenshots/GIF and a current status/roadmap section to README.
- [ ] Optional: add GitHub, LinkedIn, and email link tiles driven by env config.
- [ ] Complete an accessibility pass on heatmap tooltips and keyboard navigation.

## Phase 6 — Operations

Suggested branch: `feat/health-endpoint` for the health route and
`chore/production-operations` for monitoring, backups, and environment
separation.

- [x] Add `/api/health` for DB connectivity.
- [ ] Add error monitoring (Sentry) and analytics (Vercel).
- [ ] Separate the preview-deployment database from production.
- [ ] Optional: add per-chat rate limiting.

## Phase 7 — Turbo (only if needed)

- [x] Keep this as a single app and do not add Turbo unless a second deployable service is introduced.
- [ ] If it becomes a monorepo, add `apps/web`, `apps/bot`, `packages/db`, `packages/core`, root `turbo.json`, and configure Vercel accordingly.

**Recommended order:** Phase 1 → 2 → 3 → 4 → 5 → 6. Skip Phase 7 unless you add a second deployable service.

**Definition of done per phase:** lint, typecheck, tests, and production build pass; webhook tested end-to-end with curl and a real Telegram message; docs updated.
