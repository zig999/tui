# Design System — Components

> Part of: `docs/specs/front/design-system/` | Layer: permanent
> Index: [`_index.md`](./_index.md)

---

## Catalog Membership — DS Primitive vs Feature-Local

> Decide before creating any component. This catalog lists **DS primitives only**.
> Adding a component here is a design-system spec change (new `component.spec.md` + a Changelog entry in `_index.md`). The Developer never adds a primitive to the catalog ad hoc — it flags the need so the spec process routes it correctly.

| Trait | DS primitive (`components/ui/`) | Feature-local (`features/<feature>/components/`) |
|---|---|---|
| Domain knowledge | None — purely presentational | Encodes domain / business rules |
| Reuse | Used (or reusable) by ≥ 2 features | Bound to a single feature |
| Data | No fetch/mutation — data arrives via props | May own its feature's data/flow |
| Composition | Is composed FROM | Composes primitives |
| Spec artifact | Has `component.spec.md` + a row in this catalog | No catalog entry required |

**Promotion trigger:** a feature-local component needed by a 2nd feature → promote it to `components/ui/` via a spec CR (`component.spec.md` + catalog row + Changelog entry). Until promoted, never copy it across features.

**Forbidden:**
- Cataloging a component that carries domain / business logic (it is feature-local)
- Duplicating a feature-local component into a second feature instead of promoting it
- Adding a primitive to `components/ui/` without a `component.spec.md`

---

## 12. Component Catalog

### DS Primitives — complete list

This is the authoritative list of all DS primitives currently specified.
Every component listed here has a `component.spec.md` in `docs/specs/front/components/`.

#### Layout family

| Component | Path | Storybook | Spec | Status |
|---|---|---|---|---|
| `Panel` | `ui/panel/` | `Layout/Panel` | `panel.component.spec.md` | approved |
| `StatPanel` | `ui/stat-panel/` | `Layout/StatPanel` | `stat-panel.component.spec.md` | draft |
| `Banner` | `ui/banner/` | `Layout/Banner` | `banner.component.spec.md` | draft |
| `StatusBar` | `ui/status-bar/` | `Layout/StatusBar` | `status-bar.component.spec.md` | draft |

#### Navigation

| Component | Path | Storybook | Spec | Status |
|---|---|---|---|---|
| `Tabs` | `ui/tabs/` | `Navigation/Tabs` | `tabs.component.spec.md` | approved |
| MenuBar composition | `ui/tabs/` (composed) | `Navigation/Tabs — MenuBarStyle` | `menubar.component.spec.md` (usage spec) | draft |
| `Breadcrumb` | `ui/breadcrumb/` | `Navigation/Breadcrumb` | `breadcrumb.component.spec.md` | approved |
| `Link` | `ui/link/` | `Navigation/Link` | `link.component.spec.md` | approved |

#### Actions

| Component | Path | Storybook | Spec | Status |
|---|---|---|---|---|
| `Button` | `ui/button/` | `Actions/Button` | `button.component.spec.md` | approved |

#### Data Display

| Component | Path | Storybook | Spec | Status |
|---|---|---|---|---|
| `Card` | `ui/card/` | `Data Display/Card` | `card.component.spec.md` | approved |
| `Divider` | `ui/divider/` | `Data Display/Divider` | `divider.component.spec.md` | approved |
| `Kbd` | `ui/kbd/` | `Data Display/Kbd` | `kbd.component.spec.md` | approved |
| `Skeleton` | `ui/skeleton/` | `Data Display/Skeleton` | `skeleton.component.spec.md` | approved |
| `Progress` | `ui/progress/` | `Data Display/Progress` | `progress.component.spec.md` | approved |
| `Table` | `ui/table/` | `Data Display/Table` | `table.component.spec.md` | approved |

#### Feedback

| Component | Path | Storybook | Spec | Status |
|---|---|---|---|---|
| `Alert` | `ui/alert/` | `Feedback/Alert` | `alert.component.spec.md` | approved |
| `Empty` | `ui/empty/` | `Feedback/Empty` | `empty.component.spec.md` | approved |

#### Forms

