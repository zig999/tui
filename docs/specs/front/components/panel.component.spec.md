# Panel -- Component Spec

> Path: `src/shared/components/ui/panel/`
> Used in features: — (shared UI primitive) | Status: approved | Layer: permanent

> Authored for the VISUAL VAULT dashboard shell — the family that groups
> content inside a boxed TUI frame with a title notched into the top border.

---

## 1. Purpose and Responsibilities

A `Panel` is a `<section>` with a full 4-sided border and a **title notched
into the top border line** (TUI convention `┌─ Título ─┐`). The title is
visually *cut into* the top rule (not printed above or below it), which is
the single visual identity of this component.

`Panel` is the base primitive for the dashboard shell family: `StatPanel`,
`Banner`, and any consumer-level card that must render with the notched-title
frame. It is a *pure layout container* — no interactivity, no local state,
no data logic.

**Explicit distinction from `Card`** (see `card.component.spec.md`):

| Aspect | `Card` | `Panel` |
|--------|--------|---------|
| Title placement | INSIDE the top-border, in a header block with a `▸` glyph + a horizontal ruler underneath | ON the top-border line — the border is broken by the title text (background-masked notch) |
| Semantic root | `<div>` (defaults to plain, becomes `role="button"` when `onClick` is passed) | `<section>` linked to the title via `aria-labelledby` — always non-interactive |
| Accent semantics | `tone` prop drives left-border-only accent (`border-l-2 border-<intent>`) | `accent` prop drives the **full-border** color (top/right/bottom/left) |
| Interactivity | Optionally interactive (`onClick`) | Never interactive — pure container |
| Compound family | Single component, slot props | Base for `StatPanel` / `Banner` compositions |

`Card` and `Panel` are **not interchangeable**. Consumers picking between
them choose on visual identity: the ruled-header card vs. the notched-frame
panel.

**Out of scope for this component:**

- Interactivity (`onClick`, `role="button"`, keyboard activation) — `Panel`
  is always a pure container. Interactive versions require wrapping the
  panel's children in an interactive element (button/link) at the consumer
  site.
- Collapsibility / expand-collapse — not part of the base primitive; a
  future `CollapsiblePanel` composition is out of scope for this spec.
- Nested panels sharing a border — each `Panel` renders its own complete
  frame; visual "sharing" of borders across siblings is a layout concern
  handled by the consumer.

---

## 2. When to Use / When Not to Use

| Use when | Do not use when |
|----------|-----------------|
| The consumer wants the TUI notched-title frame identity (matches the VISUAL VAULT dashboard shell) | The consumer wants the ruled-header identity → use `Card` instead |
| The consumer needs a labelled section container with `aria-labelledby` semantics wired to a visible title | The container must be interactive as a whole (clickable/keyboard-activatable) → wrap `Panel`'s content in a button/link, or use `Card` with `onClick` |
| The consumer needs a base primitive to compose `StatPanel` / `Banner` / other framed variants | The consumer only needs a bordered surface without a visible title → use `Card` (`tone="default"`, no `headerTitle`) |

---

## 3. Props Contract

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | yes | — | The text notched into the top border. Rendered inside a `<h3>` or `<h2>` (see §9); becomes the accessible name via `aria-labelledby` |
| `icon` | `ReactNode` | no | — | Optional icon rendered inline before the title text — either a lucide-react `Icon` or an emoji string. Rendered with `aria-hidden="true"` (the title text carries the accessible name); no size is enforced by `Panel` — the icon is rendered as-passed and the consumer is responsible for sizing it consistently with the title line-height (recommended: `size-4` for lucide, `text-base` for emoji) |
| `accent` | `"default" \| "success" \| "info" \| "warning" \| "danger" \| "alt"` | no | `"default"` | Semantic accent — drives the full-border color; token mapping in §6 |
| `titleLevel` | `2 \| 3 \| 4` | no | `3` | Heading level rendered for `title`. `2` for top-level page panels, `3` for standard dashboard panels (default), `4` for deeply nested panels |
| `className` | `string` | no | — | Merged via `cn()` onto the root `<section>` |
| `children` | `ReactNode` | no | — | Panel body content, rendered inside the framed area below the notched-title top border |
| *(rest)* | `Omit<ComponentProps<"section">, "title">` | no | — | + native `<section>` attributes (passthrough via `{...props}`). Native `title` is excluded because the typed `title` prop above replaces it |

---

## 3.1 Data Contract

**Cross-prop join rules:**

| Prop A | Field A | Prop B | Field B | Relationship |
|--------|---------|--------|---------|--------------|
| `title` | (`string` value) | `icon` | (`ReactNode` value) | `icon` is optional and rendered inline before the title text. The title text alone is the accessible name — `icon` is decorative (`aria-hidden="true"`). When both are set, `icon` never contributes to the accessible name |

---

## 4. Component States

Not applicable — no `useState`/`useReducer`. `Panel` is a pure render function
with no state axis and no runtime-derived state that would affect behavior.

---

## 6. Variants and Compositions

CVA defined at module scope (Component Contract). Base class applied
unconditionally: `relative border bg-surface`.

The **top border is drawn on the section itself** (`border-t`), and the
title is positioned to visually break it: the title element uses
`bg-surface px-2 -mt-[0.6em]` (background-mask trick — the title's own
background covers the intersecting portion of the top rule, producing the
notched appearance). All four sides remain a single continuous border in
the DOM; the notch is purely presentational.

