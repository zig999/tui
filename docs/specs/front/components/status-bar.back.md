# StatusBar -- Implementation Spec (Front-end technical)

> Stack: React 19 + TypeScript 5 (strict) + Tailwind v4 (CSS-first `@theme`) | UI Kit: `frontend/` (autonomous package) | Version: 1.0.0 | Status: draft | Layer: permanent
> Business spec: `status-bar.component.spec.md`

> This is a UI Kit project — there is **no backend**. This document
> replaces the classic back-end spec with the **implementation technical
> spec** the `u-fe-developer` group must follow when writing the
> `StatusBar` primitive. It records every code-level decision (file
> layout, types, layout classes, ARIA wiring, story matrix) so that the
> implementation phase does not re-derive them from the component spec.

---

## 1. Stack and Patterns

> Only aspects that differ from or extend `CLAUDE.md` are called out.
> Everything else = "CLAUDE.md default".

| Aspect | Value | Note |
|--------|-------|------|
| Framework | React 19 (`ref` as normal prop; **never** `forwardRef`) | CLAUDE.md default. `StatusBar` does not need `ref` exposure but MUST accept it if passed (via the native `<div>` prop passthrough) |
| Language | TypeScript 5 strict | CLAUDE.md default |
| Styling | Tailwind v4 CSS-first `@theme` in `frontend/src/theme.css` | CLAUDE.md default; the bar uses only pre-existing semantic tokens — **no new tokens required** |
| Class merge | `cn()` from `@/shared/lib/cn` (tailwind-merge + clsx) | CLAUDE.md default — **never** string concatenation |
| Variant system | **None (no CVA)** | Component spec §6: "single visual variant". Component Contract mandates CVA only when there are 2+ variants — a single fixed variant does NOT use CVA |
| ID generation | Not required — no `aria-labelledby`, no linked elements | Root uses `aria-label` (a plain string prop) — no `useId()` needed |
| State management | **None** — no `useState` / `useReducer` / `useEffect` in `StatusBar` | Pure render function (see component spec §4: "Not applicable — no internal state") |
| Data layer | **None** — `StatusBar` is a pure presentational primitive; no TanStack Query hooks, no MSW handlers | Component Contract |
| Package boundary | Ships from `@/shared/components/ui/status-bar` — one of the sanctioned per-component barrels (CLAUDE.md — Component Contract) | Leaf primitive; consumed by dashboard-shell compositions alongside `Panel`, `StatPanel`, `MenuBar` |

---

## 2. File Layout

> The Component Contract prescribes exactly three files per component
> plus the per-component `index.ts` barrel (the sanctioned exception to
> the no-barrel rule). Stories live alongside — mandatory per ADR-001.

| File | Purpose |
|------|---------|
| `frontend/src/shared/components/ui/status-bar/status-bar.tsx` | Component implementation — pure render function (no state, no effects) |
| `frontend/src/shared/components/ui/status-bar/status-bar.types.ts` | `StatusBarProps`, `StatusBarRole` — no runtime code |
| `frontend/src/shared/components/ui/status-bar/index.ts` | Barrel: re-exports `StatusBar` and the public types |
| `frontend/src/shared/components/ui/status-bar/status-bar.stories.tsx` | Storybook stories (canonical presentation + component tests via `addon-vitest`) — see §7 |

Additional files/edits at implementation time:

- **No** changes to `frontend/src/theme.css` — all tokens used
  (`--color-border`, `--color-surface`, `--color-muted-foreground`) are
  already registered.
- **No** `index.ts` at any parent level (`ui/`, `components/`) — the
  no-barrel rule applies to every level above the per-component folder.
- **No** update to `shared/components/ui/index` (there is none, by design).

---

## 3. TypeScript Type Decisions

### 3.1 Public types (`status-bar.types.ts`)

```
StatusBarRole = "status" | "contentinfo" | "none"

StatusBarProps = Omit<ComponentProps<"div">, "role">
               & {
                   left?: ReactNode;
                   center?: ReactNode;
                   right?: ReactNode;
                   ariaLabel?: string;      // default "Status bar" (in render)
                   role?: StatusBarRole;    // default "status" (in render)
                   className?: string;
                 }
```

