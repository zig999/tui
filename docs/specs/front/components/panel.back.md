# Panel -- Implementation Spec (Front-end technical)

> Stack: React 19 + TypeScript 5 (strict) + Tailwind v4 (CSS-first `@theme`) + CVA | UI Kit: `frontend/` (autonomous package) | Version: 1.0.0 | Status: draft | Layer: permanent
> Business spec: `panel.component.spec.md`

> This is a UI Kit project — there is **no backend**. This document
> replaces the classic back-end spec with the **implementation technical
> spec** the `u-fe-developer` group must follow when writing the
> `Panel` primitive. It records every code-level decision (file layout,
> types, CVA configuration, token bindings, id-generation) so that the
> implementation phase does not re-derive them from the component spec.

---

## 1. Stack and Patterns

> Only aspects that differ from or extend `CLAUDE.md` are called out.
> Everything else = "CLAUDE.md default".

| Aspect | Value | Note |
|--------|-------|------|
| Framework | React 19 (`ref` as normal prop; **never** `forwardRef`) | CLAUDE.md default |
| Language | TypeScript 5 strict | CLAUDE.md default |
| Styling | Tailwind v4 CSS-first `@theme` in `frontend/src/theme.css` | CLAUDE.md default |
| Class merge | `cn()` from `@/shared/lib/cn` (tailwind-merge + clsx) | CLAUDE.md default — **never** string concatenation |
| Variant system | `class-variance-authority` (CVA) — module scope declaration | CLAUDE.md default; the Component Contract mandates 2+ variants → CVA; `Panel` has 6 accent variants so CVA is required |
| ID generation | React 19 `useId()` for the `<h*>` id linked by `aria-labelledby` | Stable across SSR/CSR (no `useState` seed, no `Math.random()`) |
| State management | **None** — no `useState` / `useReducer` / `useEffect` in `Panel` | Pure render function (see `panel.component.spec.md` §4) |
| Data layer | **None** — `Panel` is a pure presentational primitive; no TanStack Query hooks, no MSW handlers | Component Contract |
| Package boundary | Ships from `@/shared/components/ui/panel` — one of the sanctioned per-component barrels (see CLAUDE.md — Component Contract) | Consumed by `StatPanel` and `Banner` compositions in the same `shared/components/ui/` tree |

---

## 2. File Layout

> The Component Contract prescribes exactly three files per component
> plus the per-component `index.ts` barrel (the sanctioned exception to
> the no-barrel rule). Stories live alongside — mandatory per ADR-001.

| File | Purpose |
|------|---------|
| `frontend/src/shared/components/ui/panel/panel.tsx` | Component + `panelVariants` (CVA) — module-scope declaration |
| `frontend/src/shared/components/ui/panel/panel.types.ts` | `PanelProps`, `PanelAccent`, `PanelTitleLevel` — no runtime code |
| `frontend/src/shared/components/ui/panel/index.ts` | Barrel: re-exports `Panel`, `panelVariants`, and the public types |
| `frontend/src/shared/components/ui/panel/panel.stories.tsx` | Storybook stories (canonical presentation + component tests via `addon-vitest`) — see §7 |

Additional required files at implementation time:

- **Update** `frontend/src/theme.css` to register `--color-accent-alt`
  under `@theme` (see §5 — Token Prerequisites).
- **No** `index.ts` at any parent level (`ui/`, `components/`) — the
  no-barrel rule applies to every level above the per-component folder.

---

## 3. TypeScript Type Decisions

### 3.1 Public types (`panel.types.ts`)

```
PanelAccent      = "default" | "success" | "info" | "warning" | "danger" | "alt"
PanelTitleLevel  = 2 | 3 | 4

PanelProps       = Omit<ComponentProps<"section">, "title">
                 & VariantProps<typeof panelVariants>   // -> accent axis only
                 & {
                     title: string;                  // required
                     icon?: ReactNode;
                     titleLevel?: PanelTitleLevel;   // default 3 (in render)
                     className?: string;
                     children?: ReactNode;
                   }
```

**Rationale:**

