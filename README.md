# Wonder of Me

A single-user personal command center: an asymmetrical bento dashboard with dual GitHub-style heatmaps (gym + reading), nutrition telemetry, a full Library, a Commander deck vault, external link tiles, and a static Spotify player shell.

The public UI is read-only. All writes go through an authenticated Telegram webhook into Turso.

## Stack

- Next.js 16 (App Router, Cache Components) + React 19 + TypeScript
- Tailwind CSS 4
- Turso / LibSQL + Drizzle ORM
- Telegram Bot API
- Vercel

## Quick start

```bash
cp .env.example .env.local
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. Without `TURSO_DATABASE_URL`, the app uses `file:./local.db`, so Turso is not required for local work.

## Scripts

```bash
npm run dev                  # dev server
npm run build                # production build
npm run start                # serve production build
npm run lint                 # ESLint
npm run typecheck            # tsc --noEmit
npm test                     # Vitest

npm run db:generate          # generate Drizzle SQL
npm run db:migrate           # apply migrations
npm run db:push              # push schema directly
npm run db:seed              # seed sample content
npm run telegram:set-webhook # register webhook + bot commands
```

## Telegram commands

```text
/gym push 45 | bench press 4x8, cable fly 3x12
/read Dune 32 45
/eat 620 45 60 20 chicken bowl
/help
```

## Documentation

- [Docs index](./docs/README.md)
- [Architecture](./docs/architecture.md)
- [Database](./docs/database.md)
- [Telegram gateway](./docs/telegram.md)
- [UI design system](./docs/ui-design.md)
- [Deployment](./docs/deployment.md)

## Notes

- Sample books, decks, and logs are included via `src/db/seed.ts`.
- Spotify live playback is intentionally stubbed; the card is ready for a future OAuth/API integration.
- `DASHBOARD_TIMEZONE` defaults to `UTC`; set it to your IANA timezone in production so Telegram writes land on the right day.