**Rationale:**

- All three slot props (`left`, `center`, `right`) are typed
  `ReactNode`, not `string` — the component spec §3 explicitly allows
  icon + text pairings, `<Kbd>` inside `right`, etc. Any subset may be
  omitted (spec §3.1) — the empty branch is handled in the render body
  by rendering the empty region regardless.
- `role` is typed as a **literal union** `"status" | "contentinfo" | "none"`
  (exported as `StatusBarRole`), not as the native
  `AriaRole` union. Spec §3 constrains `role` to exactly these three
  values; a wider union would let consumers pass `"button"`,
  `"navigation"`, etc., which the accessibility contract does not
  cover. This is the reason the passthrough `Omit`s `role`.
- `ariaLabel` is a **camelCase** prop (not `aria-label`) — the
  render body maps it to the DOM attribute `aria-label`. Rationale: the
  component spec's Props Contract uses `ariaLabel`; adopting the DOM
  form would leak the kebab-cased attribute into the public API and
  break the "props are camelCase" convention already established by
  `Panel`, `Alert`, etc.
- `ComponentProps<"div">` **must be `Omit`d on `role`** — the native
  `role` attribute would accept any `AriaRole` string and would collide
  with the constrained `StatusBarRole` union. Without `Omit`, TS
  widens `role` to `AriaRole | undefined` and the constrained union is
  lost. This is the single Omit noted in component spec §3.

### 3.2 Internal types (module-local in `status-bar.tsx`)

None. The role default and label default are plain literal fallbacks in
the destructure — no lookup table needed.

---

## 4. Layout & Class Composition (no CVA)

### 4.1 Why no CVA

Component spec §6 states verbatim: **"No CVA — the bar has a single
visual variant."** The Component Contract (`CLAUDE.md` — Stack —
Frontend) mandates CVA **only when there are 2+ visual variants**. A
single-variant component uses a plain `cn()` composition — introducing
CVA here would violate the contract.

### 4.2 Fixed layout class strings

All layout classes are **fixed string literals** applied via `cn()` on
each element. No branching. No conditional class strings.

**Root `<div>` classes** (spec §6, verbatim):

```
flex w-full items-center justify-between gap-4
border-t border-border bg-surface
px-4 py-1
text-xs text-muted-foreground
```

**Slot region classes** (three sibling `<div>`s, always rendered):

| Region | Class string |
|--------|--------------|
| `left`   | `flex flex-1 items-center justify-start  gap-2` |
| `center` | `flex flex-1 items-center justify-center gap-2` |
| `right`  | `flex flex-1 items-center justify-end    gap-2` |

**Class-string breakdown (root, exact tokens):**

