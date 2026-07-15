# MenuBar -- Implementation Spec (Front-end technical)

> Stack: React 19 + TypeScript 5 (strict) + Tailwind v4 (CSS-first `@theme`) | UI Kit: `frontend/` (autonomous package) | Version: 1.0.0 | Status: draft | Layer: permanent
> Business spec: `menubar.component.spec.md`
> Decision reference: `docs/specs/decisions.md` ADR-2026-07-14-01

> This is a UI Kit project — there is **no backend**. This document
> replaces the classic back-end spec with a **brief implementation
> technical spec** the `u-fe-developer` group must follow when adding the
> MenuBar composition. **No new primitive is created**: MenuBar is
> delivered as a composition of the existing `Tabs` primitive
> (`frontend/src/shared/components/ui/tabs/`) plus decorative pipe
> `<span>` nodes, exposed as a new story `MenuBarStyle` inside the
> existing `tabs.stories.tsx`.

---

## 1. Stack and Patterns

> Only aspects that differ from or extend `CLAUDE.md` are called out.
> Everything else = "CLAUDE.md default".

| Aspect | Value | Note |
|--------|-------|------|
| Framework | React 19 (`ref` as normal prop) | CLAUDE.md default — inherited from `Tabs`; no MenuBar-specific ref work |
| Language | TypeScript 5 strict | CLAUDE.md default |
| Styling | Tailwind v4 CSS-first `@theme` in `frontend/src/theme.css` | CLAUDE.md default — no new tokens introduced |
| Class merge | `cn()` from `@/shared/lib/cn` | Not required inside the story: the pipe span uses a static `className` string, no dynamic merge |
| Variant system | **None** — CVA is not introduced | Component Contract: CVA is only for 2+ visual variants; MenuBar has one visual (pipes between triggers). ADR-2026-07-14-01 explicitly rejects a `variant="menubar"` axis on `TabsList` |
| State management | **None** — inherited from `Tabs` (`useState` for uncontrolled `value`) | No new hook, no context |
| Data layer | **None** — pure presentational composition | Component Contract |
| Package boundary | Consumers import from `@/shared/components/ui/tabs` — the existing per-component barrel | No new barrel, no new folder |

---

## 2. File Layout

> No new files are added to `src/shared/components/ui/`. The MenuBar
> composition is a **story**, not a component.

| File | Purpose | Action |
|------|---------|--------|
| `frontend/src/shared/components/ui/tabs/tabs.tsx` | Primitive source | **Untouched** — do not modify |
| `frontend/src/shared/components/ui/tabs/tabs.types.ts` | Type surface | **Untouched** — do not add a `variant` field |
| `frontend/src/shared/components/ui/tabs/index.ts` | Per-component barrel | **Untouched** — no new export |
| `frontend/src/shared/components/ui/tabs/tabs.stories.tsx` | Storybook file | **Extend** — add one new named export `MenuBarStyle` with `play()` |

**Explicitly forbidden by ADR-2026-07-14-01:**

- Creating `frontend/src/shared/components/ui/menu-bar/` (any file inside it).
- Adding a `variant` / `menubar` prop on `TabsList`, `TabsTrigger`, or `Tabs`.
- Adding a `Separator` / `TabsSeparator` sub-component to the primitive.
- Introducing an `interleave()` helper inside `@/shared` — the composition is consumer-authored (spec §6).

---

## 3. TypeScript Type Decisions

**No new types are introduced.** The composition consumes the existing
type surface verbatim:

- `TabsProps` — `defaultValue: string` (required); `value?`, `onValueChange?` for controlled use.
- `TabsListProps` — `ComponentProps<"div">`.
- `TabsTriggerProps` — extends `ComponentProps<"button">` with `value: string` and optional `count?: number`.
- `TabsContentProps` — extends `ComponentProps<"div">` with `value: string`.

**Rationale for adding no types:**

- The pipe `<span>` is a plain HTML node, fully described by React's
  built-in `JSX.IntrinsicElements["span"]`. No wrapper type needed.
- The story's `values` (`"dashboard" | "library" | "settings"`) are
  literal strings inside the story body — no exported union, no barrel
  entry. `TabsProps.defaultValue: string` accepts them as-is.
- Adding a `MenuBarProps` type — even for documentation — would create
  the appearance of a new component surface and is explicitly rejected
  by ADR-2026-07-14-01.

