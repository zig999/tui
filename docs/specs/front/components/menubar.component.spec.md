# MenuBar -- Component Spec (usage contract)

> Path: **no new file** — this spec documents a **composition** of the
> existing `Tabs` primitive (`src/shared/components/ui/tabs/`).
> Used in features: — (shared UI primitive, dashboard shell) | Status: draft | Layer: permanent

> MenuBar is **not** a new component. It is a compositional usage pattern
> on top of the existing `Tabs` primitive: `TabsTrigger`s interleaved with
> decorative pipe (`|`) spans inside a `TabsList`. The primitive itself is
> not modified.

---

## 1. Purpose and Responsibilities

The dashboard shell needs a horizontal single-select strip in the TUI
`A | B | C` menu-bar identity — an active item highlighted, pipes between
items. Functionally, this is identical to the existing `Tabs` primitive:

- Single active item at any time.
- Click to switch.
- Roving `tabIndex` (`0` for active, `-1` for the rest).
- `aria-selected` on each item; `role="tablist"` on the container.

Since `Tabs` already provides all of the above (context, state, roles, focus
flow — see `tabs.component.spec.md`), MenuBar is delivered as a
**compositional usage pattern**: the consumer interleaves decorative
`<span aria-hidden="true">|</span>` nodes between adjacent `TabsTrigger`
children inside a `TabsList`. **No new component, no new variant prop, no
CVA is introduced** — the primitive stays untouched.

**Decision reference:** the choice to compose rather than fork the primitive
is recorded in `docs/specs/decisions.md` (ADR-2026-07-14-01). Alternatives
considered (new component; `variant="menubar"` CVA on `TabsList`) and the
"revisit when" condition are documented there.

**Out of scope for this spec:**

- Anything in the shared `Tabs` contract (state management, `TabsContent`
  unmounting, keyboard handling gaps, controlled/uncontrolled value flow) —
  see `tabs.component.spec.md`. This spec covers only the pipe-separator
  composition and its accessibility contract.
- A distinct `MenuBar` component file. Not created; the composition is the
  contract.
- A `variant="menubar"` prop on `TabsList` / `TabsTrigger`. Explicitly
  rejected in ADR-2026-07-14-01 (would introduce CVA for one visual case).
- Arrow-key roving navigation between items — inherited gap from `Tabs`
  (see `tabs.component.spec.md` §1 / §9). The composition does not fix it.
- Multi-select behavior — inherited single-select from `Tabs`.
- Nested submenus / dropdown-on-hover behavior — flat one-level strip.

---

## 2. When to Use / When Not to Use

| Use when | Do not use when |
|----------|-----------------|
| The dashboard shell needs the pipe-separated TUI menu identity (`A \| B \| C`) with a single active item | Full-page/route-level navigation is needed — use `@tanstack/react-router` |
| Content beneath the strip switches based on the active item (paired with `TabsContent`) | Multi-select behavior is required — `Tabs` is single-select; use a different control |
| The default `Tabs` underline visual is acceptable, augmented with decorative pipes between items | Arrow-key roving navigation is a hard requirement — inherited gap from `Tabs` |
| A second consumer does not yet need to enforce pipe interleaving automatically (see "Revisit when" in ADR-2026-07-14-01) | You need the pipe strip enforced by the primitive (not by consumer discipline) — at that point, promote to a `TabsList` variant per the ADR's revisit clause |

---

## 3. Props Contract

**No new props are introduced.** MenuBar consumes the existing `Tabs`,
`TabsList`, `TabsTrigger`, `TabsContent` props — full contract in
`tabs.component.spec.md` §3.

### The decorative pipe span (consumer-authored)

The pipe separator between items is a **consumer-authored** node, not a
primitive-provided element. It has a strict contract to guarantee the
accessibility semantics:

| Element | Attribute | Value | Rationale |
|---------|-----------|-------|-----------|
| `<span>` | `aria-hidden` | `"true"` | The pipe is decorative — screen readers must not announce it; `role="tab"` semantics on `TabsTrigger` provide the accessible strip |
| `<span>` | `className` | `"select-none text-muted-foreground px-1"` (or a project-local utility class carrying the same tokens) | `select-none` prevents accidental selection of the pipe when the user selects trigger text; `text-muted-foreground` matches the rest of the muted strip chrome; `px-1` gives the pipe breathing room |
| `<span>` | children | `"|"` (single ASCII pipe) | The literal separator character. Not `"│"` (box-drawing) — the ASCII pipe reads correctly in every monospace font stack; box-drawing chars vary in width across fonts |

---

## 3.1 Data Contract

No new cross-prop rules. All inherited from `Tabs` — see
`tabs.component.spec.md` §3.1.

---

## 4. Component States

Inherited from `Tabs` — see `tabs.component.spec.md` §4. The pipe span is a
static, stateless decoration.

---

## 5. Events Emitted

Inherited from `Tabs` — see `tabs.component.spec.md` §5 (`onValueChange`).
The pipe span emits no events (it is `aria-hidden` and non-interactive).

---

## 6. Variants and Compositions

MenuBar itself has no variants — it is one specific composition of `Tabs`.

### Canonical composition

```tsx
<Tabs defaultValue="dashboard">
  <TabsList>
    <TabsTrigger value="dashboard">DASHBOARD</TabsTrigger>
    <span aria-hidden="true" className="select-none text-muted-foreground px-1">|</span>
    <TabsTrigger value="library">LIBRARY</TabsTrigger>
    <span aria-hidden="true" className="select-none text-muted-foreground px-1">|</span>
    <TabsTrigger value="settings">SETTINGS</TabsTrigger>
  </TabsList>
  {/* optional TabsContent panels — one per value */}
</Tabs>
```

Visual output:

- `TabsList` renders unchanged (`flex gap-0 border-b border-border`) — the
  underline bottom rule is preserved from the underlying `Tabs`.
- Each `TabsTrigger` renders unchanged — the selected trigger shows the
  `▸` marker and `border-primary text-primary` per the base contract.
- Between each adjacent pair of triggers, a decorative `|` sits with
  `text-muted-foreground`, occupying its own flex slot inside
  `TabsList`'s `flex gap-0` layout.

### Interleaving helper (optional, consumer-side)

Consumers with many triggers can optionally write a small local helper (e.g., an
`interleave(children, separator)` function) at their call site to avoid
manually authoring N-1 pipes. That helper is **not** part of the UI kit —
it is out of scope for this iteration.

---

## 7. Do / Don't

| Do | Don't |
|----|-------|
| Interleave pipe `<span>`s manually between `TabsTrigger`s inside `TabsList` for the menu-bar identity | Don't add a new `MenuBar` component file — the composition is the contract (ADR-2026-07-14-01) |
| Set `aria-hidden="true"` on every pipe span | Don't render pipes as visible `TabsTrigger` `children` or as separate `<button>`s — they would enter the accessibility tree and confuse screen readers |
| Use `select-none` on the pipe span | Don't rely on `user-select-none` via a raw CSS rule — the semantic token via Tailwind is the enforced source (Component Contract) |
| Use `text-muted-foreground` on the pipe span to match the strip chrome | Don't apply an accent color to the pipe span — it is not part of any semantic intent |
| Keep item labels short and uppercase — the pipe strip reads as a menu, not as tab prose | Don't wrap the composition in a new abstraction until the ADR's "revisit when" condition is met (see `decisions.md`) |

---

## 8. BDD Scenarios

### Default render — three-item menu bar

```
Given a Tabs with defaultValue="dashboard", a TabsList containing three
  TabsTriggers ("DASHBOARD", "LIBRARY", "SETTINGS") interleaved with two
  <span aria-hidden="true" className="select-none text-muted-foreground px-1">|</span> nodes
When it mounts
Then the visible order inside role="tablist" is: DASHBOARD | LIBRARY | SETTINGS;
  querying by role="tab" returns exactly three elements (the pipes do NOT
  appear in the accessibility tree); the "DASHBOARD" trigger has
  aria-selected="true", tabIndex=0, and shows the ▸ marker
```

