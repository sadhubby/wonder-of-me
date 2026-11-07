# Architecture

## Stack

| Layer | Choice | Purpose |
| --- | --- | --- |
| Framework | Next.js 16 App Router + React 19 | Server Components, streaming, route handlers |
| Language | TypeScript | Typed queries, command parsing, environment validation |
| Styling | Tailwind CSS 4 | Bento layout, glass utilities, design tokens |
| Icons | Lucide | Consistent minimalist iconography |
| Heatmaps | `react-activity-calendar` | 365-day activity matrices |
| Database | Turso / LibSQL + Drizzle ORM | Edge SQLite with typed relational queries |
| Validation | Zod | Incoming updates, env, command payloads |
| Dates | `date-fns` + `Intl` | Calendar ranges and timezone-aware log dates |
| Hosting | Vercel | Next.js deployment and serverless webhook |
| Input | Telegram Bot API | Authenticated write-only gateway |

## Data flow

```text
Telegram user
  │  /gym, /read, /eat
  ▼
Telegram Bot API
  │  POST + X-Telegram-Bot-Api-Secret-Token
  ▼
app/api/telegram/route.ts
  │  secret compare + chat allowlist + Zod parse
  ▼
lib/telegram/handler.ts
  │  Drizzle inserts / upserts
  ▼
Turso (LibSQL)
  │
  ▼
db/queries.ts
  │  request-time reads aggregated into a dashboard snapshot
  ▼
Server Components → bento grid
```

## Rendering model

This project uses the Next.js 16 **Cache Components** model (`cacheComponents: true`). That changes a few conventions:

- Do not use `export const dynamic`, `revalidate`, or `runtime` segment config.
- The page renders a static shell (header, footer, Suspense fallback) immediately.
- `getDashboardSnapshot()` calls `await connection()` before any time-sensitive or database work. This keeps the snapshot out of prerendering.
- The dashboard is rendered inside `<Suspense>` with a skeleton fallback.
- The Telegram route is a POST route handler, so it always runs per request.

## Directory map

```text
src/
  app/
    api/telegram/route.ts     webhook endpoint
    error.tsx                 client error boundary
    globals.css               design tokens + utilities
    icon.svg                  app icon
    layout.tsx                fonts, metadata, ambient orbs
    page.tsx                  static shell + Suspense boundary
  components/
    dashboard/                bento cards and page chrome
    ui/                       shared card, stats, progress, heatmap
  db/
    index.ts                  lazy LibSQL + Drizzle client
    schema.ts                 tables and row types
    queries.ts                dashboard snapshot aggregation
    seed.ts                   sample content
    migrations live in /drizzle
  lib/
    config.ts                 dashboard timezone, targets, links
    date.ts                   timezone-aware date helpers
    env.ts                    database + Telegram env validation
    heatmap.ts                calendar generation, levels, streaks
    utils.ts                  class merging
    telegram/
      parse.ts                command grammar
      handler.ts              database mutations + replies
      send.ts                 Bot API send helper
scripts/
  set-telegram-webhook.ts     register webhook + bot commands
```

## Security boundaries

- **No public write API.** The only mutation route is `/api/telegram`, which requires the Telegram secret header and an allowlisted chat ID.
- **Constant-time secret comparison.** Both values are SHA-256 hashed before `timingSafeEqual` to avoid length leaks.
- **Server-only secrets.** Turso and Telegram credentials never use `NEXT_PUBLIC_`.
- **Input limits.** Telegram messages are capped, commands validate numeric ranges, and titles/notes are length-limited.
- **Read-only UI.** Server Components only call read queries; no Server Actions are exposed.

## Environment configuration

See `.env.example`. A local SQLite file is used when `TURSO_DATABASE_URL` is absent, which makes first-run development possible without Turso.

| Variable | Required | Purpose |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | Production | Turso URL or `file:./local.db` |
| `TURSO_AUTH_TOKEN` | Production | Turso auth token |
| `TELEGRAM_BOT_TOKEN` | Webhook | Bot API token |
| `TELEGRAM_WEBHOOK_SECRET` | Webhook | Secret token checked on every POST |
| `TELEGRAM_CHAT_ID` | Webhook | Comma-separated allowlisted chat IDs |
| `DASHBOARD_TIMEZONE` | No | IANA timezone, default `UTC` |
| `DAILY_*_TARGET` | No | Nutrition targets |
| `PORTFOLIO_URL`, `GARDEN_URL` | No | External bento tiles |
| `APP_URL` | Webhook script | Public deployment URL |

## Spotify seam

The Spotify card is intentionally a static shell. `DashboardSnapshot.spotify` is currently `null`. To wire live playback later:

1. Add a server-only Spotify token helper.
2. Add a `getNowPlaying()` query returning track, artist, art, progress, and playing state.
3. Replace the `null` in `src/db/queries.ts`.
4. Update `SpotifyCard` to render the returned track.

No OAuth code or credentials are included in this build.