**Type-checking guarantee.** Because `TabsList` extends
`ComponentProps<"div">`, arbitrary React children (including the pipe
`<span>` nodes) are accepted with no type assertion. The developer
group must not add `as` / cast expressions in the story.

---

## 4. Composition Rules (the entire contract)

### 4.1 Structural rules (enforced by review, not by types)

1. Pipe `<span>` nodes are placed **directly** inside `<TabsList>`,
   interleaved between adjacent `<TabsTrigger>` children. No wrapper
   element (`<div>` / `<Fragment>`) around a pipe.
2. There are exactly **N − 1** pipes for N triggers. First and last
   children of `<TabsList>` are `<TabsTrigger>` — never a pipe.
3. Each pipe carries these three attributes verbatim (spec §3):
   - `aria-hidden="true"`
   - `className="select-none text-muted-foreground px-1"`
   - text content: a single ASCII pipe `|` (U+007C). **Never** the
     box-drawing character `│` (U+2502) — variable width across mono fonts.
4. `<TabsList>` receives no additional `className` — it renders its
   inherited `flex gap-0 border-b border-border` unchanged. The pipes
   occupy their own flex slots.
5. `<TabsTrigger>` receives no additional `className` — the inherited
   underline / `▸` marker / uppercase-tracking chrome is the identity
   (spec §6 canonical composition).

### 4.2 Class contract on the pipe span (single source of truth)

| Class | Token consumed | Namespace | Reason |
|-------|----------------|-----------|--------|
| `select-none` | Tailwind utility | — | Prevents accidental selection of the pipe when the user text-selects an adjacent trigger label (spec §3) |
| `text-muted-foreground` | `--color-muted-foreground` | COLOR | Matches the strip chrome (unselected triggers use the same token); the pipe is chrome, never accent |
| `px-1` | Tailwind spacing scale (`0.25rem`) | — | Breathing room around the pipe glyph (spec §3) |

