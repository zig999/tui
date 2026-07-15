# Design System Tokens — Implementation Spec

> Companion to `docs/specs/front/design-system/tokens.md`.
> Scope: **frontend only** — this UI Kit has no backend. The "back" suffix
> in the filename denotes *implementation spec* in the SDD pipeline; there
> is no server, database, or API surface involved.
> Target file: `frontend/src/theme.css` — no other file is touched.

---

## 1. Scope and non-goals

### 1.1 In scope

- Introduce the semantic token **`--color-accent-alt`** to both themes:
  - Phosphor (default `@theme` block): `#ff66cc` (neon magenta on CRT-green field).
  - Default / Dracula (`:root[data-theme="default"]`): `#ff79c6` (Dracula pink).
- Keep the change surgical: **only** `frontend/src/theme.css` is modified.
- Preserve the existing token layering rule
  `base → semantic → component` (per `CLAUDE.md → Tailwind CSS v4`).

### 1.2 Out of scope (do NOT touch in this task)

- No changes to any component file under
  `frontend/src/shared/components/**` or `frontend/src/features/**`.
- No CVA edits, no story updates, no new components.
- No new base tokens (`--color-term-*`) — the phosphor value is written
  literally on the semantic token, matching the treatment of
  `--color-term-border` peers when a base counterpart is not warranted.
  Rationale: `accent-alt` is single-use (magenta only), so promoting it to
  a base `--color-term-magenta` would add a token nobody else references.
- No radius, spacing, typography, or container-scale changes.
- No `tailwind.config.ts` — Tailwind v4 CSS-first only.
- No `--border-*` (width) namespace touches (Gotcha #2 stays intact).

---

## 2. Exact CSS changes to `frontend/src/theme.css`

Two edits, both additive. Do not remove or rename any existing token.

### 2.1 Phosphor theme — inside `@theme { … }`

Insert `--color-accent-alt` inside the **§ 1.4 Intent** cluster of semantic
tokens, immediately after the existing intent accents
(`--color-info`, `--color-success`) and before the primary interaction
states. The literal color `#ff66cc` is written directly on the semantic
token — no new `--color-term-*` base entry is added (see §1.2 rationale).

```css
/* intent accents (info/success reuse the phosphor scale) */
--color-info: var(--color-term-cyan);
--color-success: var(--color-term-green);
--color-accent-alt: #ff66cc; /* NEW — magenta phosphor, orthogonal to info/success/warning/danger */
```

Placement rules:
- Must appear **inside** the `@theme { … }` block so Tailwind v4 exposes
  the utility `bg-accent-alt` / `text-accent-alt` / `border-accent-alt`
  (color namespace) automatically.
- Must appear **after** the four existing intent tokens
  (`--color-info`, `--color-success`, `--color-warning`,
  `--color-destructive`) — grouped by purpose, not alphabetically, to
  match the file's existing layout.

### 2.2 Default (Dracula) theme — inside `:root[data-theme="default"] { … }`

Add the same token with the theme-appropriate value. Placement mirrors the
phosphor block: after `--color-info` / `--color-success`, before
`--color-border`.

```css
--color-info: #bd93f9; /* blue/purple */
--color-success: #50fa7b; /* green */
--color-accent-alt: #ff79c6; /* NEW — Dracula pink */
```

### 2.3 Both edits — same commit

The spec's §1 rule is explicit: every color token must be defined **in
both themes in the same commit**, or the `default` theme silently falls
back to the phosphor value and the two themes diverge. Do not split §2.1
and §2.2 across commits.

---

## 3. Naming convention — why `--color-accent-alt`

- **Prefix `--color-`** — required by Tailwind v4's `@theme` contract so
  Tailwind generates the `bg-*` / `text-*` / `border-*` utilities from
  the token. Do not use a namespace-less name like `--accent-alt`.
- **Semantic name `accent-alt`** — the raw color is a *theme concern*:
  neon magenta under phosphor, Dracula pink under `default`. A raw name
  like `--color-magenta` or `--color-pink` would lie in one of the two
  themes.
- **No suffix collision** — `accent-alt` is orthogonal to `--color-accent`
  (which is bright phosphor / heading color). It is *not* a variant of
  `--color-accent`; the shared prefix is coincidental. Do not derive
  `--color-accent-alt` via `var(--color-accent)` — the two tokens are
  independent by design.

---

## 4. Constraints and invariants

| # | Invariant | Consequence if violated |
|---|-----------|-------------------------|
| C1 | Token declared **inside** `@theme` for phosphor and **inside** `:root[data-theme="default"]` for Dracula | Missing utility class / silent theme fallback |
| C2 | Semantic token references *raw hex* directly (no new base token) | N/A — a new base would add an unreferenced `--color-term-*` |
| C3 | Only `frontend/src/theme.css` is modified | Any other file diff violates the surgical-change rule |
| C4 | Border **color** namespace only (`--color-*`) — never `--border-*` | Gotcha #2: mixing the two silently drops the border for downstream consumers |
| C5 | No `@utility` rule added for the new color | Not needed — Tailwind v4 auto-generates utilities from `@theme` |
| C6 | Radius stays `0`; typography, container scale, border width untouched | Any drift breaks the CRT identity |
| C7 | WCAG 2.2 AA contrast verified by QA against `--color-background` and `--color-surface` in both themes | Documented in QA phase, not here |

---

## 5. Generated Tailwind utilities (expected)

Adding `--color-accent-alt` inside `@theme` yields (Tailwind v4 auto-generation):

- `bg-accent-alt`
- `text-accent-alt`
- `border-accent-alt` (color; width still uses `--border-*`)
- `ring-accent-alt`
- `fill-accent-alt`, `stroke-accent-alt`
- `from-accent-alt` / `via-accent-alt` / `to-accent-alt`
- Opacity modifiers: `bg-accent-alt/10`, `text-accent-alt/70`, etc.

Downstream component work (out of scope here — separate tasks for
`Panel`, `StatPanel`, `Banner`) will consume these utilities via
`cn()`. This spec does not enumerate those component edits.

---

## 6. Verification

Run **after** the edit, from `frontend/`:

1. `npm run dev` — inspect any story that uses `bg-accent-alt`; the class
   must resolve (DevTools → computed background-color).
2. `<html data-theme="default">` in the Storybook toolbar (or via
   DevTools) — the same element must now render Dracula pink (`#ff79c6`).
3. `npx tsc --noEmit` — must remain clean (no TS impact expected; sanity
   check that no unrelated file was touched).
4. `npm run build` — must succeed; a failure indicates an unclosed brace
   or stray character in `theme.css`.

No unit test is added at this layer — tokens are validated by consumer
component stories in their respective `.stories.tsx` files (added in the
downstream component tasks).

---

## 7. Rollback

Single-file, additive edit — rollback is `git checkout -- frontend/src/theme.css`.
No migrations, no cache invalidation, no coordinated deploy.

---

## Changelog

| Version | Date | Author | Type | Description | CR |
|---------|------|--------|------|-------------|----|
| 1.0.0 | 2026-07-14 | u-spec-back | initial | Implementation spec for `--color-accent-alt` (phosphor `#ff66cc` + Dracula `#ff79c6`). Two additive edits to `frontend/src/theme.css`; no other file touched. Consumers (`Panel`, `StatPanel`, `Banner`) will be updated in separate tasks. | -- |
