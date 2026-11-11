# App Logic Implementation Plan

This plan covers the next application-logic improvements for Wonder of Me. It
does not include deployment, production hosting, or setting `APP_URL`; those
will be handled after the app work is ready.

## Goals

- Make Telegram commands safe when Telegram retries webhook updates.
- Add type-specific undo commands with predictable behavior.
- Keep book and reading-log data consistent.
- Make Telegram reply failures visible and recoverable.
- Show the complete book collection in the dashboard Library.
- Add focused tests for the critical write paths.

## Agreed `/undo` behavior

The supported forms will be:

```text
/undo gym
/undo read
/undo eat
```

Each command targets the newest recorded entry of the requested type, not the
newest entry across all types. For example, `/undo eat` never removes a gym
workout. It removes the newest meal, not an older meal while a newer meal
exists.

The lookup is not limited to today's entries: it targets the newest matching
record in the history. If the newest matching record is removed, a later
invocation may then target the next-newest record of that same type. If there
is no matching record, the bot replies that there is nothing to undo.

For `/undo read`, removing a reading log must also correctly handle any book
state that the corresponding `/read` command changed or created.

## Step 1 — Establish the baseline

- [x] Run the current tests, typecheck, and lint; note pre-existing failures.
- [x] Review the current database schema and migration state before making
  schema changes.
- [x] Use an isolated local/test database for verification; do not rely on or
  overwrite personal data in `local.db`.
- [x] Keep unrelated worktree changes out of the implementation.

**Exit check:** baseline results: tests and typecheck pass; lint has two
pre-existing unused-import warnings in dashboard components. Migration and
write-path tests use a temporary SQLite database.

## Step 2 — Make Telegram update processing idempotent

Telegram may deliver the same webhook update more than once. A repeated
`update_id` must not create another workout, reading log, or meal.

- [x] Add a `telegram_updates` persistence model keyed by Telegram's
  `update_id`.
- [x] Generate a Drizzle migration and apply it to the isolated test database.
- [x] Include `update_id` in webhook payload validation and pass it through the
  processing path.
- [x] Ensure claiming an update and applying its database write cannot leave a
  successful write unrecorded as processed.
- [x] Store the reply state needed to distinguish a new update, a
  completed update, and an update whose reply still needs delivery.
- [x] For an already-processed update, do not execute the command write again.
  If a reply is pending, allow reply delivery to be retried without replaying
  the write.
- [x] Define how malformed, ignored, or unauthorized updates are handled so
  they do not create retry loops or unintended database records.

Likely files: `src/db/schema.ts`,
`src/app/api/telegram/route.ts`, `src/lib/telegram/handler.ts`, and a new SQL
migration under `drizzle/`.

**Exit checks:**

- [x] Processing the same update twice creates at most one domain record.
- [x] A failed database write does not leave the update marked successfully
  processed.
- [x] A failed reply can be retried without repeating the domain write.

The Step 2 migration has been applied to the configured local `local.db`.
Apply migrations to the intended remote Turso database separately before
deploying this code.

## Step 3 — Make `/read` atomic and book matching consistent

`/read` looks up or creates a book, updates its status, and inserts a reading
log in the transaction owned by Telegram update processing. These changes now
succeed or fail together.

- [x] Wrap book lookup/create/update and reading-log insertion in one
  transaction.
- [x] Make case-insensitive title matching consistent with database
  uniqueness.
- [x] Inspect existing local data for titles that differ only by capitalization
  before applying the uniqueness migration; no duplicates were present.
- [x] Preserve the book's prior state, or enough equivalent information, so
  `/undo read` can reverse changes made by the selected reading log.
- [x] Handle concurrent `/read` commands for the same title without creating
  duplicate books.
- [x] Keep the existing behavior that a successful read marks the book as
  currently being read.

Likely files: `src/lib/telegram/handler.ts`, `src/db/schema.ts`, and a new
database migration.

**Exit checks:**

- [x] A successful `/read` writes both the book state and reading log.
- [x] A failure during the operation leaves neither a partial book change nor
  an orphaned log.
- [x] Titles differing only by capitalization resolve to one book.

## Step 4 — Implement type-specific undo commands

- [ ] Extend the parsed command types and parser to accept exactly the intended
  forms `/undo gym`, `/undo read`, and `/undo eat`.
- [ ] Return a helpful validation response for missing or unsupported types;
  do not guess which category to undo.
- [ ] Implement `/undo gym` by selecting and removing only the newest workout.
- [ ] Implement `/undo eat` by selecting and removing only the newest meal.
- [ ] Implement `/undo read` by selecting and removing only the newest reading
  log, then restoring or removing associated book state as appropriate.
- [ ] Use a deterministic ordering for "newest" (for example, creation time
  plus ID as a tie-breaker) and apply it consistently.
- [ ] Make selection and deletion/state restoration atomic, and handle
  concurrent undo requests so they do not both report undoing the same row.