| Variant | Prop | Border color token | Title color token | Usage context |
|---------|------|--------------------|--------------------|----------------|
| `default` | `accent="default"` (default) | `border-border` | `text-foreground` | Neutral panel — matches most dashboard tiles |
| `success` | `accent="success"` | `border-success` | `text-success` | Positive KPIs / confirmations |
| `info` | `accent="info"` | `border-info` | `text-info` | Data / neutral-information tiles |
| `warning` | `accent="warning"` | `border-warning` | `text-warning` | Cautionary tiles |
| `danger` | `accent="danger"` | `border-destructive` | `text-destructive` | Error / critical-attention tiles |
| `alt` | `accent="alt"` | `border-accent-alt` | `text-accent-alt` | Alternate accent (magenta/roxo) — used by the `Media Types` KPI tile in VISUAL VAULT. Requires the `--color-accent-alt` token registered in `design-system/tokens.md` |

**Padding.** `Panel` uses a fixed internal padding of `p-4` on the body area
(the content region below the notched-title top border). Density variants
(`sm`/`md`/`lg`) are *not* exposed on the base primitive — callers with
custom density requirements pass their own `className` (e.g., `p-6`) to
override.

**Border width.** Always `1px` (`border` — Gotcha #2: `--border-DEFAULT: 1px`
in `theme.css`; the accent variants control **color only**, never width, so
switching accent never triggers the two-namespace border bug).

---

## 7. Do / Don't

| Do | Don't |
|----|-------|
| Use `Panel` when the notched-title TUI identity is required | Don't use `Panel` as a substitute for `Card` — they are distinct visual identities (§1); if the header should sit *inside* the box with a ruler underneath, use `Card` |
| Pass an `icon` inline with the title for VISUAL VAULT-style KPI tiles | Don't rely on `icon` for the accessible name — it is `aria-hidden="true"`; the `title` prop is the only source of the accessible name |
| Use `accent="alt"` for the magenta/roxo tile (Media Types) | Don't reuse existing semantic accents (info/success/warning/danger) for the Media Types tile — `alt` exists specifically because the magenta/roxo intent is orthogonal to the other five |
| Wrap interactive children (buttons/links) inside `Panel` when the panel's body should be actionable | Don't add `onClick` to `Panel` expecting it to become a single interactive target — the primitive is intentionally non-interactive; if that behavior is needed, use `Card` |

---

## 8. BDD Scenarios

### Default render

```
Given a Panel with title="Total Files" and no other props (accent defaults to "default")
When it mounts
Then it renders a <section> with border border-border bg-surface, aria-labelledby wired to the <h3> containing "Total Files", and the <h3> is positioned so its background masks the top border (the notch)
```

### Accent — alt (VISUAL VAULT Media Types tile)

```
Given a Panel with title="Media Types" and accent="alt"
When it mounts
Then the <section> has border-accent-alt on all four sides, the <h3> uses text-accent-alt, and the notch masking works identically to the default variant
```

### aria-labelledby wiring

```
Given a Panel with title="Duplicates" and icon={<AlertTriangle />}
When it mounts
Then the <section> has an aria-labelledby attribute referencing the <h3>'s id, the icon inside the <h3> has aria-hidden="true", and the accessible name of the section is exactly "Duplicates" (icon contributes nothing)
```

### Heading level override

```
Given a Panel with title="System Status" and titleLevel={2}
When it mounts
Then the title renders as <h2> (not <h3>), and aria-labelledby still resolves to that <h2>'s id
```

---

## 9. Accessibility Contract

| Requirement | Implementation |
|-------------|-----------------|
| Label | The `title` prop is rendered inside a heading element (`<h2>`/`<h3>`/`<h4>` per `titleLevel`, default `<h3>`) with a stable id (generated via `useId`); the root `<section>` has `aria-labelledby={titleId}` so screen readers announce the panel by its title |
| Keyboard | Not applicable — `Panel` is non-interactive; it has no focusable elements of its own (interactive children such as buttons and links are focusable — their behavior is out of scope for this component) |
| Focus management | Not applicable — no interactivity |
| ARIA states | `aria-labelledby` on the `<section>` is the only ARIA attribute set by the component; no `aria-expanded`, `aria-pressed`, `aria-busy`, or `aria-selected` exist because there is no state axis |
| Icon | When `icon` is provided, it is wrapped in a span (or rendered directly) with `aria-hidden="true"` so it never contributes to the accessible name — the visible title is the sole source of the panel's accessible name |
| Contrast | Border and title colors resolve to semantic tokens (see §6). All six accent variants must meet WCAG 2.2 AA contrast against `bg-surface` under both the `phosphor` (default) and `default` (Terminal.css/Dracula) themes — validated at QA time |

---

## 10. Internal Dependencies

| Component | Source | Usage |
|-----------|--------|-------|
| `cn` | `@/shared/lib/cn` | Merges base + variant Tailwind classes with consumer `className` |
| `cva` | `class-variance-authority` | Module-scope `panelVariants` declaration (Component Contract) |
| `useId` | `react` | Generates the stable id linking `<h*>` and `aria-labelledby` |

No dependency on any other UI-kit component. `Panel` is a leaf primitive
consumed by `StatPanel` and `Banner`.

---

## Changelog

> Mandatory — never remove previous entries. A Props Contract change (§3) requires a new version entry.

| Version | Date | Author | Type | Description | CR |
|---------|------|--------|------|-------------|----|
| 1.0.0 | 2026-07-14 | Spec Writer | initial | Initial spec for the notched-title TUI panel primitive; introduces the `accent="alt"` variant tied to the new `--color-accent-alt` design token | -- |
| 1.0.1 | 2026-07-14 | Spec Reviewer | patch | Minor corrections: removed §5 (omitted per template for pure display components); replaced prohibited terms "may" (§1, §9) and "etc." (§9) with precise language; status promoted to approved | -- |
