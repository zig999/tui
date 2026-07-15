# Banner -- Component Spec

> Path: `src/shared/components/ui/banner/`
> Used in features: — (shared UI primitive) | Status: draft | Layer: permanent

> Composition over `Panel` — renders the dashboard header row: big centered
> title/logo, optional subtitle, and a right-hand action slot. The VISUAL
> VAULT top strip ("VISUAL VAULT" title + subtitle + `[Dashboard]` badge on
> the right) is the canonical use case.

---

## 1. Purpose and Responsibilities

`Banner` is a composition over `Panel` used as the top-of-page header for
dashboards. It renders:

- A large, centered `title` (and optional `subtitle` below it) as the
  visual focal point of the page.
- An optional `action` slot rendered in the right corner of the banner body
  — typically a status badge, a version pill, or a small button group.

`Panel`'s notched-title border can be **disabled** on `Banner` (default:
disabled — see §3 `frame` prop), because the dashboard header in VISUAL
VAULT is a full-width strip with the title *inside*, not a titled framed
box. When `frame="notched"` is passed, the notched-title frame is enabled
and the `frame` string doubles as the notched border label.

**Out of scope for this component:**

- Navigation controls (back/forward, breadcrumbs) inside the banner — use
  `Breadcrumb` above/beside the banner instead.
- Sticky positioning — the parent layout controls whether the banner sticks
  to the viewport top; `Banner` renders in normal document flow.
- Full-page hero images / gradients — the banner uses the same `bg-surface`
  as every other panel; a "hero" identity is not part of the VISUAL VAULT
  design.

---

## 2. When to Use / When Not to Use

| Use when | Do not use when |
|----------|-----------------|
| Rendering the top strip of a dashboard page (VISUAL VAULT header identity) | The page is a form or wizard → use a plain `<h1>` + supporting text; a banner is visually heavier than needed |
| The header needs a right-hand slot for a status badge / mode indicator | The badge itself is the primary content → use `Alert` (info variant) with `role="status"` instead |
| The page has one canonical header title that must render as the largest heading on the page | The header is subordinate to a `Panel` frame → use `Panel` (or `StatPanel`) directly; `Banner` is the top-of-page identity |

---

