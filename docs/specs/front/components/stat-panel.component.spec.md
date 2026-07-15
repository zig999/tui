# StatPanel -- Component Spec

> Path: `src/shared/components/ui/stat-panel/`
> Used in features: — (shared UI primitive) | Status: draft | Layer: permanent

> Composition over `Panel` — renders one KPI tile (title-on-border + big
> centered value + optional caption). The four KPI cards on the VISUAL VAULT
> dashboard (Total Files / Total Size / Duplicates / Media Types) are the
> canonical use case.

---

## 1. Purpose and Responsibilities

`StatPanel` is a thin composition over `Panel` that adds a single opinion:
a large, centered value line inside the panel body, with an optional caption
below.

Everything visual about the frame (notched title, border color, accent
mapping, `aria-labelledby` wiring, icon rendering) is delegated to `Panel`.
`StatPanel` owns only the body: the big value text and the caption.

**Out of scope for this component:**

- Trend indicators (up/down arrows, delta percentages) — not part of the
  VISUAL VAULT design; a future `TrendStatPanel` composition may extend
  this.
- Sparklines / mini-charts inside the tile — data-viz is explicitly out of
  scope for this iteration (see `docs/specs/decisions.md`).
- Any form of interactivity (click-through, drill-down) — `StatPanel`
  inherits `Panel`'s non-interactive contract. Consumers who need
  click-through wrap the `StatPanel` in a `<button>`/`<a>` or the router's
  `<Link>` at the composition site.

---

## 2. When to Use / When Not to Use

| Use when | Do not use when |
|----------|-----------------|
| Rendering a single-metric KPI tile with the TUI notched-title identity (VISUAL VAULT dashboard) | The value needs an inline delta / trend arrow → not supported by this spec; extend or use a custom `Panel` composition |
| The metric value is a short, scannable string (number, `1.5 GB`, `42 items`) | The tile must contain multiple metrics or a chart → use `Panel` directly and compose the body yourself |
| The dashboard needs the four VISUAL VAULT tiles (Total Files / Total Size / Duplicates / Media Types) with matching accents | The tile requires interactivity (click-through, keyboard activation) — inherit `Panel`'s non-interactive contract or wrap externally |

---

## 3. Props Contract

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | yes | — | Forwarded to `Panel.title` — the notched-border title |
| `icon` | `ReactNode` | no | — | Forwarded to `Panel.icon` |
| `accent` | `"default" \| "success" \| "info" \| "warning" \| "danger" \| "alt"` | no | `"default"` | Forwarded to `Panel.accent` |
| `value` | `string \| number` | yes | — | The big centered value rendered inside the panel body. Numbers are rendered via `String(value)` — the component performs **no formatting** (no thousands separator, no unit suffix) |
| `caption` | `string` | no | — | Optional short caption rendered below the value in `text-xs text-muted-foreground` |
| `titleLevel` | `2 \| 3 \| 4` | no | `3` | Forwarded to `Panel.titleLevel` |
| `className` | `string` | no | — | Merged via `cn()` — applied to the root `<Panel>` (i.e., the outer `<section>`) |
| *(rest)* | `Omit<ComponentProps<"section">, "title">` | no | — | Forwarded to `Panel` as the section-passthrough |

**Note.** `StatPanel` does **not** accept a `children` prop — the body is
fully owned by the component (`value` + optional `caption`). Consumers who
need arbitrary body content should use `Panel` directly.

---

## 3.1 Data Contract

**Cross-prop join rules:**

| Prop A | Field A | Prop B | Field B | Relationship |
|--------|---------|--------|---------|--------------|
| `value` | (`string \| number`) | `caption` | (`string`) | `caption` is optional and rendered as a secondary line below `value`; when absent, only `value` is shown, still centered inside the panel body |
| `accent` | (variant token) | (n/a) | — | Forwarded to `Panel` unchanged; the value text does **not** inherit the accent color — only the border and the notched title do (§6) |

---

## 4. Component States

Not applicable — `StatPanel` is a pure render function with no internal
state.