| Class | Token | Reason |
|-------|-------|--------|
| `flex w-full items-center justify-between` | — | Full-width horizontal strip; `justify-between` combined with the three `flex-1` children keeps `left`/`center`/`right` at their designated edges. |
| `gap-4` | Tailwind spacing scale (default `1rem`) | Minimum gutter between the three regions so touching content does not visually merge. |
| `border-t` | `--border-DEFAULT` (WIDTH namespace) | Draws only the top rule (spec §1: "top border only, not a Panel"). |
| `border-border` | `--color-border` (COLOR namespace) | Border color — semantic token. **Two-namespace pairing** (`border-t` width + `border-border` color) — do NOT mix into a single `border-t-*` shortcut (Gotcha #2 in CLAUDE.md). |
| `bg-surface` | `--color-surface` | Bar background — matches the shell background scheme used by `Panel`. |
| `px-4 py-1` | Tailwind spacing scale | Horizontal breathing room; tight vertical padding to keep the strip single-line. |
| `text-xs` | Typography scale | Compact type per spec §1 ("`text-xs`, monospace"). Monospace is inherited from the app-shell body font — the bar does not force `font-mono` because the design system already sets monospace globally (theme.css). |
| `text-muted-foreground` | `--color-muted-foreground` | Passive/secondary color — the bar is a passive strip; slot content that needs emphasis overrides via its own text class. |

### 4.3 Empty-slot handling (layout-preserving)

Spec §3.1 mandates: **"When a slot is `undefined`, its `<div>` region
still renders (as an empty flex item) so the remaining slots stay at
their expected justify positions."**

**Implementation rule:** the render body **always** emits three
`<div>` region elements, regardless of whether `left` / `center` /
`right` is `undefined`. The falsy prop is passed as a child:

```
<div className={REGION_LEFT}>{left}</div>
<div className={REGION_CENTER}>{center}</div>
<div className={REGION_RIGHT}>{right}</div>
```

React renders `undefined` children as nothing, but the enclosing
`<div>` still occupies its `flex-1` share of the row. **Do NOT** use a
conditional `{left && <div>...</div>}` pattern — that collapses the
region and shifts the remaining slots (BDD §8 "Empty slot preserves
layout" would fail).

### 4.4 Consumer `className` merge

Component spec §3 last row: `className` is merged via `cn()` onto the
root `<div>` **only**. Consumers cannot override slot-region classes —
that keeps the three-column geometry stable. The render body:

```
<div className={cn(ROOT_CLASSES, className)} ...>
```

`ROOT_CLASSES` is a module-scope `const` string; splitting it out
keeps the JSX readable and lets `cn()` deduplicate any conflicting
consumer classes (e.g., a consumer passing `border-t-0` to remove the
top rule).

---

## 5. Token Bindings

### 5.1 Prerequisites

**None.** All tokens consumed by `StatusBar` are already registered in
`frontend/src/theme.css`:

- `--color-border` — already declared under `@theme` (phosphor) and
  overridden under `[data-theme="default"]` (Dracula).
- `--color-surface` — already declared for both themes.
- `--color-muted-foreground` — already declared for both themes.

No `theme.css` edit is required for this component. This is a
distinguishing feature vs `Panel` (which required `--color-accent-alt`
registration).

### 5.2 Token-to-class mapping (single source of truth)

| Concern | Class(es) | Token(s) consumed | Namespace |
|---------|-----------|-------------------|-----------|
| Bar background | `bg-surface` | `--color-surface` | COLOR |
| Top-rule color | `border-border` | `--color-border` | COLOR (`--color-border-*`) |
| Top-rule width | `border-t` (1px, top only) | `--border-DEFAULT` | WIDTH (`--border-*`) |
| Bar text color | `text-muted-foreground` | `--color-muted-foreground` | COLOR |
| Bar text size | `text-xs` | Typography scale (default `0.75rem`) | — |
| Horizontal padding | `px-4` | Tailwind spacing scale (default `1rem`) | — |
| Vertical padding | `py-1` | Tailwind spacing scale (default `0.25rem`) | — |
| Inter-region gap | `gap-4` (root); `gap-2` (per region, for chained slot children) | Tailwind spacing scale | — |

**Never** hardcode any raw value (Component Contract). If a `#hex`,
`rgb(...)`, `oklch(...)`, or `px` literal appears in `status-bar.tsx`,
the review group must reject. There are **no** arbitrary values
(`[...]`) in this component — unlike `Panel`'s `-mt-[0.6em]` notch,
`StatusBar` uses only the named Tailwind scale.

### 5.3 Contrast obligation

Component spec §9: `text-muted-foreground` on `bg-surface` must clear
WCAG 2.2 AA (≥ 4.5:1) in **both** themes (phosphor + Dracula). The
implementation itself does not compute contrast; the `u-fe-qa` group
verifies this via `addon-a11y` on every story. If either theme fails,
the failure is fixed at the token level (`theme.css`), not at the
component level.

---

## 6. Implementation Rules (BR-nn, mapped to spec)

> No back-end business rules exist for a UI Kit primitive. What follows
> are the **implementation invariants** the developer group must
> enforce. Each rule references a spec section for traceability — the
> `u-fe-qa` phase will verify each one via a Storybook story.

### BR-01 -- Root element is always a `<div>` (never `<footer>`, never `<section>`)

**Spec reference:** `status-bar.component.spec.md` §1, §3, §9.
**Where enforced:** `status-bar.tsx` JSX literal.
**Rule:** The passthrough is typed via `Omit<ComponentProps<"div">, "role">`
and the JSX is `<div>`. Landmark semantics (`contentinfo`) come from
the `role` prop, **not** from the element tag — this lets consumers
pick `role="none"` for decorative usage without changing the tag.
**Failure mode:** switching to `<footer>` would force a `contentinfo`
landmark even under `role="none"`, breaking the "decorative bar" BDD
scenario (§8).

### BR-02 -- `role` and `aria-label` are always applied — defaults in the destructure

**Spec reference:** `status-bar.component.spec.md` §3, §9.
**Where enforced:** `status-bar.tsx` destructure and JSX.
**Rule:** The destructure applies defaults:
`{ left, center, right, ariaLabel = "Status bar", role = "status", className, ...rest } = props`.
The JSX emits `role={role}` and `aria-label={ariaLabel}` unconditionally.
**Special case — `role="none"`:** the DOM attribute `role="none"` is
still emitted; **do not** conditionally omit `role` when `none` is
passed. Rationale: `role="none"` is a valid, spec-mandated way to
remove ARIA semantics (BDD §8 "Decorative role"); omitting the
attribute would leave the implicit `<div>` role (no landmark, no live
region) which is functionally equivalent — but the BDD scenario
literally checks for the `role="none"` attribute, and the story test
asserts on it.

### BR-03 -- The three region `<div>`s are always rendered (empty-slot layout preservation)

**Spec reference:** `status-bar.component.spec.md` §3.1, §8 BDD "Empty slot preserves layout".
**Where enforced:** `status-bar.tsx` JSX — no conditional wrappers around slot regions.
**Rule:** Never write `{left && <div>...</div>}`. Always emit
`<div>{left}</div>`, `<div>{center}</div>`, `<div>{right}</div>` — the
region `<div>` occupies its `flex-1` share whether the child is
`undefined` or not.
**Failure mode:** collapsing an empty region shifts `right` toward the
middle when `center` is absent — spec BDD "Empty slot preserves
layout" fails.

### BR-04 -- Passthrough drops `role` (typed Omit)

**Spec reference:** `status-bar.component.spec.md` §3 (last row).
**Where enforced:** `StatusBarProps` type extends
`Omit<ComponentProps<"div">, "role">`, so `{...rest}` cannot leak a
native `role` string.
**Rule:** Any refactor that switches to `props.role` (indexed access)
or drops the `Omit` would allow arbitrary role strings and must be
rejected in review. The constrained `StatusBarRole` union is the
public contract.

### BR-05 -- `className` is merged via `cn()` on the root only

**Spec reference:** `status-bar.component.spec.md` §3.
**Where enforced:** `status-bar.tsx` — `className={cn(ROOT_CLASSES, className)}` on the root `<div>`.
**Rule:** No `className` is accepted on the region `<div>`s. Consumers
who need to style individual regions do so by styling the content they
pass into the slot (`left`, `center`, `right`), not by targeting the
region container. This keeps the three-column geometry stable and
prevents accidental `flex-1` overrides.

### BR-06 -- No CVA, no `class-variance-authority` import

**Spec reference:** `status-bar.component.spec.md` §6; Component Contract in `CLAUDE.md`.
**Where enforced:** review — code search over `status-bar.tsx`.
**Rule:** `status-bar.tsx` **must not** import `cva` /
`VariantProps` from `class-variance-authority`. A single-variant
component uses `cn()` composition only. Introducing CVA here is a
Component Contract violation — automatic review rejection.

### BR-07 -- No `useState` / `useReducer` / `useEffect` / `useId`

**Spec reference:** `status-bar.component.spec.md` §4 ("Not applicable — no internal state"); §5 ("Not applicable — no callback props").
**Where enforced:** `status-bar.tsx` — pure render function.
**Rule:** The file imports **only** `cn` from `@/shared/lib/cn` and
the required React type imports (`ReactNode`, `ComponentProps`) from
the types file. No React hooks. If a hook appears in a diff, reject.
The bar has no state, no events, no `aria-labelledby` (uses
`aria-label` string instead — so no `useId` either).

### BR-08 -- Two-namespace border pairing (Gotcha #2)

**Spec reference:** `CLAUDE.md` Known Gotchas §2.
**Where enforced:** `status-bar.tsx` root classes — `border-t` (WIDTH) + `border-border` (COLOR) as separate classes.
**Rule:** Do **not** combine these into a single `border-t-border`
shortcut — that class does not exist under Tailwind v4's two-namespace
border model and the border disappears silently. The two classes MUST
appear side by side in the root class string.
**Failure mode:** silent visual failure — the top rule vanishes with
no build error and no runtime warning.

### BR-09 -- No interactivity — bar itself is non-interactive

**Spec reference:** `status-bar.component.spec.md` §1 ("Out of scope: Interactivity of the bar itself"), §7 (Do/Don't).
**Where enforced:** `StatusBarProps` type (no `onClick`), `status-bar.tsx` render (no `tabIndex`, no `onKeyDown`).
**Rule:** If an event handler prop, `tabIndex`, or `role="button"`
appears on the bar's root in a diff, reject. Interactive children
inside the slots are the consumer's responsibility — they carry their
own ARIA and focus behavior.

### BR-10 -- `role="status"` implies polite live region — consumer bears announcement discipline

**Spec reference:** `status-bar.component.spec.md` §7 (Do/Don't row on high-frequency timestamps), §9 (Live region).
**Where enforced:** implementation exposes the `role` prop; **does not**
add debouncing, throttling, or any announcement mitigation.
**Rule:** The component does not implement any anti-spam behavior. If
a consumer wires an every-second timestamp into `right` under the
default `role="status"`, the polite live region announces every tick —
that is a consumer misuse. The spec's remedy (§7): consumer either
debounces the update at the source, or downgrades to `role="none"`.
**Documentation obligation:** the JSDoc on `role` (in
`status-bar.types.ts`) must state this trade-off verbatim so IDE
tooltips surface it at call sites.

---

## 7. Storybook — Presentation and Component Tests

Per **ADR-001**, `StatusBar` ships with `status-bar.stories.tsx` and
the stories are its component tests via `@storybook/addon-vitest`. The
developer group must include exactly these named exports — one per BDD
scenario in `status-bar.component.spec.md` §8, matching the four
required stories in component spec §10:

| Story export | Covers spec BDD scenario | Additional a11y / assertion check |
|--------------|--------------------------|-----------------------------------|
| `Default` | "Default render" | `getByRole("status")` resolves; `aria-label="Status bar"`; three region `<div>`s render with the correct `justify-*` classes; `addon-a11y` axe pass |
| `EmptyCenter` | "Empty slot preserves layout" | `getByText("12:34")` is horizontally at the right edge (not centered); the middle region exists but is empty |
| `ContentInfoRole` | "Role override — contentinfo" | `getByRole("contentinfo", { name: "Application footer" })` resolves; landmark tree exposes the footer landmark |
| `DecorativeRole` | "Decorative role" | `getByText("Version 1.0.0")` is present; root `<div>` has `role="none"` attribute; assistive tech does NOT expose the bar as a landmark or live region (verified via `queryByRole("status")` returning `null`) |

**Additionally required:** a fifth "live region" scenario from BDD §8
("Live-region announcement") is **not** promoted to a Storybook story
because the assertion ("polite live region announces `Loading...`") is
browser/screen-reader-dependent and cannot be reliably tested in
Playwright browser mode. The component's contribution — emitting
`role="status"` — is already covered by the `Default` story assertion.
Reviewer must confirm this omission is documented in the story file
header comment.

**Story frame requirement (spec §10):** each story wraps the bar in a
`min-h-24 flex flex-col justify-end` container so the bar sits at the
visual bottom of the story canvas — reflecting real usage. This
wrapper is a story concern, not a component API — the `StatusBar`
component itself has no notion of "sticky" or "bottom" positioning
(spec §1: "Sticky positioning — the parent layout controls stick
behavior").

**Storybook sidebar location (spec §10):** meta `title: "Layout/StatusBar"`
— groups the bar with `Layout/Panel` and `Layout/Panel — Dashboard`,
NOT under `Feedback/` or `Navigation/`.

**Vitest/Vite pin.** Do **not** bump `vitest` or `vite` while adding
these stories (Gotcha #1 in CLAUDE.md).

---

## 8. External Integrations

None. `StatusBar` is a pure presentational primitive. No HTTP, no
WebSocket, no worker, no i18n runtime (project is pt-BR, single owner
— strings are literal in stories, and the default `ariaLabel` is
intentionally English per spec §9 as a technical label).

---

## 9. Known Technical Constraints

1. **Two-namespace border trap** — Gotcha #2 (CLAUDE.md). The top rule
   uses `border-t` (WIDTH) + `border-border` (COLOR). Mixing namespaces
   silently drops the border (BR-08). Automated grep in CI:
   `grep -E "border-t-[a-z]" status-bar.tsx` must be empty — any hit
   is a false shortcut that will resolve to `unset`.
2. **`role="none"` semantics vs `role="presentation"`**. The spec
   picks `"none"` explicitly (BDD §8 "Decorative role"). Do **not**
   substitute `"presentation"` — while ARIA treats them as synonyms,
   the BDD assertion checks the exact attribute value `role="none"`,
   and swapping the value fails the story test.
3. **`role="status"` and monospace font metrics.** The bar inherits
   monospace typography from the app shell (`theme.css`). If a
   consumer wraps the bar in a scope that overrides `font-family` to a
   proportional face, timestamps and mode indicators will visually
   jitter as they update — a UX regression, not a component bug. The
   spec §1 ("monospace, `text-xs`") anticipates monospace inheritance;
   the component does not force `font-mono` on its own root because
   that would leak styling into consumer content that legitimately
   needs proportional type inside slots (e.g., a translated status
   message).
4. **`aria-label` string is English by design** (spec §9). Do **not**
   translate `"Status bar"` to pt-BR in the default. Rationale
   quoted from spec §9: "the string is intentionally English because
   it's a technical label — the visible content in the slots is what
   the user sees, and it may be in any language". Any consumer that
   needs a domain-specific label overrides via the `ariaLabel` prop
   (e.g., `ariaLabel="Barra de status do player"`).
5. **No `ref` forwarding gymnastics.** React 19 accepts `ref` as a
   normal prop; because the passthrough is `Omit<ComponentProps<"div">, "role">`,
   `ref` is included automatically and flows to the root `<div>`. Do
   NOT add explicit `ref` handling — that reintroduces the
   `forwardRef` era pattern which the Component Contract forbids.

---

## 10. Out of Scope (implementation)

- **Backend / API layer** — this is a UI Kit project (CLAUDE.md ADR-002); no `features/{feature}/api/`, no MSW handlers, no TanStack Query hook.
- **State management** — no Zustand slice; no `useState`, `useReducer`, `useEffect`, `useId` (spec §4).
- **Variants / CVA** — spec §6 "single visual variant"; the file must not import from `class-variance-authority` (BR-06).
- **Vertical status bars** — spec §1: horizontal-only.
- **Sticky/fixed positioning** — spec §1: parent-layout concern.
- **Marquee/rotating slot content** — spec §1: consumer's responsibility if desired.
- **Debouncing/throttling of slot updates** — BR-10: the component exposes `role` and does not moderate announcement frequency.
- **`aria-labelledby` wiring / `useId`** — the bar uses `aria-label` (a plain string), not a linked heading. `useId` is not needed and must not be introduced.
- **i18n runtime** — CLAUDE.md declares `i18n: false`; `ariaLabel` default is literal English (spec §9).
- **Interactive root** — no `onClick` / `role="button"` / keyboard activation on `<StatusBar>` itself (spec §1; BR-09).

---

## Changelog

> Mandatory — never remove previous entries.

| Version | Date | Author | Type | Description | CR |
|---------|------|--------|------|-------------|----|
| 1.0.0 | 2026-07-14 | Back Spec Agent | initial | Initial implementation spec for the `StatusBar` primitive — file layout, TypeScript types (`StatusBarRole` literal union; `Omit<ComponentProps<"div">, "role">`), fixed layout class composition (no CVA — single visual variant), token bindings (no new tokens required; two-namespace border pairing per Gotcha #2), implementation invariants (BR-01…BR-10) mapped to the component spec, and the four required Storybook stories per ADR-001 (Default / EmptyCenter / ContentInfoRole / DecorativeRole) | -- |
