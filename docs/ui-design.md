# UI design system

The visual direction is smoked glass over a moody, colorful mesh: overlapping rose, coral, amber, peach, and gold fields on a deep-plum base, with translucent deep-plum panels. Saturated color carries the atmosphere and the data; text stays white or pale rose so contrast survives everywhere.

## Design tokens

Tokens live in `src/app/globals.css` as Tailwind theme variables.

### Surfaces

| Token | Value | Use |
| --- | --- | --- |
| `canvas` | `#240c1b` | Base under the color mesh and dark separators |
| `surface` | `#3a132e` | Opaque fallback and inner panels |
| `glass-bg` | `rgba(34, 12, 30, 0.55)` | Frosted card shell |
| `glass-border` | `rgba(255, 255, 255, 0.22)` | 1px light edge |
| `surface-alpha` | `rgba(28, 10, 26, 0.68)` | Deeper glass core for text-heavy cards |

### Sunset atmosphere

| Token | Value | Use |
| --- | --- | --- |
| `rose` | `#f472b6` | Rose mesh field, reading fills |
| `coral` | `#e11d48` | Coral mesh field, nutrition and portfolio fills |
| `amber` | `#f59e0b` | Amber mesh field, gym and carb fills |

The page background is a fixed, full-viewport mesh of 12 overlapping radial color fields over the `#240c1b` canvas. The fields use rose, coral, amber, peach, gold, pale rose, deep rose, and deep amber at low alpha so the page stays moody and the glass keeps its contrast. The arrangement is fixed and static; there is no animation.

### Telemetry accents

Each family has a **fill** token and an **ink** token. Fills are saturated and used for bars, heatmaps, dots, and glows. Inks are pale and used for text and icons so they stay readable on smoked glass.

| Family | Fill | Ink |
| --- | --- | --- |
| Gym | `accent-emerald` `#f59e0b`, `accent-emerald-deep` `#b45309` | `accent-emerald-ink` `#fcd34d` |
| Reading | `accent-violet` `#f472b6`, `accent-violet-deep` `#be185d` | `accent-violet-ink` `#fbcfe8` |
| Nutrition / portfolio | `coral` `#e11d48` | `coral-ink` `#fecdd3` |
| Carbs / alerts | `gold` `#f59e0b` | `gold-ink` `#fde68a` |
| Garden / fat | `sky` `#f472b6` | `sky-ink` `#fbcfe8` |
| Spotify (brand exception) | `accent-spotify` `#1db954` | `accent-spotify-ink` `#86efac` |

### Typography

| Token | Value | Use |
| --- | --- | --- |
| `text-primary` | `#ffffff` | Headers, stats, titles |
| `text-secondary` | `#fce7f3` | Timestamps, labels, hints |
| `focus` | `#ffffff` | Focus-visible outlines |

A subtle `text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25)` adds separation from the background. It is never used as a substitute for contrast. Numbers use Geist Mono; body copy uses Geist Sans.

## Glass hierarchy

- **Frosted shell** (`glass-card`): `rgba(34, 12, 30, 0.55)`, `backdrop-blur(20px)`, 1px `glass-border`, inset highlight, soft shadow. Used for:
  - gym and reading heatmaps
  - deck vault
  - Spotify shell
- **Deep glass core** (`solid-card`): `rgba(28, 10, 26, 0.68)` with the same blur and border. Used for:
  - nutrition
  - full Library
  - Telegram dispatch guide
  - external link tiles
  - status alerts and the error panel
- **Glass bar** (`glass-bar`): `rgba(34, 12, 30, 0.5)`, `backdrop-blur(16px)`. Used for the site header, the snapshot row, and the footer so their text never sits directly on the background.
- **Glass button** (`glass-button`): white `0.1` fill, `backdrop-blur(10px)`, hover to white `0.14` with `scale(1.05)`, white focus outline. Used for the error retry control.
- **Page mesh** (`page-bg`): fixed full-viewport layer of 12 radial palette fields over the canvas; `pointer-events: none`, positioned at `-z-10` in the layout.

Text-heavy cards use the deeper fill. The solid/frosted distinction is a contrast tool, not decoration.

## Pills and status labels

Static metadata is plain text, not pill-shaped. Pills are reserved for nothing at the moment; buttons use `rounded-lg`. This keeps the UI from reading as a stack of badges.

| Element | Before | After |
| --- | --- | --- |
| Header status | Two `rounded-full` pills | One plain uppercase line: `Read-only · Telegram → Turso` |
| Nutrition date | `rounded-full` pill | Removed; the snapshot row already shows the date |
| Nutrition target | `rounded-full` tinted pill | Plain accent text |
| Gym streak | `rounded-full` bordered pill | Plain accent text |
| Gym recent splits | `rounded-full` chips | Wrapped text list with dots |
| Reading streak | `rounded-full` bordered pill | Plain accent text |
| Library status | `rounded-full` bordered pill | Plain accent text |
| Deck count | `rounded-full` bordered pill | Plain text |
| Decklist control | `glass-button rounded-full` | Plain text link with focus outline |
| Spotify badge | `rounded-full` pill | Removed; the card title and body already identify Spotify |
| Link tile “Not set” | `rounded-full` pill | Plain uppercase text |
| Error retry | `glass-button rounded-full` | `glass-button rounded-lg` |