---

## 5. Events Emitted

Not applicable — no callback props.

---

## 6. Variants and Compositions

`StatPanel` exposes no CVA of its own — all variant axes come from `Panel`
via prop forwarding.

Body layout (fixed, non-configurable):

- Outer wrapper: `flex flex-col items-center justify-center gap-1 py-2` —
  centered vertically and horizontally inside the panel's body region.
- Value line: `text-3xl font-semibold text-foreground` — big, terminal-mono,
  neutral foreground color (never accent-tinted; §7).
- Caption line (optional): `text-xs uppercase tracking-widest text-muted-foreground`.

The choice to keep the value text at `text-foreground` (not accent-tinted)
is intentional: the accent identity of the tile lives in the border + notched
title. Tinting the value too would double-encode the intent and reduce
visual clarity.

---

## 7. Do / Don't

| Do | Don't |
|----|-------|
| Use `StatPanel` for the four VISUAL VAULT KPI tiles — each with its own `accent` | Don't apply the accent color to the value text — the value stays at `text-foreground`; the accent lives on the border and the notched title |
| Format numbers (e.g., `1,234` / `1.5 GB`) at the consumer site before passing to `value` | Don't expect `StatPanel` to format numbers — it renders `String(value)` verbatim |
| Use `caption` for the metric's unit or a short descriptor (`bytes`, `since Jan`) | Don't cram multiple metrics into a single `StatPanel` — use `Panel` directly if the tile needs custom body layout |

---

## 8. BDD Scenarios

### Default render

```
Given a StatPanel with title="Total Files" and value={1234}
When it mounts
Then it renders a Panel (accent="default") containing a centered value line "1234" (no formatting) with class text-3xl font-semibold text-foreground, and no caption line
```

### VISUAL VAULT — Media Types tile

```
Given a StatPanel with title="Media Types", value="12", caption="unique", accent="alt"
When it mounts
Then the outer Panel has accent="alt" (border-accent-alt + text-accent-alt on the notched title), the value "12" renders centered at text-3xl, and the caption "unique" renders below at text-xs uppercase tracking-widest text-muted-foreground
```

### Icon forwarding

```
Given a StatPanel with icon={<HardDrive />}, title="Total Size", value="1.5 GB"
When it mounts
Then the icon is rendered inline before the title text inside the notched-title heading, aria-hidden="true"; the value "1.5 GB" renders centered in the body
```

---

## 9. Accessibility Contract

| Requirement | Implementation |
|-------------|-----------------|
| Label | Inherited from `Panel` — the `<section>`'s accessible name is the `title` (icon and value contribute nothing to the accessible name via ARIA; the value is a visible text node inside the section and is announced as part of the section's content) |
| Keyboard | Not applicable — non-interactive |
| Focus management | Not applicable |
| ARIA states | Only `aria-labelledby` (inherited from `Panel`); no additional ARIA attributes |
| Value semantics | The value is rendered inside a plain `<div>` — **not** wrapped in `<data>`/`<output>`/`<dfn>`. The rationale is that the value is a display string, not a form output or a machine-parseable datum; screen readers announce the section title followed by the value's text content, which meets the intent for a KPI tile. If a machine-parseable value is required later, `<data value="...">` should be added (flag for spec review before implementing) |

---

## 10. Internal Dependencies

| Component | Source | Usage |
|-----------|--------|-------|
| `Panel` | `@/shared/components/ui/panel` | The full frame, notched title, accent border, and `aria-labelledby` wiring are delegated to `Panel`. `StatPanel` is a composition, not a fork |
| `cn` | `@/shared/lib/cn` | Merges consumer `className` with the value/caption body classes |

No other UI-kit dependency.

---

## Changelog

| Version | Date | Author | Type | Description | CR |
|---------|------|--------|------|-------------|----|
| 1.0.0 | 2026-07-14 | Spec Writer | initial | Initial spec for the KPI-tile composition over `Panel`; no trend indicator, no sparkline, no interactivity | -- |
