# Design System — Composition

> Part of: `docs/specs/front/design-system/` | Layer: permanent
> Index: [`_index.md`](./_index.md)

---

## 7. Visual Effects

The TUI UI Kit uses two systematic visual effects. Both are applied globally
(not per-component) and are the defining aesthetic characteristics of the kit.

### 7.1 Phosphor Glow

**Applied via:** `text-shadow` on `:root` in `theme.css`.
**Mechanism:** `text-shadow: 0 0 1px currentColor, 0 0 4px color-mix(in srgb, currentColor 30%, transparent)` — the glow color matches the element's own text color via `currentColor`, so it adapts automatically to any text color (green, cyan, red, magenta, etc.).
**Opt-out:** `<html data-crt="off">` removes glow and scanlines.

| When to use | When NOT to use |
|---|---|
| Inherited by all text — no component needs to add it manually | Components must never add their own `text-shadow` — the global rule covers them; adding per-component shadows doubles the glow and breaks the visual balance |

**Rule:** Components must not set `text-shadow` directly. The global `:root` rule is the single source.

### 7.2 Scanline Overlay

**Applied via:** `body::after` — a fixed pseudo-element covering the entire viewport.
**Mechanism:** `repeating-linear-gradient(to bottom, rgba(0,0,0,0.25) 0 1px, transparent 1px 3px)` at `opacity: 0.18` with `mix-blend-mode: multiply`.
**Non-interactive:** `pointer-events: none` — never captures clicks or focus.
**Opt-out:** same `data-crt="off"` toggle; also suppressed by `@media (prefers-reduced-transparency: reduce)`.

| When to use | When NOT to use |
|---|---|
| Global — applied once on `body::after` | Components must never replicate the scanline in their own pseudo-elements (duplicated scanlines create interference patterns) |

### 7.3 Effect Usage Table

| Component / Area | Glow | Scanline | Notes |
|---|---|---|---|
| All text nodes | Inherited | Yes (global) | Automatic — no explicit work needed |
| `Panel` border | No | Yes (global) | Border is a box-line, not text; glow does not apply to `border-color` |
| `StatusBar` slots | Inherited | Yes (global) | Compact text — glow is subtle at `text-xs` |
| Interactive elements (Button, Input) | Inherited | Yes (global) | On `:hover` the glow intensifies naturally as color brightens |
| `Banner` title | Inherited | Yes (global) | At `text-4xl`, the glow is more prominent — this is intentional for the hero heading |
| Story canvas / Storybook | Configurable | Yes (unless `data-crt="off"`) | The Storybook decorator wraps stories in a `bg-background` container |

---

## 8. Z-Index — Fixed Layer Scale

> **Mandatory (R24).** Use only the values from this scale. Arbitrary z-index values are a blocking anti-pattern (`z-index-outside-scale`).

| Tailwind class | Value | Layer | Elements |
|---|---|---|---|
| `z-0` | 0 | Base | Layout, cards, panels, static content |
| `z-10` | 10 | Sticky | Fixed header, footer (`StatusBar`), side nav |
| `z-20` | 20 | Floating | Dropdown, popover, tooltip |
| `z-30` | 30 | Partial overlay | Drawer, sidebar, bottom sheet |
| `z-40` | 40 | Modal | Dialog, backdrop + content |
| `z-50` | 50 | System | Toast (`sonner`), notification |

> **Note on the scanline overlay:** `body::after` uses `z-index: 9999` as an escape hatch — this is a deliberate exception in `theme.css`, not a component z-index. Components must not use values outside the scale above.

**Forbidden:**
- z-index outside this scale: `z-99`, `z-100`, `z-999`, `z-9999`
- Inline `style={{ zIndex: 999 }}` without reference to the scale above
- Two elements at the same z-level that must visually stack — use adjacent levels

---

## 9. Information Hierarchy

The TUI UI Kit is a dashboard/data-dense toolkit. The hierarchy below applies
to every tile, panel, and list in the kit.

| Level | Name | Font size | Tailwind | Color token | Notes |
|---|---|---|---|---|---|
| 1 | KPI value | `text-3xl` (30px) | `font-semibold` | `text-foreground` | `StatPanel` big value; scannable at a glance |
| 2 | Panel title / heading | varies (`text-xl`–`text-2xl`) | `font-semibold` | `text-foreground` or accent variant | Notched border label in `Panel`; `<h1>` in `Banner` |
| 3 | Section label / caption | `text-xs` (12px) | `uppercase tracking-widest` | `text-muted-foreground` | `StatPanel` caption; `StatusBar` slot content |
| 4 | Body content | `text-sm` (14px) | `font-normal` | `text-foreground` | Body text inside `Panel` children |
| 5 | Metadata / hint | `text-xs` (12px) | `font-normal` | `text-muted-foreground` | Timestamps, secondary labels |

**Rules:**
- KPI values (Level 1) are always `text-foreground` — never accent-tinted (the accent lives on the border and title)
- The glow effect at Level 1 (`text-3xl`) is prominent — this is intentional and must not be suppressed
- The difference between Level 1 and Level 5 must be readable in 3 seconds

