# Banner -- Implementation Spec (Front-end technical)

> Stack: React 19 + TypeScript 5 (strict) + Tailwind v4 (CSS-first `@theme`) | UI Kit: `frontend/` (autonomous package) | Version: 1.0.0 | Status: draft | Layer: permanent
> Business spec: `banner.component.spec.md`
> Path: `frontend/src/shared/components/ui/banner/`

> **Project note.** TUI is a pure frontend UI Kit — there is no backend, no
> database, no server-side integration. This document replaces the classic
> back-end spec with the **implementation technical spec** the
> `u-fe-developer` group must follow when writing the `Banner` primitive.
> Sections of the canonical `TEMPLATE.back.md` that address server-side
> concerns (Data Model, Business Rules, State Machine, Domain Events,
> External Integrations) are marked *N/A* with an explicit reason. Its
> primary purpose is to lock down the a11y contract in `frame="notched"`
> mode (dual-heading collapse via `aria-hidden`, and the
> `aria-labelledby` wiring inherited from `Panel`) so the two issues
> flagged by the Spec Reviewer are resolved by construction.

---

## 1. Stack and Patterns

> Only aspects that differ from or extend `CLAUDE.md` are called out.
> Everything else = "CLAUDE.md default".

| Aspect | Value | Note |
|--------|-------|------|
| Framework | React 19 (`ref` as a normal prop; **never** `forwardRef`) | CLAUDE.md default |
| Language | TypeScript 5 strict | CLAUDE.md default |
| Styling | Tailwind v4 CSS-first `@theme` in `frontend/src/theme.css` | CLAUDE.md default |
| Class merge | `cn()` from `@/shared/lib/cn` (tailwind-merge + clsx) | CLAUDE.md default — **never** string concatenation |
| Variant system | **No CVA** — the only variant axis (`frame`) is discrete and drives two different render trees, not a class variant; the second variant axis (`accent`) is delegated to `Panel` when `frame="notched"` | Per Component Contract §"CVA only when there are 2+ visual variants" — `Banner` has one binary render-tree switch, forbidden to model as CVA |
| ID generation | React 19 `useId()` for the `<h*>` id linked by `aria-labelledby` in `frame="notched"` mode (§4.3) | Stable across SSR/CSR — never `Math.random()`, never derived from `title` |
| State management | **None** — no `useState` / `useReducer` / `useEffect` in `Banner` | Pure render function (see `banner.component.spec.md` §4) |
| Data layer | **None** — `Banner` is a pure presentational primitive; no TanStack Query hooks, no MSW handlers | Component Contract |
| Package boundary | Ships from `@/shared/components/ui/banner` — one of the sanctioned per-component barrels (see CLAUDE.md — Component Contract). Depends on `@/shared/components/ui/panel` when `frame="notched"` | Consumed at page level in the VISUAL VAULT dashboard shell |

---

## 2. File Layout

Four files, matching the Component Contract plus the mandatory stories file
per ADR-001.

```
frontend/src/shared/components/ui/banner/
  banner.tsx          # named export: Banner (function component)
  banner.types.ts     # named exports: BannerProps, BannerFrame, BannerAccent, BannerTitleLevel
  index.ts            # per-component barrel — sanctioned exception
  banner.stories.tsx  # Storybook stories under Layout/Banner (see §7)
```

`index.ts` re-exports the single public surface:

```
// banner/index.ts
export { Banner } from "./banner";
export type {
  BannerProps,
  BannerFrame,
  BannerAccent,
  BannerTitleLevel,
} from "./banner.types";
```

**Nothing else is re-exported.** In particular, no `bannerVariants` symbol
exists because CVA is not used (§1). No `index.ts` at any parent level
(`ui/`, `components/`) — the no-barrel rule applies at every level above
the per-component folder.

**Prerequisite dependency.** `Banner`'s `frame="notched"` branch imports
`Panel` from `@/shared/components/ui/panel`. The `Panel` primitive must
already ship (its own `.back.md` covers implementation). If `Panel` is
missing, the notched branch does not compile — see §8 (Constraint 1).

---

## 3. TypeScript Type Decisions

### 3.1 Public types (`banner.types.ts`)

```
BannerFrame       = "none" | "notched"
BannerAccent      = "default" | "success" | "info" | "warning" | "danger" | "alt"
BannerTitleLevel  = 1 | 2 | 3

BannerProps       = Omit<ComponentProps<"header">, "title">
                  & {
                      title:       string;                // required
                      subtitle?:   string;
                      action?:     ReactNode;
                      logo?:       ReactNode;
                      frame?:      BannerFrame;           // default "none" (in render)
                      accent?:     BannerAccent;          // default "default" — ignored when frame="none"
                      titleLevel?: BannerTitleLevel;      // default 1 (in render)
                      className?: string;
                    }
```

