# Design System — Implementation

> Part of: `docs/specs/front/design-system/` | Layer: permanent
> Index: [`_index.md`](./_index.md)

---

## 13. Animations and Micro-interactions

The TUI UI Kit is a **minimal-motion** design system. The CRT aesthetic is
visual (glow, scanlines) — it does not animate. Animations are reserved for
functional feedback only (modals, toasts, focus rings). No decorative
animation is permitted.

| Element | Duration | Easing | Animated Properties |
|---|---|---|---|
| Buttons (hover/active) | 100ms | `ease-in-out` | `background-color`, `box-shadow` |
| Inputs (focus) | 100ms | `ease-in-out` | `border-color`, `box-shadow` |
| Tabs / MenuBar triggers | 100ms | `ease-in-out` | `color`, `border-color` |
| Modals / Dialogs (entry) | 200ms | `ease-out` | `opacity`, `transform (scale)` |
| Modals / Dialogs (exit) | 150ms (~75% of entry) | `ease-in` | `opacity`, `transform (scale)` |
| Toasts / sonner (entry) | 200ms | `ease-out` | `opacity`, `transform (translateY)` |
| Sheets / drawers (open) | 300ms | `ease-out` | `transform (translateX)` |
| Sheets / drawers (close) | 225ms | `ease-in` | `transform (translateX)` |
| Dropdowns / Select (entry) | 100ms | `ease-out` | `opacity`, `transform` |
| Skeletons (pulse) | 1500ms loop | `ease-in-out` | `opacity` (continuous — exempt from 500ms cap) |
| Panel title notch | 0ms (no animation) | — | Static layout |

> All animations must be wrapped in `@media (prefers-reduced-motion: no-preference)`. The default (no `@media`) must produce no motion.

**Motion library:** `motion/react` (formerly Framer Motion). Always use `LazyMotion` + the `m` component — never the default `motion` import, to keep the initial bundle small.

**Forbidden durations:** 150ms for enters, 250ms, 350ms, 400ms — any value outside 100/200/300/500ms for enter transitions.

---

## 14. Accessibility

### 14.1 WCAG 2.2 AA Contrast

The TUI UI Kit targets **WCAG 2.2 AA** under both themes. Contrast must be
verified at QA time for both the `phosphor` theme and the `default` (Dracula)
theme.

| Combination | Phosphor ratio | Default ratio | WCAG Level | Usage |
|---|---|---|---|---|
| `text-foreground` (`#33ff66`) on `bg-surface` (`#101710`) | ~8:1+ | — | AA+ | Primary body text |
| `text-foreground` (`#cccccc`) on `bg-surface` (`#000000`) | — | ~13:1+ | AA+ | Default theme body text |
| `text-muted-foreground` (`#00cc44`) on `bg-surface` (`#101710`) | ~5:1+ | — | AA | Captions, secondary text |
| `text-muted-foreground` (`#666666`) on `bg-surface` (`#000000`) | — | ~4.5:1+ | AA | Default theme captions |
| `text-accent-alt` (`#ff66cc`) on `bg-surface` (`#101710`) | ~8:1+ | — | AA | `Panel` `accent="alt"` title |
| `text-accent-alt` (`#ff79c6`) on `bg-surface` (`#000000`) | — | ~8:1+ | AA | Default theme `accent="alt"` |
| `border-border` on `bg-surface` | ~3:1+ | — | AA (UI) | Panel borders (large UI element) |

> Ratios are estimates; precise values must be verified with a contrast checker at QA time.

### 14.2 Keyboard Navigation

| Requirement | Implementation |
|---|---|
| `Panel` / `StatPanel` / `Banner` / `StatusBar` | Not keyboard-navigable — they are non-interactive containers. Interactive children (buttons, links) are focusable per their own contracts |
| `Tabs` / MenuBar composition | `Tab` / `Shift+Tab` to move between `TabsTrigger`s (roving tabIndex: `0` for active, `-1` for others); no arrow-key roving (inherited gap from `Tabs` primitive — see `tabs.component.spec.md §1`) |
| Decorative pipe spans in MenuBar | `aria-hidden="true"` — excluded from focus order |