| Component | Path | Storybook | Spec | Status |
|---|---|---|---|---|
| `Checkbox` | `ui/checkbox/` | `Forms/Checkbox` | `checkbox.component.spec.md` | approved |
| `DatePicker` | `ui/date-picker/` | `Forms/DatePicker` | `date-picker.component.spec.md` | approved |
| `Input` | `ui/input/` | `Forms/Input` | `input.component.spec.md` | approved |
| `Label` | `ui/label/` | `Forms/Label` | `label.component.spec.md` | approved |
| `MultiCombobox` | `ui/multi-combobox/` | `Forms/MultiCombobox` | `multi-combobox.component.spec.md` | approved |
| `PersonPicker` | `ui/person-picker/` | `Forms/PersonPicker` | `person-picker.component.spec.md` | approved |
| `RadioGroup` | `ui/radio-group/` | `Forms/RadioGroup` | `radio-group.component.spec.md` | approved |
| `Select` | `ui/select/` | `Forms/Select` | `select.component.spec.md` | approved |
| `Switch` | `ui/switch/` | `Forms/Switch` | `switch.component.spec.md` | approved |
| `Textarea` | `ui/textarea/` | `Forms/Textarea` | `textarea.component.spec.md` | approved |

#### Overlays

| Component | Path | Storybook | Spec | Status |
|---|---|---|---|---|
| `Dialog` | `ui/dialog/` | `Overlays/Dialog` | `dialog.component.spec.md` | approved |
| `Sheet` | `ui/sheet/` | `Overlays/Sheet` | `sheet.component.spec.md` | approved |
| `Tooltip` | `ui/tooltip/` | `Overlays/Tooltip` | `tooltip.component.spec.md` | approved |

#### Known gaps (out of scope — see `decisions.md`)

| Component | Planned | Decision |
|---|---|---|
| `Badge` | Deferred | ADR-2026-07-14-02 — not added in this iteration |
| `BarChart` (data-viz) | Deferred | ADR-2026-07-14-03 — not added in this iteration |

---

## 12.1 Token × Slot Catalog — Panel Family

The Panel family components consume the following tokens per visual slot.
Reference this table when implementing or reviewing; use `border-accent-alt` etc. for the accent variants.

### Panel

| Slot | State | Tailwind Class | Token |
|---|---|---|---|
| Root `<section>` border | all accents | `border` | `--border-DEFAULT` (1px) |
| Root `<section>` border color — default | default | `border-border` | `--color-border` |
| Root `<section>` border color — success | success | `border-success` | `--color-success` |
| Root `<section>` border color — info | info | `border-info` | `--color-info` |
| Root `<section>` border color — warning | warning | `border-warning` | `--color-warning` |
| Root `<section>` border color — danger | danger | `border-destructive` | `--color-destructive` |
| Root `<section>` border color — alt | alt | `border-accent-alt` | `--color-accent-alt` |
| Root `<section>` background | all | `bg-surface` | `--color-surface` |
| Title `<h*>` background (notch mask) | all | `bg-surface` | `--color-surface` |
| Title `<h*>` text — default | default | `text-foreground` | `--color-foreground` |
| Title `<h*>` text — success | success | `text-success` | `--color-success` |
| Title `<h*>` text — info | info | `text-info` | `--color-info` |
| Title `<h*>` text — warning | warning | `text-warning` | `--color-warning` |
| Title `<h*>` text — danger | danger | `text-destructive` | `--color-destructive` |
| Title `<h*>` text — alt | alt | `text-accent-alt` | `--color-accent-alt` |

### StatPanel

> Inherits all Panel slots above. Additional slots:

| Slot | State | Tailwind Class | Token |
|---|---|---|---|
| Value text | all | `text-3xl font-semibold text-foreground` | `--color-foreground` |
| Caption text | all | `text-xs uppercase tracking-widest text-muted-foreground` | `--color-muted-foreground` |
| Body wrapper | all | `flex flex-col items-center justify-center gap-1 py-2` | — |

### Banner (frame="none")

| Slot | State | Tailwind Class | Token |
|---|---|---|---|
| Root `<header>` background | all | `bg-surface` | `--color-surface` |
| Root `<header>` bottom border | all | `border-b border-border` | `--color-border` |
| Title `<h1>` | all | `text-4xl font-bold tracking-wider text-foreground` | `--color-foreground` |
| Subtitle `<p>` | all | `text-sm text-muted-foreground` | `--color-muted-foreground` |

