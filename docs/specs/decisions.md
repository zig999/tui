# Architectural Decisions (active)

> Living log of decisions that shape current work. Superseded entries stay
> in place with a `Superseded by` marker — never delete.

---

## ADR-2026-07-14-01 — MenuBar is a `Tabs` composition, not a new component

**Context.** The VISUAL VAULT dashboard shell needs a TUI tab strip of the
form `A | B | C`, where the active item is visually highlighted. The task
requirement flagged this as a candidate for a new `MenuBar` component and
asked the spec writer to first verify whether the existing `Tabs` primitive
(`src/shared/components/ui/tabs/`) already covers the case.

**Decision.** `MenuBar` will **not** be added as a new component. The
existing `Tabs` primitive already provides:

- A `TabsList` container styled as a horizontal strip (`flex gap-0
  border-b border-border`).
- `TabsTrigger` items with an active state that combines an inverted
  underline (`border-primary text-primary`) and a `▸` selection marker —
  visually equivalent to "active item highlighted" in the TUI menu-bar
  form.
- Full context-driven active-item bookkeeping (`Tabs`'s `useState` +
  `TabsContext`).

The only visual delta between the current `Tabs` and the requested
`A | B | C` menu-bar form is the **pipe separator between items**. Two
options were considered:

1. **Add a `separator` variant prop to `TabsList`.** Rejected — it forks
   the primitive's variant surface for a single presentational case, and
   Tabs currently has *no* CVA at all (`tabs.component.spec.md §6`).
   Introducing CVA for one variant contradicts the "CVA only when there
   are 2+ variants" rule.
2. **Ship the pipe strip as a Storybook composition of `Tabs`.** Adopted
   — the pipe separators are drawn as `<span aria-hidden>|</span>` nodes
   interleaved between `TabsTrigger` children at the *consumer* site (or
   inside a Storybook story). Zero primitive change; the composition is
   documented as a canonical story of `Tabs` (title: `Navigation/Tabs`,
   story name: `MenuBarStyle`).

**Consequence.** No new file under `src/shared/components/ui/`; no new
`.component.spec.md`. The composition pattern is documented in the
existing `tabs.component.spec.md` (§6 or §7 — reviewer's call at
implementation time) and demonstrated in `tabs.stories.tsx`. Consumers
who want the menu-bar form call:

```tsx
<Tabs defaultValue="dashboard">
  <TabsList>
    <TabsTrigger value="dashboard">DASHBOARD</TabsTrigger>
    <span aria-hidden="true" className="select-none text-muted-foreground px-1">|</span>
    <TabsTrigger value="library">LIBRARY</TabsTrigger>
    <span aria-hidden="true" className="select-none text-muted-foreground px-1">|</span>
    <TabsTrigger value="settings">SETTINGS</TabsTrigger>
  </TabsList>
</Tabs>
```

**Revisit when.** A second consumer needs the pipe-separator strip and
either (a) requires it to be enforced automatically (not manually
interleaved), or (b) the separator needs to be a distinct token/style.
At that point, promote the pattern to a `TabsList variant="menu-bar"`
CVA variant on `Tabs` — still *not* a new component.

---

## ADR-2026-07-14-02 — `Badge` primitive: known gap, out of scope

**Context.** The VISUAL VAULT layout renders a `[Dashboard]` pill in the
top-right of the banner and expects small chip-style badges on tabs / lists
elsewhere. The Panels task explicitly listed `Badge` as out of scope.

**Decision.** No `Badge` primitive will be added in the Panels iteration.
Consumers rendering a badge inside `Banner`'s `action` slot pass their own
`<span>` styled inline (or a project-local ad-hoc component) until the
`Badge` primitive is added under `/u-spec`.

**Consequence.** `banner.component.spec.md §10` documents that `action` is
an arbitrary `ReactNode` and no built-in badge is provided. The `Tabs`
primitive already renders a `[N]` count badge inline via the `count` prop
— that inline count is **not** the same as a general-purpose `Badge`
component.

**Revisit when.** The first non-`Tabs` consumer needs an interactive
status pill, OR the current inline styling drifts across sites (visual
audit finds ≥ 2 divergent inline badges). Then add `src/shared/components/ui/badge/`
via `/u-spec` with `variant` (default/info/success/warning/danger/alt) +
`size` (sm/md) + optional `onDismiss`.

---

## ADR-2026-07-14-03 — File Types chart (data-viz): known gap, out of scope

**Context.** The VISUAL VAULT layout includes a horizontal `File Types`
bar chart. The Panels task explicitly listed data-viz as out of scope.

**Decision.** No chart primitive will be added in the Panels iteration.
The tile is left as a placeholder `<Panel title="File Types">` with body
content deferred to a future data-viz iteration.

**Consequence.** The Dashboard composition story (in the Panels iteration)
renders the `File Types` slot as either omitted or filled with a static
placeholder `<Panel>` — the story validates the *layout* of the dashboard,
not the chart itself.

**Revisit when.** The application needs a real distribution/histogram
chart. Then evaluate:
- A thin wrapper over an existing library (Recharts / `@visx/*` / native
  SVG) inside `src/shared/components/ui/bar-chart/`, OR
- A custom TUI-mono ASCII bar renderer (fits the design identity but
  requires careful a11y + responsive handling).

---