### 14.3 Focus Management

| Component | Focus rule |
|---|---|
| `Dialog` | On open: focus first interactive element; on close: return focus to the trigger |
| `Sheet` | Same as `Dialog` |
| `Panel` / `Banner` / `StatusBar` | No focus management — non-interactive containers; focus flows through children naturally |

### 14.4 ARIA Patterns

| Component | Root role | ARIA attributes |
|---|---|---|
| `Panel` | `<section>` (implicit `region` when labelled) | `aria-labelledby={titleId}` |
| `StatPanel` | `<section>` (inherited from `Panel`) | `aria-labelledby={titleId}` (inherited) |
| `Banner` (`frame="none"`) | `<header>` (native banner landmark when direct child of `<body>`) | None set by component; consumer adds `role="banner"` if nesting requires it |
| `Banner` (`frame="notched"`) | `<section>` (inherited from `Panel`) | `aria-labelledby={titleId}` (inherited from `Panel`) |
| `StatusBar` | `<div>` | `role="status"` (default) / `"contentinfo"` / `"none"` + `aria-label` |
| Decorative icons | `<span>` / icon element | `aria-hidden="true"` |

### 14.5 Screen Reader Announcements

| Component | Announced as |
|---|---|
| `Panel` | "Título — region" (landmark announced when `<section>` has `aria-labelledby`) |
| `StatPanel` | Same as `Panel`; the value text is announced as part of the section's content (not an ARIA role) |
| `StatusBar` with `role="status"` | Content changes are announced politely (implicit `aria-live="polite"`) |
| `StatusBar` with `role="contentinfo"` | Page-level footer landmark |

---

## 15. Visual QA Checklist — Panel Family

Use this checklist during implementation review and visual QA.
Mark completed only when verified in the actual browser rendering, not in the spec.

**Panel / StatPanel / Banner / StatusBar**
- [ ] All borders use `border` class (1px width from `--border-DEFAULT`) — never `border-2` or heavier
- [ ] Border color comes from `border-{accent}` token — never a raw hex `style={}`
- [ ] No `rounded-*` class anywhere in these components (all 0px)
- [ ] Title notch works in both phosphor and default themes: `bg-surface` masks the top border correctly in both cases
- [ ] `aria-labelledby` on `<section>` resolves to the visible `<h*>` element
- [ ] Icon in `Panel` / `StatPanel` title has `aria-hidden="true"`
- [ ] Phosphor glow on `text-accent-alt` (`border-accent-alt`) is visible in phosphor theme without being overwhelming
- [ ] `StatPanel` value renders at `text-3xl font-semibold text-foreground` — never tinted with the accent color
- [ ] `Banner` `action` slot is absolutely positioned in the top-right and does not overlap the centered title on viewports ≥ 640px
- [ ] `StatusBar` three-region layout: `left` stays left, `center` stays truly centered, `right` stays right even when one slot is empty (achieved via `flex-1` on all three)
- [ ] `StatusBar` `role="status"` does not get a high-frequency timestamp update without debouncing

**MenuBar (Tabs composition)**
- [ ] Pipe `<span>`s have `aria-hidden="true"` and `select-none`
- [ ] `queryAllByRole('tab')` returns only the `TabsTrigger`s (not the pipe spans)
- [ ] Active `TabsTrigger` has `aria-selected="true"` and `tabIndex=0`
- [ ] Inactive `TabsTrigger`s have `tabIndex=-1`

**Storybook**
- [ ] `Dashboard` composition story mounts all 5 components (Panel, StatPanel, Banner, StatusBar, MenuBar) in the VISUAL VAULT layout
- [ ] `Dashboard` story has a `play()` function covering at least: render, aria-labelledby on Panels, pipes excluded from a11y tree
- [ ] All Panel family stories have `addon-a11y` passing (no violations)
- [ ] Stories run as component tests via `addon-vitest` (`play()` present and passing)

