# Design System — Semantic Tokens

> Path: `frontend/src/theme.css` (`@theme` block + per-theme `:root[data-theme="X"]` overrides)
> Status: approved — living document; updated on every token add / rename / remove.
> Part of: `docs/specs/front/design-system/` | Index: [`_index.md`](./_index.md)

This document catalogs every **semantic** token exposed by the design
system. Semantic tokens are the only source of visual values that
components may reference (per the Component Contract and the Tailwind v4
layering rule: `base → semantic → component`).

The default theme (`phosphor`) is defined by the `@theme { … }` block; the
optional `default` theme (Terminal.css / Dracula-inspired) is applied via
`:root[data-theme="default"] { … }` and overrides the same semantic
tokens.

---

## Token Declarations

> Canonical source of truth for all agents. Two formats — keep both in sync.
> **CSS block**: implementation reference. Agents use Tailwind utility classes (`bg-surface`, `text-foreground`, `border-border`) exclusively.
> `var(--token-name)` is only allowed for dynamic inline values with no equivalent Tailwind utility.
> **YAML manifest**: machine-readable index for zero-ambiguity extraction by AI agents without CSS parsing.

> **Naming rule (Tailwind v4 / phosphor theme):** `--color-*` → `bg-*`, `text-*`, `border-*`, `ring-*` utilities.
> Token name becomes the class suffix directly — `--color-surface` → `bg-surface`, `text-surface`, `border-surface`.

```css
/* ── Phosphor theme (default) — semantic tokens in @theme {} ──────────────
   Values shown here are the phosphor (default) theme resolved values.
   Components reference ONLY semantic tokens — never base tokens or raw hex. */

/* Surfaces */
--color-background:         #0a0f0a;   /* page background */
--color-surface:            #101710;   /* panel / card surface */
--color-elevated:           #16221a;   /* raised surface — hover, sheet */
--color-hover:              #16221a;   /* hover state background */
--color-zebra:              #101710;   /* table zebra striping */
--color-muted:              #101710;   /* muted surface (secondary) */

/* Foreground */
--color-foreground:         #33ff66;   /* primary body text */
--color-muted-foreground:   #00cc44;   /* secondary text, captions */
--color-accent:             #aaffaa;   /* headings, primary accent text */

/* Primary + interaction */
--color-primary:            #33ff66;   /* primary action / active state */
--color-primary-foreground: #060a06;   /* text on primary background */
--color-primary-hover:      #aaffaa;   /* primary hover state */
--color-primary-active:     #00cc44;   /* primary active/pressed state */

/* Intent */
--color-info:               #33e0e0;   /* info accents (data tiles) */
--color-success:            #33ff66;   /* success accents */
--color-warning:            #ffb000;   /* warning accents */
--color-destructive:        #ff5555;   /* error / destructive */
--color-destructive-foreground: #060a06; /* text on destructive background */
--color-accent-alt:         #ff66cc;   /* alternate accent — magenta/roxo (Media Types tile) */

/* Borders + focus ring */
--color-border:             #1f3d29;   /* default border color */
--color-border-strong:      #00cc44;   /* interactive/hover border */
--color-ring:               #33ff66;   /* focus-visible ring */

/* Border width (separate namespace — NOT color) */
--border-DEFAULT:           1px;       /* default border width */

/* Radius — sharp corners (TUI identity) */
--radius-xs:   0px;
--radius-sm:   0px;
--radius-md:   0px;
--radius-lg:   0px;
--radius-xl:   0px;

/* Typography — monospace everywhere */
--font-mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, "SFMono-Regular",
             "Cascadia Code", Menlo, Consolas, "Liberation Mono", monospace;
--font-sans: var(--font-mono);   /* aliased — no sans stack */

/* Container-query scale */
--container-xs: 20rem;  /* 320px */
--container-sm: 24rem;  /* 384px */
--container-md: 28rem;  /* 448px */
--container-lg: 32rem;  /* 512px */
```

