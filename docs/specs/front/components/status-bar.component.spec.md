# StatusBar -- Component Spec

> Path: `src/shared/components/ui/status-bar/`
> Used in features: — (shared UI primitive) | Status: draft | Layer: permanent

> Terminal-style footer strip with three segments (left / center / right)
> — inspired by tmux / VS Code / VISUAL VAULT status lines. Not a `Panel`
> (no notched title, no border on all sides).

---

## 1. Purpose and Responsibilities

`StatusBar` is a horizontal footer strip with three named slots — `left`,
`center`, `right` — for terse, always-visible status information (mode
indicators, connection state, keyboard hints, timestamps). It is
deliberately **not** a `Panel`: no title-on-border, no full 4-sided frame.

Visual identity:

- Single-line, monospace, `text-xs` — a compact strip.
- Full-width, with a top border only (`border-t border-border`) — the bar
  sits below page content and separates it from the viewport bottom edge.
- Three flex regions: `left` (justify-start), `center` (justify-center,
  optional), `right` (justify-end). Any slot may be omitted; when a slot is
  omitted its region still occupies space (to keep the other slots in their
  positions) unless all three are `undefined`, in which case the bar
  renders empty but still occupies its layout height.

**Out of scope for this component:**

- Interactivity of the bar itself (`onClick` on the root) — the bar is a
  pure container; individual slot contents can be interactive but are the
  consumer's responsibility.
- Vertical status bars (sidebar-column status). The bar is horizontal-only.
- Sticky positioning — the parent layout controls stick behavior; the
  component renders in normal document flow.
- Rotating / marquee content — the slots are static; if the consumer needs
  a scrolling status message, they render their own animated child.

---

## 2. When to Use / When Not to Use

| Use when | Do not use when |
|----------|-----------------|
| Rendering a compact footer strip below the page content (VISUAL VAULT status line) | The status information is transient / interruptive → use a `sonner` toast instead |
| Displaying always-visible metadata: mode, connection, timestamp, keyboard hint | The information is a validation/error tied to a section → use `Alert` in-flow |
| The status must fit on one line at all supported viewports (≥ 320px) | The content will wrap or overflow → shrink the content or use a `Panel` above the bar |

---

## 3. Props Contract

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `left` | `ReactNode` | no | — | Left-aligned slot. Typical content: mode indicator, primary status |
| `center` | `ReactNode` | no | — | Center-aligned slot. Typical content: current filter / active dataset / breadcrumb summary |
| `right` | `ReactNode` | no | — | Right-aligned slot. Typical content: timestamp, connection state, keyboard hint |
| `ariaLabel` | `string` | no | `"Status bar"` | Accessible name for the root landmark. Override when the bar's role in the page is more specific (e.g., `"Player status"`) |
| `role` | `"status" \| "contentinfo" \| "none"` | no | `"status"` | Landmark/live-region role. `"status"` (default): announces content changes politely. `"contentinfo"`: labels the bar as a page-level footer landmark (use when the bar is the direct footer of `<body>`/`<main>`). `"none"`: no role — the bar is decorative |
| `className` | `string` | no | — | Merged via `cn()` onto the root `<div>` |
| *(rest)* | `Omit<ComponentProps<"div">, "role">` | no | — | Native `<div>` attributes passthrough. Native `role` is excluded because the typed `role` prop above constrains the allowed values |

---

## 3.1 Data Contract

**Cross-prop join rules:**

| Prop A | Field A | Prop B | Field B | Relationship |
|--------|---------|--------|---------|--------------|
| `left` / `center` / `right` | (`ReactNode`) | (n/a) | — | The three slots are independent; any subset may be provided. When a slot is `undefined`, its `<div>` region still renders (as an empty flex item) so the remaining slots stay at their expected justify positions. Rationale: preserving layout across dynamic updates (a `center` slot appearing/disappearing must not shift `right` to the middle) |
| `role` | `"status"` | (n/a) | — | Assistive tech announces changes to the bar's text content politely (via the implicit `aria-live="polite"` associated with `role="status"`). Do not use for high-frequency updates (e.g., every-second timestamps) — that produces announcement spam |

---

## 4. Component States

Not applicable — no internal state.

---

## 5. Events Emitted

Not applicable — no callback props.

---

## 6. Variants and Compositions

No CVA — the bar has a single visual variant.

Layout classes (fixed, non-configurable):

- Root: `flex w-full items-center justify-between gap-4 border-t border-border bg-surface px-4 py-1 text-xs text-muted-foreground`.
- Slot regions:
  - `left`: `flex-1 flex items-center justify-start gap-2`
  - `center`: `flex-1 flex items-center justify-center gap-2`
  - `right`: `flex-1 flex items-center justify-end gap-2`

All three regions have `flex-1` so they share the horizontal space equally
— this is what keeps `right` pinned to the right and `center` truly
centered independent of `left`'s content width.

The bar consumes only semantic tokens — no raw colors, no hardcoded
spacing outside the Tailwind scale.

---

## 7. Do / Don't

| Do | Don't |
|----|-------|
| Keep each slot's content compact (single line, short strings) | Don't render block-level or multi-line content inside the slots — the bar is single-line by design |
| Use `role="contentinfo"` when the bar is the page's direct footer landmark | Don't leave `role="status"` (default) with a high-frequency timestamp — polite live-region announcements will spam assistive tech; either downgrade to `role="none"` or debounce the timestamp updates at the consumer |
| Use lucide-react icons + short text pairings for indicators | Don't put interactive elements (buttons, links) as the *only* content of a slot — the bar's role="status" implies a passive display; if interaction is required, use `role="none"` and wire the interactive children's own labels |

