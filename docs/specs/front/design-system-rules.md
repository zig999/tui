# Design System — Rules (compact summary)

> Generated from: `docs/specs/front/design-system/` | Layer: permanent
> This file is the **minimum context** that every agent receives. For complete details, consult the files in the `design-system/` directory.

---

## Context

- **Color mode:** dark-only (phosphor theme default + default/Dracula theme)
- **Visual personality:** minimal, intensity 4 — TUI/CRT phosphor terminal; monospace everywhere; sharp corners; box borders; glow + scanline effects
- **Full details:** `design-system/_index.md`

---

## Available Tokens

> All tokens follow Tailwind v4 naming. Use Tailwind utility classes directly (`bg-surface`, `text-foreground`, `border-border`).
> `var(--token-name)` only for dynamic inline values with no equivalent Tailwind utility.

### Colors

| Token | Tailwind Classes | Intent |
|---|---|---|
| `--color-background` | `bg-background` | Page background |
| `--color-surface` | `bg-surface` | Panel / card surface |
| `--color-elevated` | `bg-elevated` | Raised surface (hover, sheet) |
| `--color-hover` | `bg-hover` | Hover state background |
| `--color-zebra` | `bg-zebra` | Table zebra striping |
| `--color-muted` | `bg-muted` | Muted surface |
| `--color-foreground` | `text-foreground` / `border-foreground` | Primary body text |
| `--color-muted-foreground` | `text-muted-foreground` | Secondary text, captions |
| `--color-accent` | `text-accent` | Headings, primary accent text |
| `--color-primary` | `bg-primary` / `text-primary` / `border-primary` | Primary action / active state |
| `--color-primary-foreground` | `text-primary-foreground` | Text on primary background |
| `--color-primary-hover` | `bg-primary-hover` | Primary hover state |
| `--color-primary-active` | `bg-primary-active` | Primary active/pressed state |
| `--color-info` | `text-info` / `border-info` / `bg-info` | Info accents |
| `--color-success` | `text-success` / `border-success` / `bg-success` | Success accents |
| `--color-warning` | `text-warning` / `border-warning` / `bg-warning` | Warning accents |
| `--color-destructive` | `text-destructive` / `border-destructive` / `bg-destructive` | Error / destructive |
| `--color-destructive-foreground` | `text-destructive-foreground` | Text on destructive background |
| `--color-accent-alt` | `text-accent-alt` / `border-accent-alt` / `bg-accent-alt` | Alternate accent — magenta/roxo (Media Types tile) |
| `--color-border` | `border-border` | Default border color |
| `--color-border-strong` | `border-border-strong` | Interactive / hover border |
| `--color-ring` | `ring-ring` / `outline-ring` | Focus-visible ring |

### Border width (separate namespace — NOT color)

| Token | Class | Value |
|---|---|---|
| `--border-DEFAULT` | `border` | 1px |

### Radius (all 0px — TUI identity)

| Token | Class | Value |
|---|---|---|
| `--radius-xs` | `rounded-xs` | 0px |
| `--radius-sm` | `rounded-sm` | 0px |
| `--radius-md` | `rounded-md` | 0px |
| `--radius-lg` | `rounded-lg` | 0px |
| `--radius-xl` | `rounded-xl` | 0px |

### Typography

| Token | Tailwind Class | Purpose |
|---|---|---|
| `--font-mono` | `font-mono` | All text — JetBrains Mono / IBM Plex Mono / ui-monospace |
| `--font-sans` | `font-sans` | Aliased to `--font-mono` — no separate sans stack |

### Container-query scale

| Token | Value |
|---|---|
| `--container-xs` | 20rem |
| `--container-sm` | 24rem |
| `--container-md` | 28rem |
| `--container-lg` | 32rem |

---

## Mandatory Rules