**Rationale:**

- `title` is typed as `string` (**not** `ReactNode`) because it must
  populate both (a) a heading element `<h*>` and (b) — when
  `frame="notched"` — the visible notched-border label rendered by
  `Panel`. Allowing `ReactNode` would smuggle interactive elements into
  the heading (forbidden by spec §1) and break the accessible name
  computation (§4.3).
- `ComponentProps<"header">` **must be `Omit`d on `title`** — the native
  HTML `title` attribute (tooltip) collides with our domain-specific
  `title` prop. Without `Omit`, TS accepts both meanings and the
  component's `title` is coerced to `string | undefined` from the DOM
  attribute typing, breaking the required-prop contract.
- Passthrough type uses `"header"` (not `"section"`) because the
  default render tree (`frame="none"`) roots on `<header>`. When
  `frame="notched"` the root is a `<section>` (produced by `Panel`),
  and `Panel` accepts native `<section>` attributes via its own
  passthrough — the `header` attribute surface is a **superset** of
  what a `<section>` accepts for the props we care about
  (`id`, `data-*`, `aria-*`, event handlers), so a single type is
  sufficient and rejects the visual/type asymmetry as a documented
  trade-off. Callers who need a `<section>`-specific attribute in the
  notched branch pass it as-is — TypeScript will accept it via the
  intersection with `HTMLAttributes<HTMLElement>` (both `<header>` and
  `<section>` inherit from `HTMLElement`).
- `subtitle`, `logo`, `action` are optional and unrelated to the
  accessible name — the `<h*>` alone carries it (§4.3, BR-04).
- `accent` is declared regardless of `frame` for a stable public API;
  the render silently ignores it when `frame="none"` (spec §3.1 data
  contract). No runtime warning is emitted — this matches the
  documented "silently ignored" semantics.
- `titleLevel` is a **literal-union** (`1 | 2 | 3`), not `number`. The
  heading dispatch (§4.1) narrows the tag union at compile time. Note
  that `Banner` accepts `1` — the page-level H1 — which `Panel`'s own
  `titleLevel` (`2 | 3 | 4`) does not. See §4.4 for how the two levels
  reconcile in the notched branch.

### 3.2 Internal types (module-local in `banner.tsx`)

- `HEADING_TAG: Record<BannerTitleLevel, "h1" | "h2" | "h3"> = { 1: "h1", 2: "h2", 3: "h3" }`
  — module-scope const map, kept out of `banner.types.ts` because it is
  not part of the public API.
- No other internal types. In particular, no `VariantProps<...>` because
  there is no CVA (§1).

---

## 4. Rendering Contract

`Banner` is a two-branch render function. The branch is chosen by
`frame` and cannot be blended.

### 4.1 Branch A -- `frame="none"` (default, VISUAL VAULT strip)

Root JSX (schematic, class strings from `banner.component.spec.md` §6):

```
<header
  ref={ref}
  className={cn(
    "relative flex items-start justify-between",
    "bg-surface border-b border-border px-4 py-6",
    className,
  )}
  {...rest}
>
  <div className="flex-1 flex flex-col items-center gap-1 text-center">
    {logo && <span aria-hidden="true">{logo}</span>}
    <As className="text-4xl font-bold tracking-wider text-foreground">{title}</As>
    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
  </div>
  {action && <div className="absolute right-4 top-4">{action}</div>}
</header>
```

Key points:

- Root is `<header>` — native banner landmark **only** when placed as a
  direct child of `<body>` (spec §9). No `role="banner"` is written by
  `Banner` — consumers who need the landmark unconditionally add it via
  the passthrough (spec §9), and the passthrough (`{...rest}`) allows it.
- `As` is `HEADING_TAG[titleLevel ?? 1]` — default `<h1>`.
- `id` is **not** wired to the heading in this branch. The `<header>`
  landmark derives its accessible name from the child `<h*>` per default
  landmark labelling — no `aria-labelledby` is needed and the extra
  `useId()` call is skipped.
- `logo` is wrapped in `<span aria-hidden="true">` — mirrors the `Panel`
  pattern (BR-03 in `panel.back.md`) so raw emoji strings never leak
  into the accessible name.
- `accent` is destructured and **discarded** in this branch. See
  BR-05.
- `action` sits in the absolutely-positioned wrapper — the wrapper is
  the only positioning host, and the consumer's node retains its own
  layout. Never wrap `action` in an interactive element inside `Banner`;
  interactivity is the consumer's slot node responsibility (spec §5).

### 4.2 Branch B -- `frame="notched"`

