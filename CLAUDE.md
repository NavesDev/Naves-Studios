# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static landing page for Naves Studios (personal software-dev studio). No build step, no
package manager, no dependencies. Three files do all the work: `index.html`,
`assets/css/style.css`, `assets/js/*.js`.

## Commands

There is no build, lint, or test tooling installed.

```bash
xdg-open index.html            # run the page (file:// — this is the target environment)
git log --oneline              # commit history
```

Before claiming a change works, open the page and exercise the affected section — that is
the only verification loop available. Adding tooling (test runner, linter, bundler) is a
design decision, not a routine step: it breaks the `file://` constraint below unless it
only produces plain static output. Ask before introducing it.

## Hard constraints

- **Runs from `file://`, no server.** Therefore: classic scripts only, never ES modules
  (`import`/`export` fail on `file://`). No `fetch` of local files. No build artifacts.
- **Global namespace `window.Naves`.** Every JS file is an IIFE that registers its classes
  onto `window.Naves`; load order in `index.html` is the dependency graph
  (`core.js` → `animations.js` → `main.js`, all `defer`).
- **Conservative syntax.** `var`, `function` constructors + `prototype`, no arrow
  functions/`class`/template literals in `assets/js/`. Match the existing style.
- **English in the source, Portuguese in the copy.** Class names, CSS custom properties,
  JS identifiers, `id` anchors, `data-*` attributes, and comments are English
  (`--blue`, `.reveal-target`, `RevealOnScroll.prototype.measureAll`). The visible page
  text stays pt-BR — the audience is Brazilian and `<html lang="pt-BR">`. Commit messages
  are English with conventional-commit prefixes (`feat:`, `refactor:`).
- **No stock images.** Illustrations and icons are hand-authored inline SVG.

## Architecture

Responsibility split in `assets/js/` — this is the part worth preserving:

| File | Role |
|---|---|
| `core.js` | Cross-cutting helpers: `RevealOnScroll` (IntersectionObserver with scroll fallback), `prefersReducedMotion()`, `viewportSize()` |
| `animations.js` | One constructor per visual effect, each DOM-agnostic — it receives its elements |
| `main.js` | The only file that queries the concrete DOM; wires selectors into the effect classes on `DOMContentLoaded` |

Consequence: an effect class never calls `document.querySelector`. New effect → add the
constructor to `animations.js`, export it on `window.Naves`, then instantiate it in
`main.js` with the elements it needs. Keep constructors small; split a growing effect into
collaborating classes rather than adding branches.

Effects communicate by observer, not by reaching into each other — see `ShowcaseScroll`
`.subscribe(callback)` feeding `ShowcaseCounter.update` in [main.js](assets/js/main.js:34).

Every effect must degrade under `prefers-reduced-motion: reduce` (final state, no
transition) and the page must remain readable with JS disabled.

## Design system

[DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) is the style reference; the `:root` block in
[style.css](assets/css/style.css:5) is the source of truth for values. Colors,
durations, radius, and widths are all tokens — never hardcode a hex, duration, or
breakpoint value that a token already covers, and add a new token rather than a one-off
literal. Same for JS: timings and thresholds are named constructor parameters with
defaults, not inline numbers.

Note `DESIGN-SYSTEM.md` is versioned (currently v0.3) and the CSS header states which
version it implements — update both together when tokens change.
