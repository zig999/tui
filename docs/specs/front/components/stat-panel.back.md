# StatPanel -- Implementation Spec

> Stack: React 19 + TypeScript 5 (strict) + Tailwind v4 | Version: 1.0.0 | Status: draft | Layer: permanent
> Business spec: `stat-panel.component.spec.md`
> Path: `frontend/src/shared/components/ui/stat-panel/`

> **Project note.** TUI is a pure frontend UI Kit — there is no backend, no
> database, no server-side integration. This document is the *implementation
> spec* for the `StatPanel` shared UI primitive: file structure, TypeScript
> shape, composition contract with `Panel`, and CVA policy. Sections of the
> canonical `TEMPLATE.back.md` that address server-side concerns (Data Model,
> Business Rules, State Machine, Domain Events, External Integrations) are
> marked *N/A* with an explicit reason.

---

## 1. Stack and Patterns

> Declare only values that differ from or extend `CLAUDE.md`.

| Aspect | Value | Note |
|--------|-------|------|
| Framework | React 19 (function component, `ref` as a prop) | CLAUDE.md default |
| Language | TypeScript 5, strict mode | CLAUDE.md default |
| Styling | Tailwind CSS v4 (semantic tokens only) | CLAUDE.md default |
| Class merge | `cn()` from `@/shared/lib/cn` (`extendTailwindMerge`) | CLAUDE.md default |
| Variant strategy | **No CVA in this component** — all variant axes (`accent`, `titleLevel`) are forwarded to `Panel`, which owns the `panelVariants` CVA declaration | Per Component Contract §"CVA only when there are 2+ visual variants" — `StatPanel` has zero own variants (see §3) |
| State | None (pure render function) | Component Contract |
| Data layer | N/A — no server calls | UI primitive |
| I18n | pt-BR strings inline (project-wide policy `i18n: false`) | CLAUDE.md default — but `StatPanel` has **no hard-coded strings**; every visible label (`title`, `value`, `caption`) comes from consumer props |

---

## 1.1 File Layout

Three files, matching the Component Contract. No additional files — the
stories file lives alongside per the shared-UI convention but is not part of
the implementation spec.

```
frontend/src/shared/components/ui/stat-panel/
  stat-panel.tsx         # named export: StatPanel (function component)
  stat-panel.types.ts    # named export: StatPanelProps (type)
  index.ts               # per-component barrel — sanctioned exception
  stat-panel.stories.tsx # presentation + component tests (out of scope for this file)
```

`index.ts` re-exports the single public surface:

```ts
// stat-panel/index.ts
export { StatPanel } from "./stat-panel";
export type { StatPanelProps } from "./stat-panel.types";
```

**Nothing else is re-exported.** In particular, no `statPanelVariants` CVA
is exported because none exists (§3). Consumers who need to compose visual
variants target `Panel` directly.

---

## 1.2 TypeScript Shape

`StatPanelProps` is the sole exported type. It is defined by *reusing* the
subset of `PanelProps` that `StatPanel` forwards, plus the two body-owned
props (`value`, `caption`). The intent is:

1. Never re-declare `accent`, `titleLevel`, `icon`, or the section-passthrough
   — they must stay in perfect sync with `PanelProps`.
2. Explicitly **exclude** `children` from the accepted props — the body is
   fully owned by the component (`.spec.md §3` note).

Reference shape (declarative; the concrete implementation is Dev-owned):

```ts
// stat-panel.types.ts
import type { ComponentProps, ReactNode } from "react";
import type { PanelProps } from "@/shared/components/ui/panel";

type PanelForwardProps = Omit<PanelProps, "children">;

export type StatPanelProps = PanelForwardProps & {
  /** Big centered value rendered inside the panel body. Rendered as `String(value)` — no formatting. */
  value: string | number;
  /** Optional short caption rendered below the value. */
  caption?: string;
};
```

**Rationale for `Omit<PanelProps, "children">` (not a hand-written union):**

- `StatPanel` must never accept a `children` prop (`.spec.md §3` note). If
  `Panel` later adds new props (e.g., a `data-*` slot attribute), `StatPanel`
  inherits them automatically without a spec churn.