Root JSX (schematic; delegation to `Panel`):

```
const titleId = useId();
<Panel
  ref={ref}
  title={title}
  accent={accent}
  titleLevel={panelTitleLevelFor(titleLevel)}   // §4.4
  className={cn("banner-notched-root", className)}
  {...rest}
>
  <div className="flex-1 flex flex-col items-center gap-1 text-center">
    {logo && <span aria-hidden="true">{logo}</span>}
    <As
      id={titleId}
      aria-hidden="true"                          // §4.3, BR-06
      className="text-4xl font-bold tracking-wider text-foreground"
    >
      {title}
    </As>
    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
  </div>
  {action && <div className="absolute right-4 top-4">{action}</div>}
</Panel>
```

Key points:

- Root landmark becomes `<section>` (produced by `Panel`) with
  `Panel`'s own `aria-labelledby` wired to `Panel`'s notched heading
  (which is the `<h*>` `Panel` itself renders and mounts inside the
  top-border notch). See `panel.back.md` BR-01.
- The visible inner `<h*>` rendered by `Banner` is a **presentational
  duplicate** of the notched title — same string, same accessible
  content. To avoid the "dual heading" AT visibility bug the reviewer
  flagged, the inner `<h*>` is marked `aria-hidden="true"` (§4.3, BR-06).
- `titleId` is generated but only used as the DOM `id` on the visible
  inner heading — **not** as the target of an `aria-labelledby`. The
  labelling relationship is fully owned by `Panel` (Panel wires
  `aria-labelledby={panelHeadingId}` on its own `<section>`). See §4.3.
- `Banner` does **not** pass `aria-labelledby` on the wrapper — `Panel`
  already sets it on the `<section>` (see `panel.back.md` BR-01).
  Passing a duplicate would cause AT to announce the label twice.
- `action`'s absolute positioning is anchored to `Panel`'s `<section>`
  via `Panel`'s `relative` base class (see `panel.back.md` §4.1) —
  therefore the `absolute right-4 top-4` wrapper works without adding
  `relative` on `Banner`'s side.

### 4.3 A11y contract in the notched branch (resolves reviewer flags)

The Spec Reviewer flagged two a11y issues in `frame="notched"` mode:

1. **Dual heading AT visibility.** `Panel` already renders its own
   `<h*>` inside the notched top-border (that heading is the target of
   `Panel`'s `aria-labelledby`, per `panel.back.md` BR-01). If `Banner`
   also renders a visible inner `<h*>` with the same string, both
   headings appear in the AT heading outline — two entries for one
   logical heading, one of which is not the one screen readers
   announce as the section label.

2. **`aria-labelledby` mechanism unclear.** It is unspecified which of
   the two headings owns the accessible name.

**Decision (implementation).** In `frame="notched"` mode:

- The heading owned by **`Panel`** (rendered inside the notch, ID
  generated by `Panel`'s own `useId()`) is the **single AT-accessible
  heading**. `Panel`'s existing `aria-labelledby` wiring is the sole
  source of the section's accessible name — no changes to `Panel` are
  required by this spec.
- The inner `<h*>` that `Banner` renders (the large centered visual
  headline) is marked `aria-hidden="true"`. It stays in the DOM (it is
  the intended visual focal point per spec §1) but is removed from the
  accessibility tree — including the heading outline.
- `Banner` **still generates a `titleId` via `useId()`** and attaches
  it to the inner `<h*>` as the DOM `id`. This is not used for
  labelling in this spec — it is reserved for future consumer hooks
  (e.g., skip links) and for parity with the strip branch when it is
  later revisited. The reserved id has no accessibility side-effect
  because the element is `aria-hidden`.
- `logo`, when present in the notched branch, remains
  `aria-hidden="true"` (independent decoration).

**Consequence for the outline.** Only one heading per `Banner` instance
appears in the AT outline in `frame="notched"` mode: the notched
heading rendered by `Panel` at `Panel`'s own `titleLevel` (see §4.4 for
how `Banner.titleLevel` maps to `Panel.titleLevel`). In the
`frame="none"` branch there is exactly one heading (the inner `<h*>`)
and it is fully visible to AT.

**Why not the inverse (hide `Panel`'s heading, keep `Banner`'s)?** Two
reasons: (a) `Panel`'s heading is the referent of `Panel`'s
`aria-labelledby` (BR-01 in `panel.back.md`); hiding it would break the
section's accessible name mechanism, forcing a fork of `Panel`. (b)
`Panel`'s heading is the one visually rendered in the notch — the
consumer sees the label on the border. AT-only users must experience
the same anchor.

### 4.4 Reconciling `Banner.titleLevel` with `Panel.titleLevel`

`BannerTitleLevel = 1 | 2 | 3` but `PanelTitleLevel = 2 | 3 | 4`. When
`frame="notched"`, `Banner` must map its level to a valid Panel level
because the notched heading is `Panel`'s heading:

```
panelTitleLevelFor: (level: BannerTitleLevel) => PanelTitleLevel
  1 -> 2   // a page-level Banner delegates to a Panel h2 in the notch
  2 -> 3
  3 -> 4
```

Rationale: consumers set `titleLevel=1` to signal "this is the page's
top-level heading". `Panel`'s own contract forbids `h1` (see
`panel.back.md` BR-02), so the notched branch shifts the semantic level
down by one to keep the notched heading valid and preserve a
descending outline. In the `frame="none"` branch no shift is applied —
the inner `<h*>` renders at the requested level directly. This is a
documented, intentional asymmetry.

