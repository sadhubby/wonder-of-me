# Handoff plan

This note captures the current decisions and next steps for continuing work on Wonder of Me.

## Current feature: Library

The dashboard Library shows every book in the collection, including books that
are finished, currently being read, or paused.

- Each book shows its reading status.
- Cover, title, author, page/progress, and start-date details are preserved.
- Relevant code: `src/db/queries.ts`, `src/components/dashboard/bookshelf-card.tsx`, and the `BookSummary` type in `src/db/queries.ts`.

## Next step: Focused automated tests

Add focused Library query/component coverage and complete the remaining Step 7
tests in `docs/app-logic-plan.md`.

## Telegram and deployment

The user reports that the bot token, webhook secret, and Telegram chat ID are in local `.env.local`. Do not read, repeat, or commit those credentials. `APP_URL` is intentionally deferred until deployment.

BotFather commands have been set: `/gym`, `/read`, `/eat`, and `/help`. Setting the command menu only makes commands easier to select; the app still needs a registered webhook to respond.

When ready to deploy:

1. Set up Turso and apply the database migration; seed sample data if desired.
2. Deploy the app, planned for Vercel, and configure its Turso and Telegram environment variables.
3. Set `APP_URL` to the public HTTPS deployment URL.
4. Run `npm run telegram:set-webhook` locally with the deployment environment values available. This registers the webhook and command menu.
5. Test `/help`, then a write command such as `/gym push 45 | bench 4x8`.

Telegram cannot deliver webhook updates to `localhost`. See `docs/deployment.md` and `docs/telegram.md` for detailed setup and troubleshooting.

## Recent implementation context

- Heatmap layout was updated to reserve a weekday-label column and resize to its container. The full test suite and targeted lint passed.
- Scryfall commander images use `unoptimized` in `src/components/dashboard/deck-vault.tsx`; the browser confirmed they load directly.
- A portrait-and-description section was added below the hero. When the user uploads a photo, set `portraitUrl` in `src/lib/site.ts`.
- A project-wide typecheck previously reported unrelated `eyebrow` props passed to `LinkTile` in `src/components/dashboard/dashboard.tsx`.