1. **Semantic tokens only** — components reference only the tokens listed above; never raw hex, never base tokens (`--color-term-*`)
2. **No `rounded-*` classes** — all radius tokens are `0px`; TUI identity forbids rounded corners
3. **Two border namespaces** — `--color-border-*` = border COLOR; `--border-*` = border WIDTH; never mix them (Gotcha #2)
4. **`bg-surface` for the notch mask** — `Panel` title background must match the panel surface to produce the notch visual
5. **`border-accent-alt` for Media Types** — the fifth KPI accent; never substitute a semantic intent token (info/warning/etc.) for Media Types
6. **Monospace everywhere** — `--font-sans` is aliased to `--font-mono`; no sans-serif stack exists
7. **No `tailwind.config.ts`** — all tokens live in `@theme {}` in `theme.css`
8. **`style={{}}` inline forbidden** — except dynamic values with no Tailwind equivalent
9. **`transition: all` forbidden** — specify animated properties explicitly
10. **Animations wrapped in `@media (prefers-reduced-motion: no-preference)`**
11. **No per-component `text-shadow`** — the global `:root` rule provides the phosphor glow; adding it per-component doubles the glow
12. **`accent-alt` is not a semantic intent** — do not use `text-accent-alt` / `border-accent-alt` to mean success, warning, error, or info

---

## Hard Constraints — R1–R25 (enforced)

> Every rule below is a **blocking** constraint. Violations must be corrected before delivery.

| Rule | Constraint | Anti-pattern ID |
|---|---|---|
| R1 — Spacing | Allowed px: 4/8/12/16/24/32/48/64 only. No arbitrary `p-[Xpx]` | `arbitrary-spacing`, `forbidden-spacing-class` |
| R2 — Form gaps | label→input `gap-1.5`; input→helper `gap-1`; field→field `gap-4`; group→group `gap-8`; last→submit `gap-6` | — |
| R3 — Card padding | Compact `p-2` · Small `p-3` · Medium `p-4` · Large `p-6` · XL `p-8` | — |
| R4 — Type scale | Sizes: 12/14/16/20/24/30px only. Max 3 sizes per component | `forbidden-font-size`, `too-many-font-sizes` |
| R5 — Line-height | Headings `leading-tight`; body `leading-relaxed`; caption `leading-snug`. Forbidden: `leading-none`, `leading-loose` | `forbidden-leading` |
| R6 — Font weight | Headings/labels `font-medium`/`font-semibold`; body `font-normal`; metrics `font-semibold`/`font-bold` | `font-weight-on-body` |
| R7 — Text hierarchy | Hierarchy via opacity only (100%/60%/40%). Forbidden: different hues per level. Max 3 levels per component | `hue-based-text-hierarchy` |
| R8 — Contrast | 4.5:1 normal text; 3:1 large/interactive. Both themes verified | `color-only-state` |
| R9 — 60-30-10 | Accent only on CTAs / intent tiles. Max 2 accents per component. Semantic colors: error=`destructive` · success=`success` · warning=`warning` · info=`info` | `accent-on-structural`, `semantic-color-decorative` |
| R10 — Aspect ratios | Images: 1:1 / 4:3 / 16:9 / 1:1.618 only. Always `object-cover` | `arbitrary-image-ratio` |
| R11 — Touch targets | Min `h-8` (32px) desktop; `h-11` (44px) mobile | `clickable-below-32px` |
| R12 — Alignment | Every element shares axis with at least one other. Icon+text `items-center gap-2` | — |
| R13 — Border radius | **Sharp style** — all components: `0px` (no `rounded-*`). Forbidden: any rounded corner | `mixed-border-radius` |
| R14 — Button hierarchy | Never 2 Primary buttons in same context. Danger only for irreversible destructive | `two-primary-buttons`, `danger-as-default` |
| R15 — 5 states | All interactive elements: Default/Hover/Focus/Active/Disabled. Focus ring mandatory | `incomplete-states`, `focus-ring-missing` |
| R16 — Input validation | Error/success always with helper text. Never border color alone | `error-border-only`, `error-as-popup` |
| R17 — Table density | `py-2` / `py-3` / `py-4` only. One per table. Header: `text-xs font-medium uppercase` | `table-density-mixed` |
| R18 — Card grid | Always `repeat(auto-fill, minmax(Xpx, 1fr))`. Gap: `gap-4` or `gap-6` only | `fixed-grid-columns` |
| R19 — Loading feedback | <100ms: nothing; 100ms–1s: inline spinner; 1s+: skeleton. No full-screen spinner | `no-loading-state` |
| R20 — Error messages | Always: icon (16px) + title + description + action. No codes/stack traces | `error-message-incomplete` |
| R21 — Icons | Sizes: 14/16/20/24px only. Explicit `w-* h-*`. Max 24px functional | `icon-size-inherited` |
| R22 — Avatars | Sizes: 24/32/40/48/64/80px only. 1:1 ratio | `avatar-off-scale` |
| R23 — Animations | Durations: 100/200/300/500ms only. Max 2 properties. All in `@media (prefers-reduced-motion: no-preference)` | `animation-duration-forbidden` |
| R24 — Z-index | Only: `z-0`/`z-10`/`z-20`/`z-30`/`z-40`/`z-50`. No inline style | `z-index-outside-scale` |
| R25 — Empty states | Every list/table/grid must have empty state: icon+title+description+action | `list-without-empty-state` |

---

## Where to Find Details

| I need... | File |
|---|---|
| All token values, CSS block, YAML manifest, `--color-accent-alt` documentation | `design-system/tokens.md` |
| CRT effects (glow, scanline), Z-index scale, layout patterns, density limits | `design-system/composition.md` |
| Component catalog, slot/state/token tables, Panel family do/don't | `design-system/components.md` |
| Accessibility, WCAG contrast table, QA checklist, animations | `design-system/implementation.md` |
| System principles, visual context, changelog | `design-system/_index.md` |