- `title` is typed as `string` (**not** `ReactNode`) because it must
  populate a heading element **and** be the accessible name via
  `aria-labelledby` (spec §9). Allowing `ReactNode` would let consumers
  smuggle interactive elements into the heading — forbidden by spec §1
  (the panel itself is non-interactive) and complicating the accessible
  name computation.
- `ComponentProps<"section">` **must be `Omit`d on `title`** — the
  native HTML `title` attribute (tooltip) collides with our
  domain-specific `title` prop. Without `Omit`, TS accepts both meanings
  and the component's `title` is coerced to `string | undefined` from
  the DOM attribute typing, breaking the required-prop contract. This
  is the single Omit noted in spec §3.
- `icon` is `ReactNode` (not `LucideIcon`) — spec §3 explicitly allows
  emoji strings alongside lucide icons; sizing is the consumer's
  responsibility. No prop-level shape is enforced.
- `titleLevel` is a **literal-union** (`2 | 3 | 4`), not `number`. This
  makes the `As` heading dispatch (§4) exhaustively type-checked.
- `VariantProps<typeof panelVariants>` is spread in **from** the CVA
  declaration so that adding/removing an accent updates the prop types
  in one place. Do **not** duplicate the accent union in `PanelProps`.

### 3.2 Internal types (module-local in `panel.tsx`)

None. The heading-tag lookup (§4) is a `const` map typed by
`Record<PanelTitleLevel, "h2" | "h3" | "h4">`. Kept out of
`panel.types.ts` because it is not part of the public API.

---

## 4. CVA Configuration

### 4.1 Declaration (module scope, top of `panel.tsx`)

```
panelVariants = cva(
  "relative border bg-surface",           // BASE — unconditional
  {
    variants: {
      accent: {
        default: "border-border",
        success: "border-success",
        info:    "border-info",
        warning: "border-warning",
        danger:  "border-destructive",
        alt:     "border-accent-alt",
      },
    },
    defaultVariants: { accent: "default" },
  },
)
```

**Base class breakdown (exact tokens):**

| Class | Token | Reason |
|-------|-------|--------|
| `relative` | — | Establishes a positioning context for the title's `-mt-[0.6em]` overlap (the notch offset). |
| `border` | `--border-DEFAULT: 1px` (WIDTH namespace) | Draws all four sides at 1px. **Never** use `border-2` — the base is fixed 1px (spec §6). |
| `bg-surface` | `--color-surface` (COLOR namespace) | The title's own `bg-surface` overlays the top rule to produce the notch (§5.2). If `Panel` used a different bg, the mask would fail. |

**Accent axis:** only the **border COLOR** namespace is switched.
Never touch `--border-*` from the accent variant — Gotcha #2 (spec §6):
mixing width + color namespaces silently drops the border.

### 4.2 Non-CVA class composition (in the render body)

The **title heading** is **not** part of the CVA — its accent color is
selected via a plain `Record<PanelAccent, string>` map defined at
module scope:

```
TITLE_ACCENT_CLASS: Record<PanelAccent, string> = {
  default: "text-foreground",
  success: "text-success",
  info:    "text-info",
  warning: "text-warning",
  danger:  "text-destructive",
  alt:     "text-accent-alt",
}
```

**Rationale for splitting the title color out of `panelVariants`:** CVA
resolves a single class string on the root element; the title's classes
are applied to a **child** node. Duplicating the accent axis inside
CVA would produce dead classes on the root. A separate map keeps the
render body free of `switch`/ternary chains and stays type-safe via the
`Record<PanelAccent, string>` contract.

### 4.3 CVA anti-patterns to reject in review

- Declaring `cva()` inside the render body — Component Contract violation.
- Adding a `border-l-2 border-<intent>` variant — that is the `Card`
  identity (`tone="data"`), not `Panel`.
- Adding a `padding` axis — spec §6 explicitly forbids density variants
  on the base primitive; consumers override with their own `className`.

---

## 5. Token Bindings

### 5.1 Prerequisite — register `--color-accent-alt`