- `title` (required), `icon`, `accent`, `titleLevel`, `className`, and the
  native `<section>` passthrough (`ComponentProps<"section">` minus `title`)
  all come "for free" through this `Omit`.

**Type-level guarantee (must be preserved during implementation).** Passing
`children` to `StatPanel` must be a TypeScript error, not a runtime overwrite.
The `Omit<PanelProps, "children">` shape is the mechanism — do not replace
it with an intersection that leaves `children` reachable.

---

## 2. Data Model

**N/A** — StatPanel is a stateless UI primitive with no persistence layer.
The "data" it renders is passed at composition site by the consumer (`value`,
`caption`, `title`, `icon`, `accent`). There is no domain entity, no table,
no migration.

---

## 3. Component Composition (replaces "Business Rules")

> Traditional BR sections map, in a UI-kit context, to *component contracts*
> — the invariants the implementation must satisfy so the consumer contract
> in `.spec.md` holds. Each item cross-references the section of `.spec.md`
> it enforces.

### CR-01 -- Delegate the frame to `Panel`
**Related spec section:** `.spec.md §1` (Purpose), `.spec.md §6` (Variants)
**Where enforced:** `stat-panel.tsx` render body
**Description:** The root element rendered by `StatPanel` is a `<Panel>`
element — never a bare `<section>`. All frame concerns (border, notched
title, `aria-labelledby`, icon slot, `titleLevel` heading) are delegated by
prop forwarding. `StatPanel` writes **zero** frame classes on its own root.
**Implication:** If a visual change to the frame is requested, the change
must land in `Panel`, not `StatPanel`. Forking the frame here is forbidden.

### CR-02 -- Own only the body layout
**Related spec section:** `.spec.md §6` (Body layout)
**Where enforced:** `stat-panel.tsx` render body — inner wrapper `<div>`
**Description:** The direct child of the `<Panel>` is a single wrapper
`<div>` with the fixed body classes:

```
flex flex-col items-center justify-center gap-1 py-2
```

Inside that wrapper, two nodes are rendered in order:

1. Value line — a `<div>` with `text-3xl font-semibold text-foreground`
   containing `String(value)`.
2. Caption line (only if `caption` is provided) — a `<div>` with
   `text-xs uppercase tracking-widest text-muted-foreground`.

These class strings are **hard-coded literals** in `stat-panel.tsx`. They
are not variant-driven — see CR-05.

