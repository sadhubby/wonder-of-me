# Wonder of Me — Documentation

A single-user, read-only personal command center built with Next.js, Turso, and a Telegram write gateway. The UI is an asymmetrical bento grid with a nocturnal frosted-glass aesthetic: dual GitHub-style heatmaps, nutrition telemetry, an active bookshelf, a Commander deck vault, external link tiles, and a Spotify shell.

## Documentation map

| Document | What it covers |
| --- | --- |
| [Architecture](./architecture.md) | Stack, directory map, rendering model, data flow, security boundaries |
| [Database](./database.md) | Drizzle schema, heatmap aggregation, migrations, seed data |
| [Telegram gateway](./telegram.md) | Bot setup, webhook security, command grammar, troubleshooting |
| [UI design system](./ui-design.md) | Color tokens, glass/solid-card rule, bento layout, components |
| [Deployment](./deployment.md) | Turso, Vercel, environment variables, webhook registration |
| [Handoff plan](./handoff-plan.md) | Agreed next feature, deployment steps, and recent work context |
| [App logic implementation plan](./app-logic-plan.md) | Step-by-step plan for retry-safe Telegram writes, typed undo, the Library, tests, and BotFather |

## Project principles

1. **Public dashboard is read-only.** There are no write actions in the web UI.
2. **Telegram is the only mutation surface.** `/gym`, `/read`, and `/eat` write through a single authenticated route handler.
3. **Data is relational where it matters and JSON where it helps.** Heatmaps query dates; workout exercises and MTG color identities use JSON columns.
4. **Text stays crisp.** Text-heavy cards use a solid-core opacity layer; media and telemetry cards use frosted glass.
5. **The dashboard is live.** Database reads are request-time, streamed inside a Suspense boundary, not baked into the static shell.

## Current scope

- Live: gym, reading, nutrition, bookshelf, MTG decks, external tiles.
- Stubbed intentionally: Spotify now-playing. The visual shell and data seam are present, but OAuth/API wiring is deferred.
- Sample content is seeded for first-run visuals. Replace it in `src/db/seed.ts` or directly in the database.