```yaml
# token-manifest — keep in sync with CSS block above
# Format: {category}.{token-suffix}: "{value}"
# Consumed by: UI Agent, Developer, Spec Validator (sync check)

color:
  background:               "#0a0f0a"   # page background (phosphor)
  surface:                  "#101710"   # panel / card surface
  elevated:                 "#16221a"   # raised surface
  hover:                    "#16221a"   # hover state background
  zebra:                    "#101710"   # table zebra striping
  muted:                    "#101710"   # muted surface
  foreground:               "#33ff66"   # primary body text
  muted-foreground:         "#00cc44"   # secondary text
  accent:                   "#aaffaa"   # headings / accent text
  primary:                  "#33ff66"   # primary action / active
  primary-foreground:       "#060a06"   # text on primary
  primary-hover:            "#aaffaa"   # primary hover
  primary-active:           "#00cc44"   # primary active/pressed
  info:                     "#33e0e0"   # info accent
  success:                  "#33ff66"   # success accent
  warning:                  "#ffb000"   # warning accent
  destructive:              "#ff5555"   # error / destructive
  destructive-foreground:   "#060a06"   # text on destructive
  accent-alt:               "#ff66cc"   # alternate accent (magenta/roxo — Media Types)
  border:                   "#1f3d29"   # default border
  border-strong:            "#00cc44"   # interactive/hover border
  ring:                     "#33ff66"   # focus ring
border:
  DEFAULT:                  "1px"       # default border width
radius:
  xs:  "0px"
  sm:  "0px"
  md:  "0px"
  lg:  "0px"
  xl:  "0px"
font:
  mono: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace'
  sans: "var(--font-mono)"
container:
  xs:  "20rem"
  sm:  "24rem"
  md:  "28rem"
  lg:  "32rem"
```

---

## 1. Color — semantic tokens

Every color token below must be defined **in both themes**. Adding a new
color token means editing `@theme` (phosphor) AND `:root[data-theme="default"]`
(default) in the same commit — otherwise the `default` theme silently falls
back to the phosphor value and the two themes diverge.

### 1.1 Surfaces

| Token | Phosphor value | Default (Dracula) value | Purpose |
|-------|---------------|--------------------------|---------|
| `--color-background` | `var(--color-term-bg-1)` (`#0a0f0a`) | `#050505` | Page background |
| `--color-surface` | `var(--color-term-bg-2)` (`#101710`) | `#000000` | Panel/card surface |
| `--color-elevated` | `var(--color-term-bg-3)` (`#16221a`) | `#111111` (derivado) | Raised surface (hover, sheet) |
| `--color-hover` | `var(--color-term-bg-3)` | `#1a1a1a` (derivado) | Hover state background |
| `--color-zebra` | `var(--color-term-bg-2)` | `#0c0c0c` (derivado) | Table zebra striping |
| `--color-muted` | `var(--color-term-bg-2)` | `#0c0c0c` | Muted surface (secondary) |

### 1.2 Foreground

| Token | Phosphor value | Default (Dracula) value | Purpose |
|-------|---------------|--------------------------|---------|
| `--color-foreground` | `var(--color-term-green)` (`#33ff66`) | `#cccccc` | Body text |
| `--color-muted-foreground` | `var(--color-term-green-dim)` (`#00cc44`) | `#666666` | Secondary text, captions |
| `--color-accent` | `var(--color-term-green-bright)` (`#aaffaa`) | `#ffffff` | Headings, primary accent text |

### 1.3 Primary + interaction

| Token | Phosphor value | Default (Dracula) value | Purpose |
|-------|---------------|--------------------------|---------|
| `--color-primary` | `var(--color-term-green)` | `#8be9fd` (cyan) | Primary action / active state |
| `--color-primary-foreground` | `var(--color-term-bg-0)` (near-black on green) | `#050505` | Text on primary background |
| `--color-primary-hover` | `var(--color-term-green-bright)` | `#a6f0ff` (derivado) | Primary hover state |
| `--color-primary-active` | `var(--color-term-green-dim)` | `#66d3ec` (derivado) | Primary active/pressed state |

### 1.4 Intent (info / success / warning / danger / **alt**)

| Token | Phosphor value | Default (Dracula) value | Purpose |
|-------|---------------|--------------------------|---------|
| `--color-info` | `var(--color-term-cyan)` (`#33e0e0`) | `#bd93f9` (blue/purple) | Info accents (data tiles) |
| `--color-success` | `var(--color-term-green)` | `#50fa7b` | Success accents (positive KPIs) |
| `--color-warning` | `var(--color-term-amber)` (`#ffb000`) | `#f1fa8c` | Warning accents |
| `--color-destructive` | `var(--color-term-red)` (`#ff5555`) | `#ff5555` | Error / destructive accents |
| `--color-destructive-foreground` | `var(--color-term-bg-0)` | `#050505` | Text on destructive background |
| **`--color-accent-alt`** | `#ff66cc` (magenta/roxo phosphor) — **NEW** | `#ff79c6` (Dracula pink) — **NEW** | Alternate accent — orthogonal to the four intent accents above. Introduced for the VISUAL VAULT `Media Types` KPI tile; consumed by `Panel` (accent="alt"), `StatPanel` (accent="alt"), and `Banner` (accent="alt") |