---

## 8. BDD Scenarios

### Default render

```
Given a StatusBar with left="Ready", center="/home/user", right="12:34"
When it mounts
Then it renders a <div role="status" aria-label="Status bar"> with the three regions rendered as three flex-1 <div>s (justify-start / justify-center / justify-end), each showing its slot content
```

### Empty slot preserves layout

```
Given a StatusBar with only left="Idle" and right="12:34" (no center)
When it mounts
Then it renders three flex-1 regions; the middle region is empty; "Idle" appears at the left edge and "12:34" appears at the right edge (i.e., "12:34" is NOT centered)
```

### Role override — contentinfo

```
Given a StatusBar with role="contentinfo" and ariaLabel="Application footer"
When it mounts
Then the root <div> has role="contentinfo" and aria-label="Application footer"; the assistive-tech landmark tree exposes it as a footer landmark
```

### Live-region announcement

```
Given a StatusBar with role="status" (default) and center="Ready"
When the consumer updates center to "Loading..."
Then the polite live region announces "Loading..." (browser/screen-reader dependent — the component's contribution is the role attribute, not the actual TTS)
```

### Decorative role

```
Given a StatusBar with role="none" and left="Version 1.0.0"
When it mounts
Then the root <div> carries no ARIA role (role="none" removes all ARIA semantics); assistive tech does not expose it as a landmark or live region; the slot content "Version 1.0.0" renders visually but is not announced as part of a named region
```

---

## 9. Accessibility Contract

| Requirement | Implementation |
|-------------|-----------------|
| Label | `aria-label={ariaLabel}` on the root `<div>` — defaults to `"Status bar"` (pt-BR project; the string is intentionally English because it's a technical label — the visible content in the slots is what the user sees, and it may be in any language) |
| Keyboard | Not applicable — the bar itself is non-interactive; children within slots follow their own contracts |
| Focus management | Not applicable |
| ARIA states | `role={role}` on the root — `"status"` (implicit `aria-live="polite"`), `"contentinfo"` (landmark), or `"none"` (decorative) |
| Live region | When `role="status"`, browsers/AT expose the region as `aria-live="polite"` — changes to slot text content are announced. High-frequency updates should be avoided (see §7 and §3.1) |
| Contrast | The bar uses `text-muted-foreground` on `bg-surface` — the muted foreground/surface pair must meet WCAG 2.2 AA (≥ 4.5:1 for regular text) under both themes; validated at QA time |

---

## 10. Internal Dependencies

| Component | Source | Usage |
|-----------|--------|-------|
| `cn` | `@/shared/lib/cn` | Merges consumer `className` with the layout classes |

No dependency on any other UI-kit component. `StatusBar` is a leaf
primitive.

### File layout (Component Contract)

Following the project Component Contract (CLAUDE.md §Stack — Frontend):

```
src/shared/components/ui/status-bar/
  status-bar.tsx           # component implementation (ref as prop, cn() merge)
  status-bar.types.ts      # StatusBarProps (Omit<ComponentProps<"div">, "role"> extension)
  status-bar.stories.tsx   # canonical presentation + component tests (addon-vitest)
  index.ts                 # re-exports StatusBar and StatusBarProps
```

### Storybook location

`Layout/StatusBar` — the meta title places the component under the
`Layout/` section of the Storybook sidebar, alongside `Layout/Panel` and
`Layout/Panel — Dashboard`. Rationale: `StatusBar` is a layout primitive
(footer strip); it is grouped with the other shell / dashboard-shell
components rather than under `Feedback/` (where `Alert`/`Banner` live) or
`Navigation/` (where `MenuBar` lives) — this matches the way the VISUAL
VAULT dashboard shell composes Panel + StatPanel + StatusBar + MenuBar.

Required stories:

- `Default` — all three slots populated (`left="Ready"`,
  `center="/home/user"`, `right="12:34"`); validates the three-region
  layout and `role="status"` + `aria-label="Status bar"` defaults.
- `EmptyCenter` — `left` + `right` only; validates that `right` stays
  pinned to the right edge (BDD §8 "Empty slot preserves layout").
- `ContentInfoRole` — `role="contentinfo"` with a custom `ariaLabel`;
  validates the landmark override (BDD §8 "Role override — contentinfo").
- `DecorativeRole` — `role="none"`; validates the decorative branch
  (no landmark, no live region — BDD §8 "Decorative role").

Each story renders inside a `min-h-24 flex flex-col justify-end` frame so
the bar sits at the visual bottom of the story canvas — reflecting how it
appears in real usage. Stories double as component tests via
`addon-vitest`; a11y is validated by `addon-a11y` on every story.

---

## Changelog

| Version | Date | Author | Type | Description | CR |
|---------|------|--------|------|-------------|----|
| 1.0.0 | 2026-07-14 | Spec Writer | initial | Initial spec for the three-slot footer strip; not a `Panel`; `role="status"` default with `contentinfo` / `none` overrides | -- |
| 1.1.0 | 2026-07-14 | Spec Writer | minor | Added §10 File layout (Component Contract) and Storybook location (`Layout/StatusBar`) with the four required stories (Default, EmptyCenter, ContentInfoRole, DecorativeRole) | -- |
| 1.2.0 | 2026-07-14 | Spec Reviewer | minor | Automatic corrections: replaced prohibited term "may" with "can" in §1 Out of Scope; added BDD scenario "Decorative role" (§8) to cover the `role="none"` branch required by the `DecorativeRole` story in §10; updated §10 story reference for DecorativeRole to cite BDD §8 | -- |
