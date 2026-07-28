# Naves Studios — Design System v0.3

Single style reference for the landing page. The tokens live in
[`assets/css/base.css`](assets/css/base.css) (the `:root` block) — this document
explains **when** to use each one; the CSS is the source of truth for the values.

Principle: flat blocks of color, heavy typography, zero gradients, and a hand-drawn
scribble as the signature.

---

## Colors

| Token | Hex | Use |
|---|---|---|
| `--blue` | `#2495E8` | The lead — heroes, buttons, highlights |
| `--blue-strong` | `#1B7DC7` | Hover and depth |
| `--light` | `#BEE3FB` | Scribbles and text over blue |
| `--ink` | `#1A2B3A` | Headings and body copy |
| `--surface` | `#F5FAFE` | Breathing room between white sections |
| `--white` | `#FFFFFF` | Default background, text over blue |
| `--text-muted` | `#5A7184` | Secondary text, captions |
| `--border` | `#E3EEF7` | Card outlines and dividers |

Rules:

- No gradients. One block = one flat color.
- Text over `--blue` is `--white` (headings) or `--light` (support). Never `--ink`.
- `--surface` alternates with white to separate sections — it is not a card color.

## Typography

Single family: **Poppins** (`--font`), with `"Segoe UI", system-ui, sans-serif` as the
fallback. Contrast comes from weight, not from switching typeface: 800 shouts, 400 talks.

| Role | Token | Weight | Size |
|---|---|---|---|
| Display | `--t-display` | 800 | `clamp(2.6rem, 6vw, 4.4rem)`, `letter-spacing:-.02em` |
| Title | `--t-title` | 800 | `clamp(1.7rem, 3.4vw, 2.5rem)`, `letter-spacing:-.015em` |
| Subtitle | `--t-sub` | 600 | `1.15rem` |
| Body | `--t-body` | 400 | `1rem`, `line-height:1.65` |
| Eyebrow | `--t-caption` | 700 | `0.8rem`, uppercase, `letter-spacing:.22em`, color `--blue` |

## Layout

- `--content-width`: `1080px` — the content column (`.wrap`).
- `--content-width-wide`: `1320px` — the exception for the project showcase, which needs
  room to breathe (`.wrap-wide`).
- `--radius`: `8px` on everything with a corner. Discreet corners, never a pill (except
  chips and tags).
- `--section-space`: `88px` of vertical breathing room per section.
- `--header-height`: `58px` — the fixed header offsets the hero by exactly this much.

## Motion

Three speeds and **one** curve:

| Token | Value | Use |
|---|---|---|
| `--dur-micro` | `.18s` | Hover, focus, button states |
| `--dur-medium` | `.5s` | Panel swap, card reveal |
| `--dur-slow` | `.9s` | Section entrance |
| `--ease` | `cubic-bezier(.22,1,.36,1)` | Every transition |

Animation patterns in use:

- **Self-drawing scribble** — hand-drawn stroke animated via `stroke-dashoffset`.
- **Reveal on scroll** — the section rises in with a fade (class `.reveal-target`,
  switched on with `.visible`).
- **Words lifting off** — words rise from behind a mask (`.liftoff`).
- **Sticky showcase** — the mockup screen stays pinned while the copy scrolls beside it.

Every animation respects `prefers-reduced-motion: reduce`: the content appears in its
final state, with no transition. No motion that exists purely as decoration — the trailing
cursor was removed for exactly that reason.

## Components

### Buttons

Base `.btn`: uppercase, weight 700, `letter-spacing:.06em`, `padding:15px 32px`, radius
`--radius`, and `translateY(-2px)` on hover. A visible focus ring is mandatory
(`outline:3px solid var(--light)`).

| Variant | Background | Text | Where |
|---|---|---|---|
| `.btn-white` | white | `--blue` | Over blue blocks |
| `.btn-blue` | `--blue` | white | Primary action on a light background |
| `.btn-outline` | transparent, `--ink` border | `--ink` | Secondary action |
| `.btn-ghost` | transparent, translucent white border | white | Secondary action over the hero |
| `.btn-square` | — | — | 44×44 `+` icon, no uppercase |

`.magnetic` adds the subtle pull toward the cursor; it is optional and disappears under
`prefers-reduced-motion`.

### Cards

`.card`: white background, `--border` outline, radius `--radius`, `padding:34px 28px`,
lift on hover (`translateY(-8px)` plus shadow). In a trio, the middle card takes
`.card-featured` and becomes a blue block — hierarchy without needing a different size.

### Icons

Original SVGs, `viewBox="0 0 24 24"`, 2px stroke in `--blue`, rounded caps and joins.
The family's signature: a **filled ship-dot** (`fill:currentColor`) in every icon.
Current library: rocket, code, calendar, chat, growth, security, orbit, comet. Never use a
generic icon pack.

### Scribbles

Hand-drawn strokes that sign the brand: the rocket in the hero, the little wave under
section titles (`.squiggle`). Always `stroke` in `--blue` or `--light`, `stroke-width:3`,
round cap, `fill:none`.

## Logo

The "continuous N": a single stroke with an orbital loop on the diagonal. Two colors —
stems in white, diagonal in `--light`. File: [`assets/logo.svg`](assets/logo.svg).
It draws itself in the preloader.

## Implementation rules

- **English everywhere in the source** — class names, CSS custom properties, JS
  identifiers, `id` anchors, `data-*` attributes, and comments. The user-facing copy stays
  in Brazilian Portuguese: the audience is Brazilian, `<html lang="pt-BR">`.
- The page runs over `file://`, with no server. Therefore: **classic scripts**, never ES
  modules; the `window.Naves` namespace; no recent syntax that would break an old browser.
- JS split by responsibility: `core.js` (shared), `animations.js` (one class per effect),
  `main.js` (the only file that knows the concrete DOM and wires the pieces together).
- No stock imagery: illustrations are our own SVG.
- No magic numbers: every color, duration, radius, and width is a token; every JS timing or
  threshold is a named constant or a constructor parameter with a default.