**Where enforced.** `banner.tsx` module-scope const helper
`panelTitleLevelFor` — a total function over `BannerTitleLevel`,
returning `PanelTitleLevel`. Reject any implementation that inlines the
mapping in JSX (readability + testability).

**Consumer disclosure.** This mapping should be surfaced in the
`Notched` Storybook story description (see §7) so consumers understand
why their `titleLevel=1` prop yields an `<h2>` in the notch.

---

## 5. Token Bindings

`Banner` writes only semantic-token classes; no raw values, no `#hex`,
no `px` literals.

### 5.1 Token-to-class mapping (single source of truth)

| Concern | Class(es) | Token(s) consumed | Namespace |
|---------|-----------|-------------------|-----------|
| Strip background (`frame="none"`) | `bg-surface` | `--color-surface` | COLOR |
| Strip bottom rule (`frame="none"`) | `border-b border-border` | `--color-border-DEFAULT` + `--border-DEFAULT` | COLOR + WIDTH |
| Strip padding | `px-4 py-6` | Tailwind spacing scale | — |
| Title typography | `text-4xl font-bold tracking-wider text-foreground` | `--color-foreground` (COLOR); font-size / weight / letter-spacing come from the Tailwind typography scale | COLOR |
| Subtitle typography | `text-sm text-muted-foreground` | `--color-muted-foreground` | COLOR |
| Action wrapper positioning | `absolute right-4 top-4` | Tailwind spacing scale | — |
| Logo wrapper | (none — `<span aria-hidden="true">` only) | — | — |
| Notched frame (all border + accent tokens) | Delegated to `Panel` | See `panel.back.md` §5.2 | — |

