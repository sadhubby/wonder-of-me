# Database

The database is Turso (LibSQL) in production and a local SQLite file (`local.db`) during development. Drizzle ORM provides typed queries and migrations.

## Tables

### `gym_workouts`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | integer PK | autoincrement |
| `workout_date` | text | `YYYY-MM-DD` in `DASHBOARD_TIMEZONE` |
| `split` | text | e.g. Push, Pull, Legs |
| `duration_minutes` | integer nullable | 1–600 via Telegram |
| `exercises` | JSON text | `{ name, sets?, reps? }[]` |
| `notes` | text nullable | length-capped in parser |
| `created_at` | timestamp | defaults to `unixepoch()` |

Indexed by date and split.

### `books`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | integer PK | autoincrement |
| `title` | text unique | case-insensitive lookup at write time |
| `author` | text nullable | |
| `cover_url` | text nullable | remote image or gradient fallback |
| `total_pages` | integer nullable | drives progress percentage |
| `status` | text | `reading`, `finished`, `paused` |
| `started_at`, `finished_at` | text nullable | `YYYY-MM-DD` |
| `created_at` | timestamp | |

### `reading_logs`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | integer PK | |
| `log_date` | text | `YYYY-MM-DD` |
| `book_id` | integer FK | cascades on book delete |
| `pages` | integer | required |
| `minutes` | integer nullable | optional focus time |
| `notes` | text nullable | |
| `created_at` | timestamp | |

### `meals`

Each `/eat` command appends a meal. Daily totals are aggregated, so multiple meals are supported without overwriting earlier entries.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | integer PK | |
| `log_date` | text | `YYYY-MM-DD` |
| `description` | text nullable | e.g. chicken bowl |
| `calories` | integer | required |
| `protein_g`, `carbs_g`, `fat_g` | integer | default 0 |
| `created_at` | timestamp | |

### `mtg_decks`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | integer PK | |
| `name` | text unique | deck name |
| `commander` | text | commander name |
| `color_identity` | JSON text | `("W" \| "U" \| "B" \| "R" \| "G")[]` |
| `commander_art_url` | text nullable | Scryfall art crop URL |
| `decklist_url` | text nullable | Moxfield/Archidekt/etc. |
| `notes` | text nullable | short description |
| `created_at` | timestamp | |

## Heatmap aggregation

`src/db/queries.ts` reads workout and reading rows, then `src/lib/heatmap.ts` builds 365 daily cells ending today.

- Gym value per day = workout duration, falling back to estimated volume (`sets × 5`) or `1` when no duration exists.
- Reading value per day = pages read.
- Levels are 0–4:
  - Gym thresholds: `<30 min` = 1, `<60` = 2, `<90` = 3, `≥90` = 4.
  - Reading thresholds: `<15 pages` = 1, `<35` = 2, `<70` = 3, `≥70` = 4.
- Streaks are computed from unique log dates. A current streak is allowed to end yesterday, so the dashboard does not reset at midnight before the day is logged.

## Drizzle commands

```bash
npm run db:generate    # generate SQL from schema.ts
npm run db:migrate     # apply generated migrations
npm run db:push        # push schema directly (great for local prototypes)
npm run db:seed        # insert sample data if tables are empty
```

For a new database:

```bash
npm run db:migrate
npm run db:seed
```

## Local development

Without a `TURSO_DATABASE_URL`, the app uses `file:./local.db`. Both the app and Drizzle config fall back to that path.

```bash
cp .env.example .env.local
# leave TURSO_* blank for local SQLite
npm run db:migrate
npm run db:seed
npm run dev
```

`local.db` and its sidecar files are ignored by Git.

## Replacing sample data

- Books and decks: edit `sampleBooks` and `sampleDecks` in `src/db/seed.ts`, then reset the local database and reseed.
- Seeded logs: the seed script creates a 120-day gym history, a 45-day reading history, and three meals for the current dashboard date.
- Existing data: because inserts are guarded by table counts and unique indexes, the seed script is safe to rerun. It does not duplicate books, decks, gym logs, reading logs, or meals.
- Seed dates use `DASHBOARD_TIMEZONE`. With the default `UTC`, the dashboard date can differ from your local date near midnight.

## Resetting a local database

```bash
rm -f local.db local.db-shm local.db-wal
npm run db:migrate
npm run db:seed
```