---

## 15.1 General QA Checklist (full kit)

**Spacing (R1)**
- [ ] No spacing values outside the Tailwind default scale used by this kit (multiples of 4px)
- [ ] No arbitrary spacing values such as `p-[13px]` or `gap-[7px]`

**Typography (R4, R5, R6)**
- [ ] All font sizes used are within standard Tailwind scale (12/14/16/20/24/30px)
- [ ] No more than 3 distinct font sizes per component
- [ ] Line-height matches context: headings `leading-tight`, body `leading-relaxed`, caption `leading-snug`
- [ ] Font weight matches role: headings `font-semibold`, body `font-normal`, KPI values `font-semibold`

**Contrast (R8)**
- [ ] All text combinations meet WCAG 2.2 AA: 4.5:1 normal text, 3:1 large text
- [ ] Both themes (phosphor + default) pass contrast checks

**Colors (R9)**
- [ ] Accent colors (`border-success`, `border-info`, etc.) are not applied to more than one tile with the same intent in the same dashboard viewport
- [ ] `--color-accent-alt` appears only on the Media Types tile (or semantic equivalent) — not decoratively

**Border namespaces (Gotcha #2)**
- [ ] `--color-border-*` is never mixed with `--border-*` on the same element
- [ ] All accent-border variants use `border-{accent}` for color and `border` (DEFAULT) for width

**Animations (R23)**
- [ ] No decorative animations in Panel family (they are static containers)
- [ ] All functional animations (Tabs transition, Dialog open) are wrapped in `@media (prefers-reduced-motion: no-preference)`

**Z-Index (R24)**
- [ ] No Panel family component uses `z-index` (they are in-flow containers, `z-0`)

**Empty States (R25)**
- [ ] Any `Panel` that may render a dynamic data set has a documented empty-state body pattern

---

## 16. Tailwind v4 Configuration

> Implementation file: `frontend/src/theme.css`
> Constraint: `tailwind.config.ts` must NOT exist. All configuration is in `theme.css`.

```css
@import "tailwindcss";

@theme {
  /* Semantic tokens — add --color-accent-alt after the intent tokens */
  --color-accent-alt: #ff66cc;   /* NEW — magenta/roxo phosphor */

  /* ... all other tokens as defined in tokens.md Token Declarations ... */
}

/* Default theme override — must define --color-accent-alt */
:root[data-theme="default"] {
  --color-accent-alt: #ff79c6;   /* Dracula pink */
}
```

The `--color-accent-alt` token is the only addition required from this spec.
All other tokens already exist in `theme.css`.

---

## 17. Loading Feedback

> **Mandatory (R19).** This kit is a UI component library — the loading feedback patterns below apply to consumers of the kit, not to the Kit components themselves. The `Skeleton` component is the provided primitive for loading states.

| Duration | Feedback | Implementation |
|---|---|---|
| 0–100ms | No feedback needed | — |
| 100ms–1s | Inline spinner on the triggering element | Spinner overlays the button/trigger |
| 1s+ | Skeleton replacing the loading content | Use `Skeleton` component; match dimensions of real content |

**Forbidden:**
- Full-screen overlay spinner for a partial page operation
- Button without a loading state during an async operation

---

## 18. Error Messages — 4 Mandatory Elements

> **Mandatory (R20).** Every error message exposed through this kit's components must contain all 4 elements.

| Position | Element | Specification |
|---|---|---|
| 1 | Status icon | 16px (`w-4 h-4`), `text-destructive` |
| 2 | Title | What happened — short phrase, no technical jargon |
| 3 | Description | Why it happened — one sentence |
| 4 | Action | What to do next — link or button |

Use `Alert` component with `variant="destructive"` for inline error display inside a `Panel`.