---

## 10. Layout Structure

This kit is a **component library**, not an application shell. Layout patterns
describe how components compose on a dashboard-style canvas. Consumers are
responsible for the overall page grid.

### Dashboard Shell Pattern (VISUAL VAULT)

The canonical layout assembles:
1. `Banner` — full-width top strip (`frame="none"`) with `action` slot for a mode pill
2. `MenuBar` (Tabs composition) — horizontal strip below the banner
3. KPI grid — `StatPanel` tiles in a 4-column grid
4. Content panels — `Panel` tiles for data views
5. `StatusBar` — pinned footer strip

```
┌─────────────────────────────────────────────────────────┐
│  Banner (title + action slot)                           │
├─────────────────────────────────────────────────────────┤
│  MenuBar  DASHBOARD | LIBRARY | SETTINGS                │
├──────────┬──────────┬──────────┬──────────────────────┤
│StatPanel │StatPanel │StatPanel │ StatPanel             │
│Total File│Total Size│Duplicate │ Media Types (alt)     │
├──────────┴──────────┴──────────┴──────────────────────┤
│  Panel (content area)                                   │
├─────────────────────────────────────────────────────────┤
│  StatusBar  left | center | right                       │
└─────────────────────────────────────────────────────────┘
```

### Recommended Layout Patterns

| Pattern | Composition | Tailwind |
|---|---|---|
| Full-width strip | `Banner`, `StatusBar` | `w-full` |
| KPI grid (4 tiles) | 4 × `StatPanel` | `grid grid-cols-4 gap-4` (≥ lg), `grid-cols-2` (md), `grid-cols-1` (sm) |
| KPI grid (fluid) | N × `StatPanel` | `grid gap-4` + `repeat(auto-fill, minmax(180px, 1fr))` |
| Content area | Single `Panel` | `w-full` |
| Two-column content | 2 × `Panel` | `grid grid-cols-2 gap-4` (≥ md), `grid-cols-1` (sm) |

### Responsiveness

| Breakpoint | Behavior |
|---|---|
| `lg` (≥1024px) | Full 4-column KPI grid; side-by-side content panels |
| `md` (≥768px) | 2-column KPI grid; single content column |
| `sm` (≥640px) | Single-column layout; `Banner` title wraps |
| Default (< 640px) | Single column; minimum `p-4` padding on panels |

### Card Grid Rules (R18)

> **Mandatory.** Card grids must always use fluid `auto-fill` layouts.

| Card type | Grid rule | Gap |
|---|---|---|
| StatPanel (KPI) | `repeat(auto-fill, minmax(180px, 1fr))` | `gap-4` |
| Panel (content) | `repeat(auto-fill, minmax(320px, 1fr))` | `gap-4` |

**Forbidden:**
- `grid-template-columns: repeat(4, 1fr)` with fixed column count
- Gap values other than `gap-4` (16px) or `gap-6` (24px)

---

## 11. Visual Density

### Color Weight Distribution (60-30-10 rule)

| Role | Target weight | Tailwind Classes |
|---|---|---|
| Neutral surfaces | ~60% | `bg-background`, `bg-surface`, `text-foreground`, `text-muted-foreground` |
| Secondary content (borders, inactive, supporting) | ~30% | `border-border`, `text-muted-foreground`, inactive tab triggers |
| Accent / active elements | ≤10% | `border-success`, `border-info`, `border-warning`, `border-destructive`, `border-accent-alt`, `text-primary` |

### Element Limits per Dashboard Viewport

| Resource | Maximum per viewport |
|---|---|
| Panels with `accent="danger"` | 2 |
| Panels with the same accent color | 1 (each tile should have a distinct accent) |
| `Banner` instances | 1 (the banner is a page-level singleton) |
| `StatusBar` instances | 1 (footer is a page-level singleton) |
| Elements with simultaneous CSS animation | 2 |

### Empty States (R25)

> **Mandatory.** Any `Panel` that may render an empty data view must define an empty-state child.

Recommended structure for an empty `Panel` body:

```tsx
<Panel title="File Types">
  <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
    <FolderOpen className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
    <p className="text-sm font-medium">Nenhum arquivo encontrado</p>
    <p className="text-xs">Adicione arquivos para visualizar os tipos.</p>
  </div>
</Panel>
```

**Forbidden:**
- A `Panel` body that renders a blank area when the data set is empty
- Using `text-destructive` or error iconography for a truly empty (not errored) state

---

## 12. Background Layering (CRT layer order)

The TUI background is composited from three layers in this mandatory order:

1. **Base color** — `bg-background` (`#0a0f0a` phosphor) — applied to `<html>` / `<body>`
2. **Scanline overlay** — `body::after` fixed pseudo-element — opacity 0.18
3. **Content** — all rendered components sit above layer 2

Components must not add layers below or between these layers (no `::before` on `<body>` that could interfere with the scanline, no `fixed` positioned decorative elements below `z-10`).