**Why `--color-accent-alt` exists.** The VISUAL VAULT dashboard needs
**five** distinct accents on its KPI grid — one per tile — and the four
existing intent tokens (info/success/warning/danger) already carry
semantic meaning. Media Types is not "info-flavored" or
"warning-flavored"; it needs an accent that reads as "another category"
without hijacking an intent slot. A single `alt` accent is the minimum
addition that solves the problem without opening the door to an unbounded
accent palette.

**Naming.** `--color-accent-alt` — *not* `--color-magenta` or
`--color-pink`, because the raw color is a **theme concern**: the phosphor
theme renders it as neon magenta on a CRT-green field; the Dracula theme
renders it as the standard Dracula pink. The semantic name `accent-alt`
survives both.

### 1.5 Borders + focus ring

| Token | Phosphor value | Default (Dracula) value | Purpose |
|-------|---------------|--------------------------|---------|
| `--color-border` | `var(--color-term-border)` (`#1f3d29`) | `#333333` | Default border color |
| `--color-border-strong` | `var(--color-term-green-dim)` | `#555555` (derivado) | Interactive/hover border |
| `--color-ring` | `var(--color-term-green)` | `#8be9fd` | `focus-visible` ring |

> **Gotcha #2 — two border namespaces.** `--color-border-*` is border
> **color**; `--border-*` is border **width**. Mixing them silently drops the
> border. Every component that uses accent-tinted borders (Alert, Panel,
> StatPanel, Banner, Card `tone="data|warning|danger"`) must use the
> `--color-*` namespace for color and the `--border-*` namespace for width.
> See `/CLAUDE.md → Known Gotchas`.

---

## 2. Radius

Radius is `0` across the board — the TUI/CRT identity forbids rounded
corners. Both themes inherit this from the `@theme` block; there are no
per-theme radius overrides.

| Token | Value | Purpose |
|-------|-------|---------|
| `--radius-xs` / `--radius-sm` / `--radius-md` / `--radius-lg` / `--radius-xl` | `0px` (all) | Sharp corners everywhere |

---

## 3. Border width

| Token | Value | Purpose |
|-------|-------|---------|
| `--border-DEFAULT` | `1px` | Default border width for every component |

Border width is theme-independent — both themes use `1px` everywhere.

---

## 4. Typography

Monospace-only across the entire kit. `--font-sans` is aliased to
`--font-mono` so the default Tailwind font stack is also monospace.

| Token | Value | Purpose |
|-------|-------|---------|
| `--font-mono` | `"JetBrains Mono", "IBM Plex Mono", ui-monospace, "SFMono-Regular", "Cascadia Code", Menlo, Consolas, "Liberation Mono", monospace` | Every text node |
| `--font-sans` | `var(--font-mono)` | Aliased — no separate sans stack |

---

## 5. Container-query scale

Used by `.max-w-*` / `.min-w-*` rules (see `theme.css` Gotcha #3
resolution — non-layered rules driven by `--container-*`).

| Token | Value |
|-------|-------|
| `--container-xs` | `20rem` |
| `--container-sm` | `24rem` |
| `--container-md` | `28rem` |
| `--container-lg` | `32rem` |

---

## 6. Adding a new semantic token — checklist

1. Add the token to `@theme { … }` in `theme.css` (phosphor / default theme).
2. Add the same token — with the theme-appropriate value — under
   `:root[data-theme="default"] { … }`.
3. Add a row to the appropriate table above.
4. Add the token to the `## Token Declarations` CSS block and `token-manifest` YAML block above (both must stay in sync — rule 10b).
5. Regenerate `docs/specs/front/design-system-rules.md` to reflect the new token (rule 12b — blocking).
6. If the token is a **color** used in a component variant, cross-reference
   the component spec (§6 of the component's `.component.spec.md`).
7. Verify WCAG 2.2 AA contrast for both themes at QA time.

---

## Changelog

| Version | Date | Author | Type | Description | CR |
|---------|------|--------|------|-------------|----|
| 1.0.0 | 2026-07-14 | Spec Writer | initial | First formalized token catalog; introduces `--color-accent-alt` (magenta/roxo phosphor + Dracula pink) for the VISUAL VAULT `Media Types` accent — consumed by `Panel` / `StatPanel` / `Banner` | -- |
| 1.1.0 | 2026-07-15 | Front Spec Agent | minor | Added `## Token Declarations` CSS block + `token-manifest` YAML block (required by FRONTEND-MANDATORY-ARTIFACTS rules 10a/10b); no new tokens added; content restructured for validator compliance | -- |