Kept as-is: WUBRG pips, status dots, progress bars, equalizer bars, and skeleton placeholders. Those are functional shapes, not badges.

## Bento layout

The desktop grid is 12 columns. Mobile is one column; tablet is two.

| Card | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Gym heatmap | full | full (2) | 7 |
| Nutrition | full | 1 | 5 |
| Reading heatmap | full | full (2) | 7 |
| Library | full | 1 | 5 |
| Commander vault | full | full (2) | 8 |
| Spotify | full | 1 | 4 |
| Portfolio | full | 1 | 3 |
| Digital garden | full | 1 | 3 |
| Telegram dispatch | full | full (2) | 6 |

The asymmetry comes from alternating 7/5, 8/4, and 3/3/6 rows.

## Component inventory

```text
components/ui/
  card.tsx        Card, CardHeading, Stat, ProgressBar
  heatmap.tsx     client wrapper around react-activity-calendar

components/dashboard/
  site-header.tsx
  site-footer.tsx
  dashboard.tsx             assembles the grid
  dashboard-skeleton.tsx    Suspense fallback
  gym-heatmap-card.tsx
  reading-heatmap-card.tsx
  nutrition-card.tsx
  bookshelf-card.tsx
  deck-vault.tsx
  spotify-card.tsx
  link-tile.tsx
  command-guide-card.tsx
```

## Heatmap styling

- `react-activity-calendar` renders 365 days ending today.
- Dark themes use five derived levels per card, defined in `globals.css` as `--color-heat-*` tokens. All values come from the token palette via `color-mix(in oklab, …)`.
- Gym scale:

  | Level | Formula |
  | --- | --- |
  | 0 | 10% `accent-emerald-deep` into `surface` |
  | 1 | 45% `accent-emerald-deep` into `surface` |
  | 2 | `accent-emerald-deep` |
  | 3 | `accent-emerald` |
  | 4 | 45% `text-primary` into `accent-emerald` |

- Reading scale: the same ramp with `accent-violet-deep` and `accent-violet`.
- Weekday labels show Monday / Wednesday / Friday.
- Tooltips show value + human-readable date.
- Small screens get a horizontal-scroll container; the card itself never breaks the grid.

## Intentional exceptions

These are deliberate deviations and must not be treated as accidental drift.

- **Magic: The Gathering WUBRG pips.** Color-identity badges keep their print-authentic colors: W `#f4e8c1`, U `#7dd3fc`, B `#7c6f9e`, R `coral`, G `accent-emerald`. The red pip uses white text for contrast. They are small functional indicators, not surfaces.
- **Spotify brand green.** `accent-spotify` `#1db954` (fill) and `accent-spotify-ink` `#86efac` (text) are retained for brand recognition. No other green is used.
- **Neutral alpha overlays.** `bg-white/[0.03-0.1]`, `border-white/[0.1-0.2]`, and `bg-black/[0.08-0.15]` are functional neutrals for depth and hairline edges. Text-bearing labels stay plain so pale text keeps its contrast margin.
- **Palette alpha derivatives.** Gradients and inset shadows may express palette colors as raw `rgba()` values (for example `rgba(244, 114, 182, 0.28)` for `rose`). The hue always comes from the palette.

## Responsive and accessibility notes

- Text targets at least 4.5:1 against the worst-case amber-side glass. Ink tokens and the `0.55` / `0.68` glass fills exist for that reason.
- All external links use `target="_blank"` with `rel="noreferrer noopener"`.
- Focus-visible outlines use the `focus` token with a visible offset.
- Progress bars expose `role="progressbar"` and `aria-valuenow`.
- The nutrition ring has an accessible text label.
- Heatmap color is not the only signal: totals, streaks, and recent logs are shown as text.
- `prefers-reduced-motion` disables equalizer motion, button scaling, and transitions.
- `prefers-reduced-transparency` replaces the glass with an opaque deep-plum surface. A `@supports not (backdrop-filter)` fallback does the same on browsers without blur.
- Cards use semantic headings (`h1` for the dashboard title, `h2` for cards).

## Editing the palette

Change the variables in `src/app/globals.css` under `@theme inline`. Tailwind utilities such as `bg-rose`, `text-text-secondary`, `border-glass-border`, and `bg-accent-emerald` update automatically. Heatmap ramps live in the `:root` block below the theme as `--color-heat-gym-*` and `--color-heat-reading-*`; they reference the theme tokens and recalculate automatically.