**Two-namespace border trap (Gotcha #2).** The strip branch uses
`border-b` (WIDTH namespace via `--border-DEFAULT`) + `border-border`
(COLOR namespace via `--color-border-DEFAULT`). Both are needed —
omitting either silently drops the bottom rule. Automated grep in CI:
`grep -E "border-b-\[\s*[0-9]+px" banner.tsx` must be empty.

### 5.2 Token prerequisite

No new token registration is required by `Banner`. Its accent tokens
are consumed transitively through `Panel` and are covered by
`panel.back.md` §5.1 (`--color-accent-alt` prerequisite). If `Panel`
ships with the token prerequisite unmet, `Banner`'s notched branch
inherits the same silent-failure risk — but there is nothing for the
`u-fe-developer` group to add here beyond confirming the upstream
prerequisite is closed.

---

## 6. Implementation Rules (BR-nn, mapped to spec)

> No back-end business rules exist for a UI Kit primitive. What follows
> are the **implementation invariants** the developer group must
> enforce. Each rule references a section of `banner.component.spec.md`
> for traceability; the `u-fe-qa` phase verifies each via a Storybook
> story.

### BR-01 -- The `frame` prop drives two disjoint render trees, never a class variant

**Spec reference:** `banner.component.spec.md` §6.
**Where enforced:** `banner.tsx` render body — an early conditional
`if (frame === "notched") return <NotchedTree/>` (or an equivalent
ternary at the top of the return). No merged class strings, no
CVA `frame` axis.
**Rule:** The two branches produce different root elements (`<header>`
vs `Panel`'s `<section>`), different landmarks, and different a11y
contracts (§4.3). Blending them is forbidden.
**Failure mode:** Modeling `frame` as a CVA axis or a shared root
would either force a wrong landmark on one branch or leak Panel's
`aria-labelledby` into the strip branch (where it has no referent) —
either produces axe-core violations.

### BR-02 -- Root element per branch is fixed

**Spec reference:** `banner.component.spec.md` §6, §9.
**Where enforced:** `banner.tsx` JSX literals.
**Rule:** `frame="none"` root is `<header>` (JSX literal); `frame="notched"`
root is `<Panel>` (component import from `@/shared/components/ui/panel`).
No polymorphism, no `as`/`asChild` API. No `role` attribute is written
by `Banner` itself.

### BR-03 -- Heading tag is chosen by `titleLevel` (1 / 2 / 3), constrained per branch

**Spec reference:** `banner.component.spec.md` §3, §9.
**Where enforced:** `banner.tsx` — module-scope const
`HEADING_TAG: Record<BannerTitleLevel, "h1" | "h2" | "h3"> = { 1: "h1", 2: "h2", 3: "h3" }`,
then `const As = HEADING_TAG[titleLevel ?? 1]`. In the notched branch,
the same `As` is used for the visible inner heading; the notched-border
heading level is set by `panelTitleLevelFor(titleLevel)` on `<Panel>`
(§4.4).
**Rule:** Never use `React.createElement` with a stringly-typed level;
the map ensures TS narrows the tag union.

### BR-04 -- Accessible name always comes from a single heading

**Spec reference:** `banner.component.spec.md` §9.
**Where enforced:**
- `frame="none"` — the inner `<h*>` is the sole heading; the `<header>`
  landmark derives its accessible name from the child heading per
  default landmark labelling. No `aria-label` and no `aria-labelledby`
  are written on `<header>` by `Banner`.
- `frame="notched"` — `Panel`'s heading is the sole AT-accessible
  heading; the visible inner `<h*>` is `aria-hidden="true"` (BR-06);
  `Banner` does **not** pass any `aria-labelledby` on `<Panel>` (Panel
  wires it internally). See §4.3.
**Rule:** There is never more than one heading per `Banner` instance in
the accessibility tree. QA gate: axe-core reports exactly one heading
inside the banner region for both branches.

### BR-05 -- `accent` is destructured and discarded when `frame="none"`

**Spec reference:** `banner.component.spec.md` §3.1 data contract.
**Where enforced:** `banner.tsx` — the destructure lists `accent` and
the strip branch never references it. No console warning is emitted
(the "silently ignored" behavior is the contract).
**Rule:** Do not conditionally forward `accent` onto the strip root or
onto any child of the strip branch. It only becomes meaningful when
passed to `<Panel>` in the notched branch.

### BR-06 -- Inner heading is `aria-hidden="true"` in `frame="notched"` mode (RESOLVES REVIEWER FLAG)

**Spec reference:** `banner.component.spec.md` §9; §3.1 data contract
("`title` doubles as the notched-border label AND as the visible
heading text"); Reviewer flag (§4.3 above).
**Where enforced:** `banner.tsx` notched branch — the JSX for the
visible large heading is `<As id={titleId} aria-hidden="true" …>{title}</As>`.
The `aria-hidden` is **unconditional** in this branch. No prop toggles it.
**Rule:** This is the single decision that resolves the "dual heading
AT visibility" issue. Removing `aria-hidden="true"` on the inner
heading — or making it conditional — is an automatic review reject.
The visible inner heading remains a *presentational duplicate* of the
notched heading; the accessibility tree contains only Panel's heading.
**Failure mode:** Without `aria-hidden`, screen readers announce the
heading twice, the AT heading outline lists two H* entries for one
logical heading, and it becomes ambiguous which one is the section's
accessible name.

### BR-07 -- `logo` receives `aria-hidden="true"` — always

**Spec reference:** `banner.component.spec.md` §3, §3.1 data contract, §9.
**Where enforced:** `banner.tsx` — both branches wrap `logo` in a
`<span aria-hidden="true">{logo}</span>` before the heading. The
wrapper `<span>` guarantees `aria-hidden` even when `logo` is a raw
emoji or text string (which cannot carry ARIA attributes by itself).
**Rule:** Never rely on the consumer to set `aria-hidden` on the logo
node. The wrapper is mandatory.

### BR-08 -- `action` slot is not part of the accessible name

**Spec reference:** `banner.component.spec.md` §3, §9.
**Where enforced:** `banner.tsx` — `action` renders inside an absolutely
positioned `<div>` sibling to the centered content column; it is
**not** referenced by any `aria-labelledby`. The `<div>` wrapper has
no ARIA role of its own.
**Rule:** Interactive elements inside `action` retain their own
semantics; the consumer supplies them. `Banner` does not restrict or
wrap the content.

### BR-09 -- `className` is merged via `cn()` on the root only

**Spec reference:** `banner.component.spec.md` §3.
**Where enforced:**
- `frame="none"` — `className={cn("relative flex …", "bg-surface border-b border-border px-4 py-6", className)}` on `<header>`.
- `frame="notched"` — `className={cn(className)}` on `<Panel>`. `Panel`
  merges it onto its own `<section>` root per `panel.back.md` BR-06.
**Rule:** No `className` is accepted for the subtitle, the action wrapper,
or the logo wrapper. Consumers who need to style children override with
`className` on the root and rely on Tailwind cascading, or use their
own composition.

### BR-10 -- The passthrough drops `title`

**Spec reference:** `banner.component.spec.md` §3 (last row).
**Where enforced:** the destructure `{ title, subtitle, action, logo, frame, accent, titleLevel, className, ...rest }` and JSX `{...rest}` on the root of each branch.
**Rule:** Because `BannerProps` `Omit`s `title` from `ComponentProps<"header">`,
the destructure cannot leak the HTML `title` attribute into `rest`.
Any refactor that switches to `props.title` (indexed access) breaks
this — reject in review.

### BR-11 -- No CVA declared in this component

**Spec reference:** `banner.component.spec.md` §6.
**Where enforced:** `banner.tsx` — must not import `cva` or
`VariantProps` from `class-variance-authority`; no `bannerVariants`
symbol is exported from `index.ts`.
**Rationale:** The Component Contract mandates CVA "only when there
are 2+ visual variants". `Banner`'s variant axis (`frame`) is a
render-tree switch, not a class variant; the second axis (`accent`) is
delegated to `Panel`. Introducing a local CVA would either duplicate
`panelVariants` or add a single-variant CVA — both forbidden.

### BR-12 -- No interactivity — ever

**Spec reference:** `banner.component.spec.md` §1, §5, §9.
**Where enforced:** `BannerProps` type (no `onClick`), `banner.tsx`
render (no `role="button"`, no `tabIndex`, no `onKeyDown`).
**Rule:** If a `role="button"` / `tabIndex` / event handler appears in
a diff on `Banner`'s own root, reject. Consumers who need interactivity
put an interactive node inside `action` (spec §1, Out of scope).

---

## 7. Storybook — Presentation and Component Tests

Per ADR-001, `Banner` ships with `banner.stories.tsx` and the stories
are its component tests via `@storybook/addon-vitest`. The developer
group must include at least these named exports, one per BDD scenario
in `banner.component.spec.md` §8 plus explicit a11y coverage of the
notched-mode decision (BR-06).

**Meta title:** `Layout/Banner` (spec §11).

| Story export | Covers spec BDD scenario | Additional a11y check |
|--------------|--------------------------|-----------------------|
| `Default` | "Default render (VISUAL VAULT strip)" — `title` + `subtitle`, no `action` | `getByRole("heading", { level: 1 })` resolves to `title`; `addon-a11y` axe pass; landmark accessible name equals `title` |
| `WithAction` | "With action slot" — `title` + `action={<Badge>Dashboard</Badge>}` | Badge stays in the accessibility tree; is **not** part of the banner's accessible name |
| `WithLogo` | Adds `logo` above the title | Logo is `aria-hidden` — accessible name equals `title` exactly, no logo text leakage |
| `Notched` | `frame="notched"`, `accent="info"`, `titleLevel=1` — validates the `Panel` delegation branch and the notched-border label | **Exactly one** heading in the accessibility tree (Panel's), at level `h2` (per §4.4 mapping); axe-core reports zero heading-order violations; the visible inner heading is present in the DOM with `aria-hidden="true"` |
| `NotchedHeadingLevel2` | `frame="notched"`, `titleLevel=2` | Notched heading resolves at `<h3>` per §4.4 mapping — validates the shift |
| `AllFrames` (optional) | Grid rendering both frame modes side by side for QA visual reference | Contrast check across phosphor + Dracula themes |

Stories run in Playwright browser mode — no JSDOM. `addon-a11y` is
enabled on every story (CLAUDE.md — Testing).

**Vitest/Vite pin.** Do **not** bump `vitest` or `vite` while adding
these stories (Gotcha #1 in CLAUDE.md).

---

## 8. Known Technical Constraints

1. **`Panel` is a hard runtime dependency of the notched branch.** If
   `Panel` ships incomplete (e.g., missing `aria-labelledby` wiring),
   the `Banner` a11y contract in §4.3 does not hold. QA gate:
   `panel.back.md` BR-01 must be verified before `Banner`'s Notched
   story passes axe.

2. **`Panel.titleLevel` API is upstream.** The `panelTitleLevelFor`
   helper (§4.4) assumes `PanelTitleLevel = 2 | 3 | 4`. A breaking
   change to `PanelProps` (renaming, narrowing, or removing that
   axis) breaks `Banner` at compile time — which is the desired
   behavior (surface the conflict, do not average it — CLAUDE.md
   Golden Rule 7).

3. **`useId()` in the strip branch.** The strip branch does not need
   `useId()` — the `<header>` landmark labels itself from the child
   heading. Do not call `useId()` in that branch (unnecessary
   allocation, and calling hooks in only one branch would violate the
   Rules of Hooks). Solution: the `useId()` call is placed at the top
   of the component body **unconditionally** (Rules of Hooks) but its
   returned id is only *used* in the notched branch. This is the
   Rules-of-Hooks-safe pattern; the small runtime cost is accepted.

4. **`tailwind-merge` custom-class awareness.** `Banner`'s strip
   branch composes `bg-surface`, `border-b`, `border-border`,
   `text-foreground`, `text-muted-foreground`. Verify that
   `extendTailwindMerge` in `@/shared/lib/cn` recognizes these as
   members of the correct groups. If a consumer passes
   `className="border-b-0"` to remove the strip's bottom rule, `cn()`
   must resolve the conflict — otherwise the class is doubled and
   declaration order decides. See `panel.back.md` Constraint 2.

5. **Two-namespace border trap** — Gotcha #2 (CLAUDE.md). The strip
   uses `border-b` (WIDTH) + `border-border` (COLOR). Any class that
   mixes namespaces on the strip silently drops the bottom rule.
   Automated grep in CI: `grep -E "border-b-\[\s*[0-9]+px" banner.tsx`
   must be empty.

6. **Absolute-positioning host for `action`.** In the strip branch,
   `<header>` gets `relative` in the base class so `action`'s
   `absolute right-4 top-4` anchors correctly. In the notched branch,
   `<Panel>` already has `relative` (see `panel.back.md` §4.1) — no
   extra positioning class is needed on `Banner`'s side.

7. **No `React.memo`.** The render body has no expensive computations
   and no reference-identity-sensitive props (no callback props of
   `Banner`'s own). Premature memoization is forbidden by Golden Rule
   2 (Simplicity First).

8. **Landmark caveat carried from spec.** `frame="notched"` produces
   a `<section>`, not a `<header>` — the native banner landmark
   semantic is **not** provided by `Banner` in that branch. Consumers
   who need `role="banner"` unconditionally must pass it via the
   passthrough (the `{...rest}` on `<Panel>`). This is documented in
   `banner.component.spec.md` §9 and is intentional.

---

## 9. Data Model / State Machine / Domain Events / External Integrations

**All N/A** — for the same reasons as `stat-panel.back.md` §2/4/5/6:

- **§9.1 Data Model** — `Banner` is a stateless UI primitive with no
  persistence layer. The "data" it renders is passed at composition
  site by the consumer (`title`, `subtitle`, `action`, `logo`,
  `frame`, `accent`, `titleLevel`). There is no domain entity, no
  table, no migration.
- **§9.2 State Machine** — `Banner` has no state axis (`banner.component.spec.md` §4).
  It is a pure render function of its props.
- **§9.3 Domain Events** — `Banner` emits no callbacks
  (`banner.component.spec.md` §5). Events fired by children rendered
  into `action` (e.g., a button's `onClick`) are the consumer's
  responsibility and do not surface on the `Banner` API.
- **§9.4 External Integrations** — no HTTP, no WebSocket, no worker,
  no i18n runtime (project is pt-BR, single owner — strings are
  literal in stories). Internal integration with `Panel` is documented
  in §10.

---

## 10. Internal Integrations (UI-Kit Dependencies)

| Consumed symbol | Source module | Purpose | Coupling |
|-----------------|---------------|---------|----------|
| `Panel` (component) | `@/shared/components/ui/panel` | Renders the frame, notched title, border color, `aria-labelledby` in the `frame="notched"` branch | **Hard runtime dependency** — the notched branch is a composition |
| `PanelProps` (type) | `@/shared/components/ui/panel` | Not consumed directly by `BannerProps` — `Banner` has its own `BannerAccent` / `BannerTitleLevel` and maps to Panel's shapes at render time (§4.4) | **Soft dependency** — a Panel API break trips the compile in `panel.tsx` first; `Banner` sees it via the helper in §4.4 |
| `cn` (function) | `@/shared/lib/cn` | Merges consumer `className` on the strip branch root; passed through unchanged on the notched branch (BR-09) | Standard |
| `useId` (hook) | `react` | Generates the reserved DOM `id` for the visible inner heading in the notched branch (§4.3) | Standard |

**No imports from any sibling feature.** `Banner` lives under
`shared/components/ui/`, and its only cross-cutting import source is
`shared/` itself (per CLAUDE.md architecture rule).

**No import of icon libraries.** `Banner` never renders an icon on its
own; the `logo` prop is a `ReactNode` supplied by the consumer.
`lucide-react` imports live at the consumer site.

---

## 11. Out of Scope (implementation)

- **Backend / API layer** — this is a UI Kit project (CLAUDE.md ADR-002);
  no `features/{feature}/api/`, no MSW handlers, no TanStack Query hook.
- **State management** — no Zustand slice; no `useState`, `useReducer`,
  `useEffect`. Only `useId()` (Rules-of-Hooks-safe, unconditional call
  at the top of the body — §8 Constraint 3).
- **Sticky positioning** — the parent layout owns `sticky top-0`; not
  a `Banner` concern (spec §1).
- **Interactive root** — no `onClick`/`role="button"`/keyboard activation
  on `<Banner>` itself (spec §1, spec §9).
- **Nav / breadcrumbs** — spec §1 explicitly out of scope; consumers
  render `Breadcrumb` above/beside `Banner`.
- **Full-page hero images / gradients** — spec §1 out of scope;
  `Banner` uses `bg-surface` uniformly.
- **`Badge` primitive** — the `action` slot renders a consumer-supplied
  node. The known gap on a shared `Badge` primitive is tracked in
  `docs/specs/decisions.md`, not here.
- **i18n runtime** — CLAUDE.md declares `i18n: false`. Story strings
  and any consumer strings are literal in pt-BR.
- **Cross-branch class blending** — never model `frame` as a CVA axis;
  the two branches are disjoint (BR-01).

---

## 12. Implementation Acceptance Checklist

For the FE Developer implementing this component. All items are gates.

- [ ] Four files created under `frontend/src/shared/components/ui/banner/`:
      `banner.tsx`, `banner.types.ts`, `index.ts`, `banner.stories.tsx`.
- [ ] `BannerProps` `Omit`s `title` from `ComponentProps<"header">`.
- [ ] Passing `children` to `<Banner>` is a TypeScript error — the
      shape does not accept it (verified by `npx tsc --noEmit`; note
      `Banner` currently has no `children` prop at all, and none should
      be added).
- [ ] `banner.tsx` does **not** import `cva` or `VariantProps`
      (BR-11).
- [ ] The `frame="none"` root is `<header>`; the `frame="notched"` root
      is `<Panel>` (BR-02).
- [ ] Heading dispatch uses the module-scope `HEADING_TAG` map
      (BR-03); no `React.createElement` with stringly-typed level.
- [ ] The notched-branch inner `<h*>` renders with `aria-hidden="true"`
      **unconditionally** (BR-06) — resolves the reviewer's dual-heading
      flag.
- [ ] `Banner` does **not** write any `aria-labelledby` attribute on
      the notched root; `Panel` owns that wiring (§4.3, BR-04).
- [ ] `panelTitleLevelFor` helper is a total function over
      `BannerTitleLevel`, defined at module scope (§4.4).
- [ ] `logo`, when present, is wrapped in `<span aria-hidden="true">`
      in both branches (BR-07).
- [ ] `className` is forwarded to the root of the chosen branch,
      never to a child wrapper (BR-09).
- [ ] `...rest` is spread on the root of the chosen branch, never on
      the inner content wrapper (BR-10).
- [ ] `ref` is a normal prop (React 19) — no `forwardRef`.
- [ ] `index.ts` exports only `Banner` (value) and the four public
      types listed in §2. No `bannerVariants` symbol.
- [ ] All `banner.component.spec.md` §8 BDD scenarios pass as
      Storybook component tests (see §7).
- [ ] Axe-core reports **exactly one** heading in the accessibility
      tree inside the `Banner` region for both frames (BR-04, BR-06).
- [ ] Grep CI check: `grep -E "border-b-\[\s*[0-9]+px" banner.tsx`
      returns nothing (Gotcha #2).

---

## Changelog

> Mandatory — never remove previous entries.

| Version | Date | Author | Type | Description | CR |
|---------|------|--------|------|-------------|----|
| 1.0.0 | 2026-07-14 | Back Spec Agent | initial | Initial implementation spec for `Banner`: four-file layout, no CVA (frame axis drives disjoint render trees, accent delegated to Panel), typed `Omit<ComponentProps<"header">, "title">` public props, module-scope `HEADING_TAG` and `panelTitleLevelFor` helpers, twelve implementation invariants (BR-01…BR-12) mapped to the component spec. Locks down the reviewer-flagged a11y contract in `frame="notched"` mode: the notched heading owned by `Panel` is the sole AT-accessible heading; the visible inner `<h*>` is `aria-hidden="true"` unconditionally in the notched branch; `Banner` never writes `aria-labelledby` on the notched root (Panel owns it). Sections 9.1/9.2/9.3/9.4 marked N/A because this is a pure frontend UI-kit primitive with no backend, no state, no events, and no external integrations | -- |