The spec's `accent="alt"` variant depends on `--color-accent-alt`,
which is documented in `docs/specs/front/design-system/tokens.md` but
**not yet declared in `frontend/src/theme.css`**. Registration is a
blocking prerequisite for the developer group.

**Required edit — `frontend/src/theme.css` under `@theme` (phosphor theme):**

- `--color-accent-alt: #ff66cc;` (magenta/roxo phosphor)

**Required edit — Terminal.css / Dracula override (`[data-theme="default"]`):**

- `--color-accent-alt: #ff79c6;` (Dracula pink)

Both values are taken verbatim from `docs/specs/front/design-system/tokens.md`
line 62 — no reinterpretation.

**Contrast check.** Both values must clear WCAG 2.2 AA (spec §9)
against `bg-surface` (phosphor: `var(--color-term-bg-2)`; Dracula:
`#000000`). This is the QA group's responsibility to verify — the
implementation task closes only after both themes pass.

### 5.2 Token-to-class mapping (single source of truth)

| Concern | Class(es) | Token(s) consumed | Namespace |
|---------|-----------|-------------------|-----------|
| Frame background | `bg-surface` | `--color-surface` | COLOR |
| Frame border color (per accent) | `border-border` / `border-success` / `border-info` / `border-warning` / `border-destructive` / `border-accent-alt` | `--color-border-*` | COLOR (`--color-border-*`) |
| Frame border width | `border` (1px) | `--border-DEFAULT` | WIDTH (`--border-*`) |
| Title accent color | `text-foreground` / `text-success` / `text-info` / `text-warning` / `text-destructive` / `text-accent-alt` | `--color-foreground`, `--color-success`, `--color-info`, `--color-warning`, `--color-destructive`, `--color-accent-alt` | COLOR |
| Title mask (the notch) | `bg-surface px-2 -mt-[0.6em]` | `--color-surface` | COLOR |
| Body padding | `p-4` | Tailwind spacing scale (default `1rem`) | — |
| Title spacing/typography | `text-xs font-semibold uppercase tracking-widest` | — | — (typography scale) |

**Never** hardcode any raw value (Component Contract). If a `#hex`,
`rgb(...)`, or `px` literal appears in `panel.tsx` outside the
`-mt-[0.6em]` arbitrary value (documented notch offset), the review
group must reject.

### 5.3 Notch offset — `-mt-[0.6em]`

The negative margin that pulls the title up over the top rule is
declared as an **arbitrary value** in Tailwind (`-mt-[0.6em]`) because
`0.6em` is intentionally line-height-relative — the notch must remain
correctly aligned when consumers override the heading font size
(via `className`). Using a named spacing token here would break that
proportionality.

The value `0.6em` is a **documented magic number**: enough to overlap
the 1px border by roughly the heading's half-height while leaving the
text baseline readable. Any change requires a spec revision (§6 of
`panel.component.spec.md`).

---

## 6. Implementation Rules (BR-nn, mapped to spec)

> No back-end business rules exist for a UI Kit primitive. What follows
> are the **implementation invariants** the developer group must
> enforce. Each rule references a spec section for traceability — the
> `u-fe-qa` phase will verify each one via a Storybook story.

### BR-01 -- Title is always rendered inside a heading element with a stable id

**Spec reference:** `panel.component.spec.md` §9 (Accessibility Contract, "Label").
**Where enforced:** `panel.tsx` render body.
**Rule:** Every render generates one id via `useId()` and passes it
both as `<section aria-labelledby={id}>` and as `<h* id={id}>`. The id
is **not** derived from `title` (screens with repeated titles must
still yield unique ids) and **not** stored in state (SSR/CSR stability).
**Failure mode:** if the id is missing on either side, the accessible
name is empty and axe-core flags the section.

### BR-02 -- Heading tag is chosen by `titleLevel` (2 / 3 / 4)