## 3. Props Contract

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | yes | — | The large centered title text. Rendered as `<h1>` by default (see `titleLevel`) |
| `subtitle` | `string` | no | — | Optional subtitle rendered below the title in `text-sm text-muted-foreground` |
| `action` | `ReactNode` | no | — | Right-hand slot rendered in the top-right corner of the banner body — typically a badge or a small button group |
| `logo` | `ReactNode` | no | — | Optional logo/glyph rendered above the title (e.g., an ASCII logotype or a lucide icon at large size). Rendered with `aria-hidden="true"` — the accessible name comes from `title` |
| `frame` | `"none" \| "notched"` | no | `"none"` | Frame identity. `"none"`: no border, no notched title — a full-width strip. `"notched"`: wraps the banner content in `Panel` with the `title` notched into the border (matches other panels in the dashboard) |
| `accent` | `"default" \| "success" \| "info" \| "warning" \| "danger" \| "alt"` | no | `"default"` | Only meaningful when `frame="notched"` — forwarded to `Panel.accent`. Ignored when `frame="none"` |
| `titleLevel` | `1 \| 2 \| 3` | no | `1` | Heading level for `title`. Default `<h1>` reflects the banner's role as the page's canonical header. Set `2` when the banner is a section header nested under a page-level `<h1>` elsewhere |
| `className` | `string` | no | — | Merged via `cn()` onto the root (either a `<header>` when `frame="none"` or the `<Panel>`'s `<section>` when `frame="notched"`) |
| *(rest)* | `Omit<ComponentProps<"header">, "title">` | no | — | Forwarded to the root. When `frame="notched"`, `Panel`'s section receives them via passthrough |

---

## 3.1 Data Contract

**Cross-prop join rules:**

| Prop A | Field A | Prop B | Field B | Relationship |
|--------|---------|--------|---------|--------------|
| `frame` | `"none"` | `accent` | (any) | `accent` is silently ignored — the strip form has no border to color |
| `frame` | `"notched"` | `title` | (`string`) | `title` doubles as the notched-border label AND as the visible heading text inside the banner body (this is intentional — the identity of the notched form is the title repeated on the border and rendered large inside) |
| `logo` | (`ReactNode`) | `title` | (`string`) | `logo` is decorative (`aria-hidden="true"`) — the accessible name comes exclusively from `title` |

---

## 4. Component States

Not applicable — no internal state.

---

## 5. Events Emitted

Not applicable — no callback props of the component's own. Events fired by
children rendered into `action` (e.g., a button's `onClick`) are the
consumer's responsibility.

---

## 6. Variants and Compositions

`Banner` exposes no CVA of its own — the only variant axis is the `frame`
prop, which is discrete (`"none"` vs `"notched"`) and drives two different
render trees rather than a class variant.

### `frame="none"` (default, VISUAL VAULT strip)

```
<header className="relative flex items-start justify-between bg-surface border-b border-border px-4 py-6">
  <div className="flex-1 flex flex-col items-center gap-1 text-center">
    {logo}                                      /* optional, aria-hidden */
    <h1 className="text-4xl font-bold tracking-wider text-foreground">{title}</h1>
    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
  </div>
  {action && <div className="absolute right-4 top-4">{action}</div>}
</header>
```

Key points:

- Root is `<header>` (semantic banner landmark by default — see §9).
- Only a bottom border (`border-b border-border`) — no notched title.
- Title/subtitle centered; `action` absolutely positioned in the top-right,
  overlapping the title's horizontal center-line only if the action is
  taller than expected (consumer's responsibility to keep it small).

### `frame="notched"`

Wraps the same body content in `<Panel title={title} accent={accent}>` and
renders the visible `<h1>{title}</h1>` inside the panel body (the notched
top-border label is derived from the same `title` string). The outer landmark
becomes `<section>` (via `Panel`), which means the semantic banner landmark
must be added by the consumer via `role="banner"` or a wrapping `<header>`
(see §9).

---

## 7. Do / Don't

| Do | Don't |
|----|-------|
| Use `frame="none"` (default) for the top-of-page strip identity (VISUAL VAULT) | Don't use `frame="none"` inside a nested panel — the strip's `<header>` landmark is intended for page-level use |
| Use `action` for a small badge/status pill (e.g., the VISUAL VAULT `[Dashboard]` chip) | Don't put multiple interactive controls in `action` — the slot is designed for a single compact node; use a `Toolbar` (future component) for control groups |
| Put a lucide icon or a compact ASCII glyph in `logo` | Don't put a raster image in `logo` — the TUI identity forbids raster imagery; use text/glyphs/icons |

---

## 8. BDD Scenarios

### Default render (VISUAL VAULT strip)

```
Given a Banner with title="VISUAL VAULT" and subtitle="File organizer & duplicate finder"
When it mounts
Then it renders a <header> landmark with border-b border-border, an <h1> "VISUAL VAULT" at text-4xl font-bold, and a subtitle below at text-sm text-muted-foreground; no action slot is rendered
```

### With action slot

```
Given a Banner with title="VISUAL VAULT" and action={<Badge>Dashboard</Badge>}
When it mounts
Then the <header> contains the centered title AND the Badge is rendered in the top-right corner via an absolutely-positioned wrapper
```

### Notched frame

```
Given a Banner with frame="notched", title="System Console", accent="info"
When it mounts
Then a Panel (accent="info") wraps the banner body; the panel's notched top-border label is "System Console" AND the same string renders as <h1> inside the panel body; the outer <section>'s aria-labelledby resolves to that <h1>'s id
```

---

## 9. Accessibility Contract

| Requirement | Implementation |
|-------------|-----------------|
| Label | For `frame="none"`: the accessible name of the `<header>` landmark is derived from its child `<h1>` per default landmark labelling. For `frame="notched"`: inherited from `Panel` — `aria-labelledby` links the outer `<section>` to the visible `<h1>` |
| Landmark role | `frame="none"` renders `<header>` — a native banner landmark **only** when placed as a direct child of `<body>`; when nested inside a `<main>`/`<article>`/`<section>`, the `<header>` degrades to a generic header. Consumers who need the banner landmark unconditionally must add `role="banner"` explicitly or place `Banner` directly under `<body>`. `frame="notched"` renders `<section>` (via `Panel`) — no banner landmark; the consumer adds `role="banner"` if the semantic is required |
| Keyboard | Not applicable — `Banner` itself is non-interactive; children rendered into `action` may be interactive and follow their own contracts |
| Focus management | Not applicable |
| ARIA states | None on the banner itself; `logo` (when present) is `aria-hidden="true"` |
| Heading level | `<h1>` by default — reflects the banner's role as the page's canonical heading. When multiple banners appear on the same page (e.g., nested dashboards), the consumer must adjust `titleLevel` to preserve a valid heading outline |

---

## 10. Internal Dependencies

| Component | Source | Usage |
|-----------|--------|-------|
| `Panel` | `@/shared/components/ui/panel` | Used only when `frame="notched"` — the entire notched frame + `aria-labelledby` wiring is delegated to `Panel` |
| `cn` | `@/shared/lib/cn` | Merges consumer `className` with the layout classes |

No other UI-kit dependency. In particular, the `action` slot is a
`ReactNode` — consumers are responsible for the badge/pill component. See
`docs/specs/decisions.md` for the known gap on a `Badge` primitive.

---

## 11. Storybook Location

**Meta title:** `Layout/Banner`

Rationale: `Banner` is a page-level layout primitive that composes with
`Panel`, `StatPanel`, `StatusBar` and `MenuBar` to build the VISUAL VAULT
dashboard shell. It belongs alongside those siblings under the `Layout/`
section rather than under `Primitives/` or `Feedback/`.

Required stories (each is also the component test via `addon-vitest`):

| Story name | Purpose |
|------------|---------|
| `Default` | `title="VISUAL VAULT"`, `subtitle="File organizer & duplicate finder"`, no `action` — the bare strip. |
| `WithAction` | Adds `action={<Badge>Dashboard</Badge>}` — the canonical VISUAL VAULT header. Serves as the dashboard-shell reference render. |
| `WithLogo` | Adds a lucide/ASCII glyph via `logo` above the title. |
| `Notched` | `frame="notched"`, `accent="info"` — validates the `Panel` delegation branch and the notched-border label. |

The composition is also exercised inside the shared `Layout/Panel — Dashboard`
story, which mounts `Banner` at the top of the full VISUAL VAULT layout and
serves as the integration reference for the dashboard shell.

---

## 12. Delivery Contract (files)

Follows the standard Component Contract (§CLAUDE.md → Stack — Frontend →
Component Contract). The component ships four files under
`src/shared/components/ui/banner/`:

| File | Responsibility |
|------|----------------|
| `banner.tsx` | Implementation. `Banner` function component accepting `ref` as a normal prop (no `forwardRef`). Uses `cn()` for class merge. No CVA (single variant axis is discrete `frame`). |
| `banner.types.ts` | Prop types (`BannerProps`, `BannerFrame`, `BannerAccent`, `BannerTitleLevel`). |
| `index.ts` | Public surface — re-exports `Banner` and the types listed above. |
| `banner.stories.tsx` | Storybook stories under `Layout/Banner` (see §11). |

Semantic tokens only — no raw color/spacing values. Consumes `bg-surface`,
`text-foreground`, `text-muted-foreground`, and `border-border` from
`theme.css`.

---

## Changelog

| Version | Date | Author | Type | Description | CR |
|---------|------|--------|------|-------------|----|
| 1.0.0 | 2026-07-14 | Spec Writer | initial | Initial spec for the dashboard header composition; two frame modes (`"none"` strip / `"notched"` panel); optional logo/subtitle/action slots | -- |
| 1.1.0 | 2026-07-14 | Spec Writer | minor | Added §11 Storybook Location (meta title `Layout/Banner` + required stories) and §12 Delivery Contract (four-file component surface) | -- |