### CR-03 -- No formatting of `value`
**Related spec section:** `.spec.md §3` (Props Contract), `.spec.md §7`
(Do/Don't)
**Where enforced:** value-line render — the JSX expression is exactly
`{String(value)}`. No `toLocaleString()`, no `Intl.NumberFormat`, no
unit-suffix logic. The rationale is that formatting is a consumer concern
(locale, unit, precision are all outside this primitive).
**Implication:** A `value={1234}` prop renders the literal glyphs `1234`,
not `1,234` or `1.234`. QA scenarios in `.spec.md §8` cover this.

### CR-04 -- Value color is `text-foreground`, never accent-tinted
**Related spec section:** `.spec.md §6`, `.spec.md §7`
**Where enforced:** value-line class list — `text-foreground` is present
unconditionally; no branch reads `accent` when writing the value line.
**Rationale:** The accent identity of a KPI tile lives on the border and
the notched title (owned by `Panel`). Tinting the value too would
double-encode the intent and reduce visual clarity. This is the single
opinionated visual decision `StatPanel` makes — do not "unify" it by
adding accent-tinted variants later without a spec revision.

### CR-05 -- No CVA declared in this component
**Related spec section:** `.spec.md §6`
**Where enforced:** `stat-panel.tsx` — the file must not import `cva`
from `class-variance-authority`, and no `statPanelVariants` symbol is
exported from `index.ts`.
**Rationale:** Component Contract mandates CVA "only when there are 2+
visual variants". `StatPanel`'s only variant axis is `accent`, which is
forwarded to `Panel` (and therefore lives inside `panelVariants`).
Introducing a local CVA here would either duplicate `panelVariants` or
add a single-variant CVA — both forbidden by the contract.

### CR-06 -- `className` merges onto the root `<Panel>`, not the body wrapper
**Related spec section:** `.spec.md §3` (Props Contract row for `className`)
**Where enforced:** `stat-panel.tsx` — the consumer `className` is
passed straight through to `<Panel className={className}>`. The inner
body wrapper receives only the hard-coded body classes from CR-02.
**Rationale:** The consumer's mental model is "I am styling the tile" —
the tile is the `<section>` rendered by `Panel`. Merging into the body
wrapper would silently break layout customizations (e.g., `min-h-*`,
`aspect-*`).

### CR-07 -- Section passthrough goes to `Panel`
**Related spec section:** `.spec.md §3` (rest prop row)
**Where enforced:** Destructure the four owned props (`value`, `caption`,
`className`, and the four Panel props that need explicit forwarding for
clarity — `title`, `icon`, `accent`, `titleLevel`), then spread `...rest`
onto `<Panel {...rest}>`. The native `<section>` attributes (`id`,
`data-*`, `aria-*` other than `aria-labelledby`, event handlers) reach
the DOM through `Panel`'s own passthrough.
**Implication:** Do **not** spread `...rest` onto the inner body wrapper
— it would leak unrelated DOM attributes to the wrong element.

### CR-08 -- Never accept `children`
**Related spec section:** `.spec.md §3` note
**Where enforced:** `StatPanelProps` uses `Omit<PanelProps, "children">`
(see §1.2). Runtime enforcement is not needed because the type gate is
the enforcement — TS strict mode rejects the extra prop at the call site.
**Implication:** If a consumer needs arbitrary body content, they use
`Panel` directly (documented in `.spec.md §3` and `.spec.md §7`).

---

## 4. State Machine

**N/A** — `StatPanel` has no state axis. It is a pure render function of
its props. `.spec.md §4` states this explicitly. There is nothing to
transition between.

---

## 5. Domain Events

**N/A** — `StatPanel` emits no callbacks (`.spec.md §5`). It has no
`onClick`, no `onChange`, no lifecycle hook that would surface an event.
There is no domain event to schema.

---

## 6. External Integrations

**N/A** — the only "integration" is the intra-package dependency on
`Panel`. Documented in §7.

---

## 7. Internal Integrations (UI-Kit Dependencies)

| Consumed symbol | Source module | Purpose | Coupling |
|-----------------|---------------|---------|----------|
| `Panel` (component) | `@/shared/components/ui/panel` | Renders the frame, notched title, border color, `aria-labelledby` | **Hard runtime dependency** — `StatPanel` is a composition, not a fork |
| `PanelProps` (type) | `@/shared/components/ui/panel` | Source of truth for the forwarded prop surface (§1.2) | **Hard type dependency** — `StatPanelProps` is derived via `Omit<PanelProps, "children">` |
| `cn` (function) | `@/shared/lib/cn` | Merges consumer `className` — actually only relevant if `StatPanel` chose to add its own root-level classes. In the current design it only forwards `className` to `Panel`, so `cn()` is **not required** in `stat-panel.tsx`. If a future revision adds root-level classes, `cn(baseClasses, className)` must be used |
| `React` (`ReactNode`) | `react` | Type for `icon` (via `PanelProps`) and — if used — inline JSX helpers | Standard |

**No imports from any sibling feature.** `StatPanel` lives under
`shared/components/ui/`, and its only cross-cutting import source is
`shared/` itself (per CLAUDE.md architecture rule).

**No import of `cva` / `VariantProps`** — see CR-05.

**No import of icon libraries.** `StatPanel` never renders an icon on its
own; the `icon` prop is forwarded verbatim to `Panel`. `lucide-react`
imports live at the consumer site.

---

## 8. Known Technical Constraints

1. **Panel API is upstream.** Every prop `StatPanel` forwards (`title`,
   `icon`, `accent`, `titleLevel`, `className`, `...rest`) must exist on
   `PanelProps` with the same shape. A breaking change to `PanelProps`
   (rename, removal, type narrowing) breaks `StatPanel` at compile time —
   which is the desired behavior (surface the conflict, do not average
   it — CLAUDE.md Golden Rule 7). QA gate: TypeScript compilation must
   pass without `any`.

2. **Tailwind v4 border namespace (Gotcha #2).** Not directly relevant —
   `StatPanel` writes no border classes. All border concerns live in
   `Panel`. Documenting the constraint here so future revisions do not
   silently add `border-*` classes to the body wrapper.

3. **Bundle budget (< 300 kb gzipped, CLAUDE.md Performance Budgets).**
   `StatPanel` adds only its own function body + type re-exports. No new
   runtime dependency. Impact on the initial bundle is trivial (< 1 kb).

4. **No `useMemo` / `useCallback` needed.** The render body has no
   expensive computations and no reference-identity-sensitive props
   (no callback props exist). Premature memoization is forbidden by
   Golden Rule 2 (Simplicity First).

5. **Rendering order stability.** Because `caption` is conditionally
   rendered, React key stability is guaranteed by the fixed positional
   order (value first, caption second). No `key` prop is required on
   either child — they are static siblings, not a list.

---

## 9. Out of Scope

- **Trend / delta indicator.** No up/down arrow, no percentage delta.
  Explicitly deferred to a future `TrendStatPanel` composition
  (`.spec.md §1`).
- **Sparkline / inline chart.** Data-viz is out of scope per
  `docs/specs/decisions.md`.
- **Interactivity.** No `onClick`, no `role="button"`, no keyboard
  activation. Consumers wrap the `StatPanel` in a `<button>`/`<a>` or
  router `<Link>` at the composition site (`.spec.md §1`).
- **Number formatting.** No `toLocaleString()`, no unit-suffix logic.
  Consumers format before passing to `value` (CR-03).
- **Machine-parseable value markup.** The value is rendered inside a
  plain `<div>`, not `<data>` / `<output>` / `<dfn>`. Flagged for spec
  review if a machine-parseable value is ever required (`.spec.md §9`).
- **Storybook stories file.** `stat-panel.stories.tsx` exists per the
  Component Contract, but its content is defined by
  `u-fe-standards`/`u-ui-design` — not by this implementation spec.
- **Design tokens.** `--color-accent-alt` and all other semantic tokens
  are owned by `theme.css` under `@theme`. `StatPanel` only *consumes*
  them (transitively through `Panel`).

---

## 10. Implementation Acceptance Checklist

For the FE Developer implementing this component. All items are gates.

- [ ] Three files created under `frontend/src/shared/components/ui/stat-panel/`:
      `stat-panel.tsx`, `stat-panel.types.ts`, `index.ts`.
- [ ] `StatPanelProps` derives from `Omit<PanelProps, "children">` — no
      hand-written duplication of `title` / `icon` / `accent` /
      `titleLevel` types.
- [ ] `children` cannot be passed to `<StatPanel>` (TS error, verified by
      `npx tsc --noEmit`).
- [ ] `stat-panel.tsx` does **not** import `cva` or `VariantProps`.
- [ ] The root JSX element is `<Panel …>`, never a bare `<section>`.
- [ ] The value line uses `text-3xl font-semibold text-foreground` and
      renders `String(value)` verbatim (no formatting).
- [ ] The caption line, when rendered, uses
      `text-xs uppercase tracking-widest text-muted-foreground`.
- [ ] `className` is forwarded to `<Panel>`, not to the body wrapper.
- [ ] `...rest` is spread on `<Panel>`, not on the body wrapper.
- [ ] `ref` is a normal prop (React 19) — no `forwardRef`.
- [ ] `index.ts` exports only `StatPanel` (value) and `StatPanelProps`
      (type). No `statPanelVariants` symbol.
- [ ] All `.spec.md §8` BDD scenarios pass as Storybook component tests.

---

## Changelog

> Mandatory — never remove previous entries.

| Version | Date | Author | Type | Description | CR |
|---------|------|--------|------|-------------|----|
| 1.0.0 | 2026-07-14 | Back Spec Agent | initial | Initial implementation spec for `StatPanel`: three-file layout, `Omit<PanelProps, "children">` type derivation, no local CVA (accent forwarded to `Panel`), fixed body layout classes, no formatting of `value`, `text-foreground` value color; sections 2/4/5/6 marked N/A because this is a pure frontend UI-kit primitive with no backend, no state, no events, and no external integrations | -- |
