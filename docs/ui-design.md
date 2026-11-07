# UI design system

The visual direction is nocturnal, frosted, and atmospheric. Color is used sparingly: deep navy surfaces, ambient gradient orbs, and tiny accent highlights. Typography must stay crisp against the moody background.

## Design tokens

Tokens live in `src/app/globals.css` as Tailwind theme variables.

### Surfaces

| Token | Value | Use |
| --- | --- | --- |
| `canvas` | `#070811` | Page base |
| `surface` | `#0c0e1d` | Raised surfaces and inner panels |
| `glass` | `rgba(18, 22, 41, 0.45)` | Frosted card shell |
| `glass-border` | `rgba(255, 255, 255, 0.08)` | 1px light edge |
| `solid` | `rgba(12, 14, 29, 0.85)` | Text-heavy card core |

### Ambient orbs

| Token | Value | Use |
| --- | --- | --- |
| `glow-indigo` | `#3b2d6b` | Deep violet-indigo orb |
| `glow-teal` | `#1a434e` | Smoky teal atmospheric wash |
| `glow-amber` | `#5c3a21` | Warm vintage amber glow |

The orbs are fixed, blurred (`90px`), low-opacity, and drift slowly. Motion is disabled under `prefers-reduced-motion`.

### Telemetry accents

| Token | Value | Use |
| --- | --- | --- |
| `accent-emerald` | `#10b981` | Gym heatmap, streaks, success |
| `accent-emerald-deep` | `#047857` | Gym heatmap mid-levels |
| `accent-violet` | `#8b5cf6` | Reading heatmap, bookshelf |
| `accent-violet-deep` | `#6d28d9` | Reading heatmap mid-levels |
| `accent-spotify` | `#1db954` | Spotify shell |

### Micro-highlight palette

Used only at low opacity or for tiny accents, never as large background fills.

| Token | Value |
| --- | --- |
| `coral` | `#ff7e5f` |
| `peach` | `#feb47b` |
| `gold` | `#ffd166` |
| `sky` | `#68b0ab` |

### Typography

| Token | Value | Use |
| --- | --- | --- |
| `text-primary` | `#f8fafc` | Headers, stats, titles |
| `text-secondary` | `#94a3b8` | Timestamps, labels, hints |

Numbers use the Geist Mono font for a telemetry feel. Body copy uses Geist Sans.

## Solid core / frosted shell rule

This is the most important visual rule.

- **Frosted shell** (`glass-card`): low-opacity background, `backdrop-blur(24px)`, 1px light border. Used for:
  - gym and reading heatmaps
  - deck vault
  - Spotify shell
- **Solid core** (`solid-card`): `rgba(12, 14, 29, 0.85)` background. Used for:
  - nutrition
  - active bookshelf
  - Telegram dispatch guide
  - external link tiles

Text-heavy cards never use heavy blur behind body copy. The solid layer guarantees contrast and prevents muddy letterforms over the orbs.

## Bento layout

The desktop grid is 12 columns. Mobile is one column; tablet is two.

| Card | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Gym heatmap | full | full (2) | 7 |
| Nutrition | full | 1 | 5 |
| Reading heatmap | full | full (2) | 7 |
| Bookshelf | full | 1 | 5 |
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
- Dark themes use five explicit levels per card.
- Gym: emerald scale.
- Reading: violet scale.
- Weekday labels show Monday / Wednesday / Friday.
- Tooltips show value + human-readable date.
- Small screens get a horizontal-scroll container; the card itself never breaks the grid.

## Responsive and accessibility notes

- All external links use `target="_blank"` with `rel="noreferrer noopener"`.
- Focus-visible outlines use the `sky` token.
- Progress bars expose `role="progressbar"` and `aria-valuenow`.
- The nutrition ring has an accessible text label.
- Heatmap color is not the only signal: totals, streaks, and recent logs are shown as text.
- `prefers-reduced-motion` disables orb drift, equalizer motion, and transitions.
- Cards use semantic headings (`h1` for the dashboard title, `h2` for cards).

## Editing the palette

Change the variables in `src/app/globals.css` under `@theme inline`. Tailwind utilities such as `bg-canvas`, `text-text-secondary`, `border-glass-border`, and `bg-accent-emerald` update automatically.