### Switching active item

```
Given the menu bar above with "DASHBOARD" active
When the user clicks the "LIBRARY" trigger
Then onValueChange("LIBRARY") fires; "LIBRARY" now has aria-selected="true"
  and shows the ▸ marker; "DASHBOARD" reverts to text-muted-foreground;
  the pipes remain untouched (they were never part of the state)
```

### Accessibility parity — pipes excluded from the a11y tree

```
Given the menu bar is rendered
When queried with queryAllByRole('tab')
Then exactly three role="tab" elements are returned — the two <span> pipes
  have aria-hidden="true" and are excluded from the accessibility tree
```

### Storybook play() (coverage requirement per task brief)

```
Given the "Navigation/Tabs — MenuBarStyle" story renders the composition
When the play() function runs
Then it asserts:
  (a) render — the tablist contains three role="tab" nodes and two pipe
      <span>s;
  (b) aria — each pipe <span> has aria-hidden="true";
  (c) selection — the initially active trigger has aria-selected="true"
      and tabIndex=0, the others have tabIndex=-1;
  (d) click flow — clicking a non-active trigger updates aria-selected and
      tabIndex per the base Tabs contract
```

The composition is also exercised inside the Dashboard composition story
(`Layout/Panel — Dashboard`), which validates the full VISUAL VAULT layout.

---

## 9. Accessibility Contract

Inherited from `Tabs` — see `tabs.component.spec.md` §9. Deltas introduced
by the pipe composition:

| Requirement | Implementation |
|-------------|-----------------|
| Label | Unchanged — trigger `children` is the accessible name of each `role="tab"` |
| Keyboard | Unchanged — no arrow-key roving (inherited gap); native `Tab`/`Shift+Tab` traversal only |
| Focus management | Unchanged — roving `tabIndex` (`0` for selected, `-1` for the rest) |
| ARIA states | Unchanged — `role="tablist"` on `TabsList`, `role="tab"` + `aria-selected` on `TabsTrigger`. Pipe separators (`<span aria-hidden="true">|</span>`) are decorative and excluded from the accessibility tree; consumers who omit `aria-hidden` will break this contract |
| Contrast | Pipe uses `text-muted-foreground` on the `TabsList` background (`bg-surface` when inside a `Panel`, or the outer container's background). The muted-foreground / surface pair must meet WCAG 2.2 AA (≥ 3:1 for a non-text UI element under `bg-surface`) across both themes. Validated at QA time |

---

## 10. Internal Dependencies

| Component | Source | Usage |
|-----------|--------|-------|
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `@/shared/components/ui/tabs` | The base primitive — this spec composes on top of it without changing the primitive itself |

No new file under `src/shared/components/ui/`. No new dependency introduced.

### Storybook location

`Navigation/Tabs` (existing meta title). The MenuBar composition is exposed as
a new story inside the existing `tabs.stories.tsx`:

- `MenuBarStyle` — the three-item pipe-separated composition, with a
  `play()` covering render + ARIA + click flow (see §8).

The task brief also requires a **Dashboard composition** story assembling
Panel + StatPanel + Banner + StatusBar + MenuBar into the VISUAL VAULT
layout — that story lives under `Layout/Panel — Dashboard` and consumes
this composition verbatim.

---

## Changelog

> Mandatory — never remove previous entries. A Props Contract change (§3) requires a new version entry.

| Version | Date | Author | Type | Description | CR |
|---------|------|--------|------|-------------|----|
| 1.0.0 | 2026-07-14 | Spec Writer | initial | Initial spec — MenuBar as a composition of `Tabs` (pipe `<span aria-hidden>` interleaved between triggers). Not a new component, not a variant. Decision recorded in `docs/specs/decisions.md` ADR-2026-07-14-01 | -- |