**Spec reference:** `panel.component.spec.md` §3, §9 (heading level override BDD).
**Where enforced:** `panel.tsx` — const map `HEADING_TAG: Record<PanelTitleLevel, "h2" | "h3" | "h4"> = { 2: "h2", 3: "h3", 4: "h4" }`, then `const As = HEADING_TAG[titleLevel ?? 3]` and `<As id={titleId} className={...}>...</As>`.
**Rule:** Never use `React.createElement` with a stringly-typed level; the map ensures TS narrows the tag union. Never accept levels outside `2 | 3 | 4` — the prop type forbids it, and no runtime coercion is added.

### BR-03 -- Icon receives `aria-hidden="true"` — always

**Spec reference:** `panel.component.spec.md` §9, §3.1 data-contract row.
**Where enforced:** `panel.tsx` — the icon is rendered inside a wrapper `<span aria-hidden="true" className="inline-flex items-center mr-2">{icon}</span>` **before** the title text node.
**Rule:** The wrapper `<span>` guarantees `aria-hidden="true"` even
when the consumer passes a raw emoji string (which cannot itself carry
ARIA attributes). Never depend on the consumer to set `aria-hidden` on
their icon.

### BR-04 -- Root is a `<section>`, never a `<div>`, never a `<header>`

**Spec reference:** `panel.component.spec.md` §1, §3.
**Where enforced:** `panel.tsx` JSX.
**Rule:** The `{...props}` passthrough is typed via
`Omit<ComponentProps<"section">, "title">`; the JSX literal is
`<section>` — no polymorphism, no `as`/`asChild` API.
**Failure mode:** using `<div>` breaks the "labelled section" identity
and forces consumers to add `role="region"` themselves.

### BR-05 -- CVA declaration lives at module scope

**Spec reference:** `panel.component.spec.md` §6; Component Contract in `CLAUDE.md`.
**Where enforced:** top of `panel.tsx`, above the `export function Panel`.
**Rule:** `panelVariants` is a top-level `export const`. Re-declaring
inside the render body triggers unnecessary re-computation and is a
Component Contract violation — automatic review rejection.

### BR-06 -- `className` is merged via `cn()` on the root only

**Spec reference:** `panel.component.spec.md` §3.
**Where enforced:** `panel.tsx` — `className={cn(panelVariants({ accent }), className)}` on the `<section>`.
**Rule:** No `className` is accepted for the title or the body. Consumers who need to style children override with `className` on the root and rely on Tailwind cascading, or compose their own body via `children`. This keeps the notched-title layout stable.

### BR-07 -- The passthrough drops `title`

**Spec reference:** `panel.component.spec.md` §3 (last row).
**Where enforced:** the destructure `{ title, icon, accent, titleLevel, className, children, ...rest }` and JSX `{...rest}`.
**Rule:** Because `PanelProps` `Omit`s `title` from `ComponentProps<"section">`, the destructure cannot leak the HTML `title` attribute into `rest`. Any refactor that switches to `props.title` (indexed access) breaks this — reject in review.

### BR-08 -- No `border-2` / no `border-l-2`

**Spec reference:** `panel.component.spec.md` §6.
**Where enforced:** review — code search over `panel.tsx`.
**Rule:** Width stays at `border` (`1px`); the accent axis colors all four sides, never one. Left-only accent is the `Card` (`tone="data"`) identity.

### BR-09 -- No interactivity — ever

**Spec reference:** `panel.component.spec.md` §1, §9.
**Where enforced:** `PanelProps` type (no `onClick`), `panel.tsx` render (no `role`, no `tabIndex`, no `onKeyDown`).
**Rule:** If a `role="button"` / `tabIndex` / event handler appears in a diff, reject. Consumers who need interactivity wrap `<Panel>` around a `<button>` / `<Link>` at the call site (spec §1, Out of scope).

---

## 7. Storybook — Presentation and Component Tests

Per **ADR-001**, `Panel` ships with `panel.stories.tsx` and the stories
are its component tests via `@storybook/addon-vitest`. The developer
group must include at least these named exports, one per BDD scenario
in `panel.component.spec.md` §8:

| Story export | Covers spec BDD scenario | Additional a11y check |
|--------------|--------------------------|-----------------------|
| `Default` | "Default render" (title only, `accent="default"`) | `addon-a11y` axe pass |
| `AccentAlt` | "Accent — alt (VISUAL VAULT Media Types tile)" | Contrast check in phosphor + Dracula |
| `WithIcon` | "aria-labelledby wiring" (icon + title) | Accessible name equals title text exactly (no icon leakage) |
| `HeadingLevelH2` | "Heading level override" (`titleLevel={2}`) | `getByRole("heading", { level: 2 })` resolves |
| `AllAccents` | Grid rendering the six accents side by side | Visual reference; QA parity across themes |

Stories run in Playwright browser mode — no JSDOM. `addon-a11y` is
enabled on every story (CLAUDE.md — Testing).

**Vitest/Vite pin.** Do **not** bump `vitest` or `vite` while adding
these stories (Gotcha #1 in CLAUDE.md).

---

## 8. External Integrations

None. `Panel` is a pure presentational primitive. No HTTP, no
WebSocket, no worker, no i18n runtime (project is pt-BR, single owner —
strings are literal in stories).

---

## 9. Known Technical Constraints

1. **Prerequisite token registration.** `--color-accent-alt` must be
   added to `theme.css` **before** the `accent="alt"` variant renders
   correctly. If the developer skips this step, `border-accent-alt` and
   `text-accent-alt` resolve to `unset` and the tile renders with no
   visible frame color (silent failure — no build error). See §5.1.
2. **`tailwind-merge` custom-class awareness.** `border-accent-alt` and
   `text-accent-alt` are custom classes. The shared `cn()` uses
   `extendTailwindMerge` (CLAUDE.md — shadcn/ui rules) which must know
   about the `border-color` and `text-color` groups. If a consumer
   passes `className="border-accent-alt"` **overriding** an accent-driven
   border, `cn()` must recognize the conflict — verify the current
   `cn.ts` `extendTailwindMerge` configuration before shipping. If it
   does not, the accent border is doubled and one wins by declaration
   order (fragile).
3. **`useId()` values are opaque.** They contain `:` characters in
   React 18+ (`:r0:`). This is a valid HTML `id` in HTML5 but breaks
   CSS attribute selectors like `#\:r0\:`. Do not attempt to select the
   heading by id in CSS — style via class.
4. **`-mt-[0.6em]` is a documented magic number** (§5.3). Any
   substitution requires spec revision.
5. **Two-namespace border trap** — Gotcha #2 (CLAUDE.md). The
   implementation uses `border` (WIDTH) + `border-<intent>` (COLOR). Any
   class that mixes namespaces silently drops the border. Automated
   grep in CI: `grep -E "border-\[\s*[0-9]+px" panel.tsx` must be empty.

---

## 10. Out of Scope (implementation)

- **Backend / API layer** — this is a UI Kit project (CLAUDE.md ADR-002); no `features/{feature}/api/`, no MSW handlers, no TanStack Query hook.
- **State management** — no Zustand slice; no `useState`, `useReducer`, `useEffect` (spec §4).
- **Collapsible / expand behavior** — spec §1 explicitly out of scope.
- **Interactive root** — no `onClick`/`role="button"`/keyboard activation on `<Panel>` itself (spec §1).
- **Density variants** — no `padding` axis on CVA (spec §6); consumers override via `className`.
- **Nested-panel border sharing** — layout concern for consumers (spec §1).
- **i18n runtime** — CLAUDE.md declares `i18n: false`. `title` and `caption`-style strings are literal in the consumer code.
- **`TrendStatPanel` / `CollapsiblePanel`** — future compositions, not covered here (spec §1).

---

## Changelog

> Mandatory — never remove previous entries.

| Version | Date | Author | Type | Description | CR |
|---------|------|--------|------|-------------|----|
| 1.0.0 | 2026-07-14 | Back Spec Agent | initial | Initial implementation spec for the `Panel` primitive — file layout, CVA config, token bindings (including the `--color-accent-alt` prerequisite), implementation invariants (BR-01…BR-09) mapped to the component spec, and the required Storybook story matrix per ADR-001 | -- |