**Never** apply an accent color (`text-primary`, `text-success`, etc.)
to the pipe span — the pipe is decorative and has no semantic intent
(spec §7 Do/Don't row 4).

**Never** apply raw CSS (`user-select: none`, `color: #...`) — the
Component Contract mandates semantic-token-only styling.

### 4.3 Selection state — inherited unchanged

MenuBar consumes the `Tabs` state machine verbatim (`tabs.component.spec.md` §4/§5):

- Active trigger has `aria-selected="true"`, `tabIndex={0}`, and the
  `▸` marker.
- Inactive triggers have `aria-selected={false}`, `tabIndex={-1}`, and
  the muted-foreground color.
- `onValueChange(value)` fires on trigger click (bubbling from the
  `Tabs` context provider). The pipe span emits nothing — it is not
  interactive, not focusable, not in the a11y tree.

---

## 5. Token Bindings

> **No new tokens are registered.** All classes used by the composition
> resolve against tokens already declared in `frontend/src/theme.css`.

| Concern | Class | Token | Origin |
|---------|-------|-------|--------|
| Pipe color | `text-muted-foreground` | `--color-muted-foreground` | Pre-existing (used by unselected `TabsTrigger`) |
| Pipe padding | `px-1` | Tailwind spacing scale (default) | Pre-existing |
| Pipe non-selectable | `select-none` | — | Tailwind utility, no token |
| TabsList underline | inherited (`border-b border-border`) | `--color-border` (COLOR) + `--border-DEFAULT` (WIDTH) | Pre-existing in `Tabs` |

**Contrast note.** `text-muted-foreground` on the current `TabsList`
background must clear WCAG 2.2 AA for non-text UI elements (≥ 3:1).
This pair is already validated for the base `Tabs` primitive; the pipe
inherits the same contrast footprint — no new QA check beyond parity
across the two themes (phosphor + Dracula) is required.

---

## 6. Implementation Rules (BR-nn, mapped to spec)

> No back-end business rules exist for a UI Kit composition. What
> follows are the **implementation invariants** the developer group
> must enforce. Each rule references the component spec for
> traceability.

### BR-01 -- Do not create a `menu-bar/` folder or file

**Spec reference:** `menubar.component.spec.md` §1, §7 Do/Don't row 1; ADR-2026-07-14-01.
**Where enforced:** review — code search for any file under `frontend/src/shared/components/ui/menu-bar/`.
**Rule:** MenuBar is a composition. The moment a `menu-bar.tsx` exists, the ADR is violated. Reject.

### BR-02 -- Do not add a variant axis to `Tabs`

**Spec reference:** `menubar.component.spec.md` §1 (Out of scope, "variant='menubar' CVA"); ADR-2026-07-14-01.
**Where enforced:** review — diff of `tabs.tsx` / `tabs.types.ts` must be empty for this task.
**Rule:** No `variant`, `menubar`, `withSeparators`, or CVA declaration is added to the primitive. If a `TabsListProps` type is edited, reject.

### BR-03 -- Every pipe span carries `aria-hidden="true"`

**Spec reference:** `menubar.component.spec.md` §3, §9 (ARIA states).
**Where enforced:** the `MenuBarStyle` story JSX; the `play()` function's aria assertion (spec §8 (b)).
**Rule:** Any pipe without `aria-hidden="true"` breaks the accessibility contract — queryAllByRole('tab') must return exactly N (never N + separators). The `play()` assertion is the guard.

### BR-04 -- Pipe glyph is the ASCII pipe (`|`, U+007C)

**Spec reference:** `menubar.component.spec.md` §3 (third row of the pipe contract table).
**Where enforced:** the story JSX; grep for `│` (U+2502) in `tabs.stories.tsx` must be empty.
**Rule:** Box-drawing pipes render at varying widths across monospace stacks; the ASCII pipe is uniform. Do not "prettify" to `│`.

### BR-05 -- Pipe span uses only the three prescribed classes

**Spec reference:** `menubar.component.spec.md` §3 (`className` row), §7 Do/Don't row 3.
**Where enforced:** review — the pipe span's `className` string equals `"select-none text-muted-foreground px-1"` exactly (order-insensitive after `tailwind-merge`).
**Rule:** No accent color, no `font-*`, no `opacity-*` on the pipe. Any addition requires a spec revision (§3 of `menubar.component.spec.md` is a Props Contract table — a change bumps the changelog version).

### BR-06 -- `TabsList` and `TabsTrigger` receive no `className` override in the story

**Spec reference:** `menubar.component.spec.md` §6 (Canonical composition).
**Where enforced:** the `MenuBarStyle` story JSX.
**Rule:** The default inherited chrome (`flex gap-0 border-b border-border` on `TabsList`; underline + `▸` on selected `TabsTrigger`) **is** the MenuBar identity. Overriding it in the story would misrepresent the composition contract.

### BR-07 -- Labels are uppercase and short

**Spec reference:** `menubar.component.spec.md` §7 Do/Don't row 5.
**Where enforced:** the `MenuBarStyle` story JSX — use `"DASHBOARD"`, `"LIBRARY"`, `"SETTINGS"` verbatim (mirrors the BDD scenarios §8).
**Rule:** `TabsTrigger` applies `uppercase tracking-wider` in its base class; the story must pass strings that read as menu items, not sentence-case prose. Do not add a `className` to force casing — the primitive already handles it.

---

## 7. Storybook — Presentation and Component Tests

Per **ADR-001** and the task brief, the MenuBar composition is exposed
as a new story inside the existing `tabs.stories.tsx` file (meta
`title: "Navigation/Tabs"`, confirmed in the current source).

### Story location

- **Meta title (unchanged):** `Navigation/Tabs`
- **New named export:** `MenuBarStyle`
- **Storybook path in sidebar:** `Navigation / Tabs / MenuBarStyle`

### Required story exports

| Story export | Covers spec BDD scenario | `play()` assertions |
|--------------|--------------------------|---------------------|
| `MenuBarStyle` | "Default render — three-item menu bar", "Switching active item", "Accessibility parity — pipes excluded from the a11y tree" (§8) | (a) `getAllByRole('tab')` returns exactly 3 nodes; (b) each pipe `<span>` has `aria-hidden="true"` (query the two pipes by text `"|"` and assert the attribute); (c) initially active trigger has `aria-selected="true"` and `tabIndex={0}`, the other two have `tabIndex={-1}`; (d) `userEvent.click()` on a non-active trigger updates `aria-selected` and `tabIndex` per the base contract |

### Composition to render inside the story

Verbatim from `menubar.component.spec.md` §6 (canonical composition):
`<Tabs defaultValue="dashboard">` → `<TabsList>` containing three
`<TabsTrigger>` (values `"dashboard"`, `"library"`, `"settings"`;
labels `"DASHBOARD"`, `"LIBRARY"`, `"SETTINGS"`) interleaved with two
pipe `<span>`s (contract per §4.2). No `TabsContent` is required in the
story — the composition tests the strip in isolation.

### Additional consumer story (out of this task's scope)

The task brief also references a **Dashboard composition** story under
`Layout/Panel — Dashboard` that assembles Panel + StatPanel + Banner +
StatusBar + MenuBar into the VISUAL VAULT layout. That story is
authored under the Panel/Dashboard component task, **not** here — this
task only ships `MenuBarStyle` inside `tabs.stories.tsx`.

### Testing constraints

- Stories run in Playwright browser mode via `@storybook/addon-vitest`
  (CLAUDE.md — Testing). No JSDOM.
- `addon-a11y` runs on the story automatically — no additional
  configuration.
- **Do not bump `vitest` or `vite`** while adding this story (Gotcha #1
  in CLAUDE.md).

---

## 8. External Integrations

None. Pure presentational composition — no HTTP, no worker, no i18n
runtime (project is pt-BR, single owner; labels are literal in the
story).

---

## 9. Known Technical Constraints

1. **Consumer discipline is the enforcement mechanism.** Because the
   pipe interleaving is not enforced by the primitive, a future
   consumer could omit `aria-hidden` or use a different glyph. The
   `MenuBarStyle` `play()` guards the canonical composition; other
   consumer sites are guarded by the spec's Do/Don't table (§7) and
   review. ADR-2026-07-14-01's "revisit when" clause names the trigger
   for promoting this to a primitive.
2. **Arrow-key roving is an inherited gap** from `Tabs`
   (`tabs.component.spec.md` §1 / §9). This composition does not fix
   it; do not attempt to add `onKeyDown` handling on `TabsList` inside
   the story to compensate — that would diverge from the primitive
   contract.
3. **Pipe span is not `role="separator"`.** `role="separator"` would
   re-add the pipe to the a11y tree and imply orientation. The pipes
   are purely decorative, hence `aria-hidden="true"` (spec §9). Do not
   "improve" the semantics.
4. **`text-muted-foreground` contrast on the container background.**
   The pipe inherits the same contrast footprint as unselected
   `TabsTrigger` chrome. If a consumer nests the MenuBar inside a
   background that darkens contrast (e.g., an accent-tinted panel),
   the AA check for the pipe must be re-verified at that site. Not a
   constraint for the `MenuBarStyle` story itself (default Storybook
   background).
5. **`tailwind-merge` awareness.** The pipe span's `className` is a
   static string, not merged with a consumer override. If a future
   task adds a helper that accepts a `pipeClassName` prop, the shared
   `cn()` `extendTailwindMerge` configuration must recognize the
   `text-color` and spacing groups (already the case). No action for
   this task.

---

## 10. Out of Scope (implementation)

- **New `MenuBar` component file** — explicitly forbidden (ADR-2026-07-14-01).
- **`variant="menubar"` prop on `Tabs*`** — explicitly forbidden (spec §1 Out of scope; ADR-2026-07-14-01).
- **`interleave()` helper in `@/shared`** — spec §6 defers this to the consumer; not part of the UI kit this iteration.
- **Arrow-key roving navigation** — inherited gap from `Tabs` (spec §1 Out of scope).
- **Multi-select** — inherited single-select from `Tabs` (spec §1 Out of scope).
- **Nested submenus / hover-dropdown** — flat one-level strip only (spec §1 Out of scope).
- **New theme tokens** — none needed; all classes resolve against pre-existing tokens (§5).
- **Modifications to `tabs.tsx`, `tabs.types.ts`, `tabs/index.ts`** — the diff for this task must not touch the primitive.
- **Dashboard composition story** — authored under the Panel/Dashboard task, not here (§7).
- **Backend / API layer** — this is a UI Kit project (CLAUDE.md ADR-002); no `features/{feature}/api/`, no MSW handlers, no TanStack Query hook.

---

## Changelog

> Mandatory — never remove previous entries.

| Version | Date | Author | Type | Description | CR |
|---------|------|--------|------|-------------|----|
| 1.0.0 | 2026-07-14 | Back Spec Agent | initial | Initial implementation spec for the MenuBar composition — composition rules (TabsList + TabsTrigger + pipe `<span>`), no new TypeScript types beyond the existing `Tabs` surface, no new files under `shared/components/ui/`, and the new `MenuBarStyle` story added to `tabs.stories.tsx` under the existing `Navigation/Tabs` meta title. Invariants BR-01…BR-07 enforce the ADR-2026-07-14-01 boundary (no primitive modification, no CVA, no variant axis) | -- |