### StatusBar

| Slot | State | Tailwind Class | Token |
|---|---|---|---|
| Root `<div>` background | all | `bg-surface` | `--color-surface` |
| Root `<div>` top border | all | `border-t border-border` | `--color-border` |
| Slot text | all | `text-xs text-muted-foreground` | `--color-muted-foreground` |

---

## 12.2 Card Internal Spacing (Panel family)

`Panel` uses `p-4` (16px) internal padding on the body area by default.
`StatPanel` overrides the body layout to `flex flex-col items-center justify-center gap-1 py-2`.
`Banner` uses `px-4 py-6` on the root.
`StatusBar` uses `px-4 py-1` on the root.

| Component | Body padding |
|---|---|
| `Panel` body | `p-4` |
| `StatPanel` body | `py-2` (centered, minimal) |
| `Banner` | `px-4 py-6` |
| `StatusBar` | `px-4 py-1` |

---

## 12.3 Touch Targets

> The Panel family components are non-interactive containers — they have no clickable root element. Touch target rules apply to **children** rendered inside their slots (buttons, links, interactive content passed as `children` or `action`).

| Element | Desktop height | Mobile height |
|---|---|---|
| Interactive children inside `Panel` / `Banner` | `h-10` (40px) min | `h-11` (44px) min |
| `StatusBar` slot interactive children | `h-8` (32px) min (bar height is fixed) | — |

---

## 12.4 Border Radius

**Style: Sharp (all 0px).** This applies to all components in the kit including the Panel family.

| Component | Border radius |
|---|---|
| `Panel` root `<section>` | `0px` (TUI identity) |
| `Banner` root | `0px` |
| `StatusBar` root | `0px` |
| All interactive children | `0px` |

**Forbidden:** any `rounded-*` class on any component in this kit. The TUI identity is sharp corners only.

---

## 12.5 Button Hierarchy

> The Panel family exposes no buttons directly. Children passed to `Panel.children` or `Banner.action` that include buttons must follow the standard button hierarchy:

| Type | Background | Border | Text | When to use |
|---|---|---|---|---|
| Primary | `bg-primary` | none | `text-primary-foreground` | Single main action |
| Secondary | transparent | `border-primary` 1px | `text-primary` | Supporting action |
| Ghost | none | none | `text-primary` | Tertiary / cancel |
| Danger | `bg-destructive` or `border-destructive` 1px | — | `text-destructive-foreground` or `text-destructive` | Irreversible destructive actions |

---

## 12.6 Component States

> Non-interactive components (Panel, StatPanel, Banner, StatusBar) have only a Default state — no hover/focus/active/disabled.

| Component | Interactive | Required states |
|---|---|---|
| `Panel` | No | Default only |
| `StatPanel` | No | Default only |
| `Banner` | No | Default only (children in `action` slot are independently interactive) |
| `StatusBar` | No | Default only (children in slots are independently interactive) |
| `Tabs` / MenuBar composition | Yes | Default / Hover / Focus / Active / Disabled (per `Tabs` spec) |

---

## 12.7 Do / Don't — Panel Family

| Component | Do | Don't |
|---|---|---|
| `Panel` | Use `accent="alt"` for the VISUAL VAULT Media Types tile | Apply the same accent to two tiles in the same dashboard grid |
| `Panel` | Wire `aria-labelledby` to the `<h*>` via `useId` (automatic — component handles it) | Add a second `aria-label` — it would conflict with `aria-labelledby` |
| `StatPanel` | Format the `value` string before passing (e.g., `"1,234"`) | Expect the component to format numbers |
| `Banner` | Use `frame="none"` (default) for the page-level strip | Use `Banner` for section-level headers — use `Panel` directly |
| `Banner` | Keep `action` slot content compact (single badge/pill) | Put a multi-button toolbar in `action` — use a Toolbar component (future) |
| `StatusBar` | Use `role="contentinfo"` when the bar is the page's direct footer | Keep `role="status"` (default) when updating a timestamp every second — it causes announcement spam |
| MenuBar composition | Interleave `<span aria-hidden="true">|</span>` between each pair of `TabsTrigger`s | Create a new `MenuBar` component — ADR-2026-07-14-01 forbids it |