- [ ] Reply with the removed entry's useful details, or a clear "nothing to
  undo" message when no matching entry exists.
- [ ] Update `/help` examples and command documentation.

**Exit checks:**

- [ ] `/undo eat` does not remove a gym workout, even if that workout is newer.
- [ ] When multiple meals exist, `/undo eat` removes the newest meal only.
- [ ] Subsequent `/undo eat` calls remove the then-newest remaining meal.
- [ ] `/undo read` removes the newest reading log and correctly handles both a
  newly created book and a previously existing book.
- [ ] No matching record produces a harmless, explicit response.

## Step 5 — Make Telegram reply failures observable

The current send helper logs unsuccessful Telegram responses rather than
surfacing them to its caller.

- [ ] Make unsuccessful HTTP responses and Telegram API error bodies explicit
  failures from `sendTelegramMessage`.
- [ ] Ensure the route records whether the domain operation succeeded and
  whether its reply was delivered.
- [ ] On reply failure, preserve enough state for safe retry without rerunning
  the command's mutation.
- [ ] Handle Telegram rate limits deliberately, respecting `retry_after` when
  retrying is appropriate.
- [ ] Avoid retry loops or reporting success to internal processing when the
  reply failed.

Likely file: `src/lib/telegram/send.ts`, plus the webhook route and update
processing state from Step 2.

**Exit checks:**

- [ ] A failed Telegram response is surfaced and logged with useful context.
- [ ] Retrying a failed reply does not duplicate a workout, reading log, meal,
  or undo.

## Step 6 — Expand the dashboard bookshelf into a Library

The dashboard query currently filters books to status `reading`. The Library
should include the full collection.

- [ ] Return books with `reading`, `finished`, and `paused` statuses.
- [ ] Keep title, author, cover, page count, logged pages, progress, and
  start-date information where available.
- [ ] Include each book's status in the summary type.
- [ ] Display the status and useful progress details for every book.
- [ ] Preserve the existing visual style and provide a clear empty state.
- [ ] Check that progress handles unknown page totals and does not exceed 100%.

Likely files: `src/db/queries.ts` and
`src/components/dashboard/bookshelf-card.tsx`; update related tests as needed.

**Exit checks:**

- [ ] Reading, finished, and paused books are all visible.
- [ ] Each displayed book has a clear status.
- [ ] Progress and empty-state behavior are correct.

## Step 7 — Add focused automated tests

- [ ] Parser tests for `/undo gym`, `/undo read`, `/undo eat`, missing types,
  and unsupported types.
- [ ] Handler tests proving each undo only removes the newest matching type.
- [ ] `/read` tests for transactions, case-insensitive matching, and prior book
  state restoration.
- [ ] Webhook tests for update deduplication, authentication, allowlisting,
  and processing failures.
- [ ] Telegram send tests for success, API errors, and rate-limit responses.
- [ ] Library query/component tests for mixed statuses, progress, and empty
  collections.
- [ ] Use mocked Telegram requests and an isolated database/test fixture.

**Exit check:** the focused tests cover the behavior and failure cases above,
without relying on live Telegram credentials or personal database contents.

## Step 8 — Update the Telegram command menu

BotFather is used to configure the bot and its command menu; it is not where
the app's command behavior or webhook URL is implemented. The existing
`npm run telegram:set-webhook` helper registers commands through Telegram's
Bot API, but it requires a public `APP_URL`, so it is intentionally deferred
until deployment.

After `/undo` is implemented:

- [ ] Add `/undo` and a concise description to the command list in
  `scripts/set-telegram-webhook.ts`.
- [ ] In Telegram, open `@BotFather`, send `/setcommands`, choose this bot, and
  submit the command list including `/gym`, `/read`, `/eat`, `/undo`, and
  `/help`.
- [ ] Keep the BotFather list consistent with the list registered by the
  script. Do not list `/status`, `/book`, or `/finish` unless those commands
  have been implemented.
- [ ] Do not create a new bot, rotate the token, or configure the webhook in
  BotFather for this work.
- [ ] Once a public deployment exists, set the deployment environment
  variables and run `npm run telegram:set-webhook` to register the webhook and
  synchronize the Bot API command menu.

BotFather command-menu setup can be done before deployment. End-to-end bot
testing through the webhook cannot be completed until the webhook has a
publicly reachable HTTPS URL.

## Step 9 — Final local verification

- [ ] Apply migrations to the isolated local/test database.
- [ ] Run the full test suite, typecheck, and lint.
- [ ] Exercise `/gym`, `/read`, `/eat`, and all three undo forms against test
  data.
- [ ] Replay an update and verify no duplicate write occurs.
- [ ] Simulate a database failure and Telegram reply failure.
- [ ] Verify the dashboard with an empty Library and a mixed-status Library.
- [ ] Review the final diff and confirm no secrets, personal data, or unrelated
  changes are included.

**Overall completion criteria:** all app-logic checks above pass locally.
Deployment, public webhook registration, and live Telegram end-to-end testing
remain a separate later task.
