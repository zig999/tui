# CLAUDE.md — UI Kit

## Project

### Description

**UI Kit** is an autonomous frontend package that produces the project's standardized, reusable user-interface components, presented and validated through Storybook.

#### Problem solved

Without a single shared UI layer, every screen reinvents its own buttons, inputs, cards and layouts — producing visual drift, inconsistent behavior, accessibility gaps, and duplicated logic that no one owns. This package centralizes the design tokens, the component contract, and the presentation surface so that every component has one canonical implementation and one canonical way to be seen. Storybook is that surface: each component is documented as stories, and those stories double as browser-level component tests.

#### Core concepts

- **Standardized component** — a single exported UI unit that obeys the Component Contract (semantic tokens only, `cn()` merge, `ref` as prop). The atomic deliverable of this package.
- **Semantic token** — the only permitted source of visual values (color, spacing, radius, border). Components never reference raw values.
- **Story** — a Storybook entry that is simultaneously the component's living documentation and its component test. `addon-vitest` runs stories as tests in a real browser via Playwright.
- **Feature** — a `features/{feature}/` folder that groups the `api/`, `components/`, `hooks/` and `types.ts` for one cohesive area. Features never import from sibling features.

---

## Golden Rules

These rules apply to every task in this project unless explicitly overridden.
Bias: caution over speed on non-trivial work. Use judgment on trivial tasks.

**Rule 1 — Think Before Coding**
State assumptions explicitly. If uncertain, ask rather than guess.
Present multiple interpretations when ambiguity exists.
Push back when a simpler approach exists.
Stop when confused. Name what's unclear.

**Rule 2 — Simplicity First**
Minimum code that solves the problem. Nothing speculative.
No features beyond what was asked. No abstractions for single-use code.
Test: would a senior engineer say this is overcomplicated? If yes, simplify.

**Rule 3 — Surgical Changes**
Touch only what you must. Clean up only your own mess.
Don't "improve" adjacent code, comments, or formatting.
Don't refactor what isn't broken. Match existing style.

**Rule 4 — Goal-Driven Execution**
Define success criteria. Loop until verified.
Don't follow steps. Define success and iterate.
Strong success criteria let you loop independently.

**Rule 5 — Use the Model Only for Judgment Calls**
Use the model for: classification, drafting, summarization, extraction.
Do NOT use the model for: routing, retries, deterministic transforms.
If code can answer, code answers.

**Rule 6 — Token Budgets Are Not Advisory**
Per-task: 4,000 tokens. Per-session: 30,000 tokens.
If approaching budget, summarize and start fresh.
Surface the breach. Do not silently overrun.

**Rule 7 — Surface Conflicts, Don't Average Them**
If two patterns contradict, pick one (more recent / more tested).
Explain why. Flag the other for cleanup.
Don't blend conflicting patterns.

**Rule 8 — Read Before You Write**
Before adding code, read exports, immediate callers, shared utilities.
"Looks orthogonal" is dangerous. If unsure why code is structured a way, ask.

**Rule 9 — Tests Verify Intent, Not Just Behavior**
Tests must encode WHY behavior matters, not just WHAT it does.
A test that can't fail when business logic changes is wrong.

**Rule 10 — Checkpoint After Every Significant Step**
Summarize what was done, what's verified, what's left.
Don't continue from a state you can't describe back.
If you lose track, stop and restate.

**Rule 11 — Match the Codebase's Conventions, Even If You Disagree**
Conformance > taste inside the codebase.
If you genuinely think a convention is harmful, surface it. Don't fork silently.

**Rule 12 — Fail Loud**
"Completed" is wrong if anything was skipped silently.
"Tests pass" is wrong if any were skipped.
Default to surfacing uncertainty, not hiding it.

---

## Configuration

<!-- MACHINE-PARSED — read via regex by orchestrator-dev and u-spec/u-dev.
     These two fields are required. Do not rename or nest them. -->
domain: frontend
specs_dir: docs/specs

<!-- CONTEXT — read as LLM context by workers. Not parsed mechanically. -->

# --- Infrastructure ---
stack:
  frontend: React 19, TypeScript 5 (strict), Vite 6, Tailwind CSS v4 (CSS-first @theme), shadcn/ui (Radix), Zustand v5, @tanstack/react-query v5, @tanstack/react-router, @tanstack/react-table, React Hook Form v7, Zod v4, Motion (motion/react, ex-Framer Motion), sonner, lucide-react, @xyflow/react v12 + d3-force, Storybook 9 (@storybook/react-vite), Vitest, Playwright, MSW
apps:
  frontend:
    path: frontend/
    dev: npm run dev          # run inside frontend/ — autonomous package, no root workspace
    build: npm run build
    storybook: npm run storybook
sessions_dir: docs/sessions
runtime_dir: docs/runtime/logs

# --- Review phase (orchestrator-review) ---
# test_command must emit JSON. Note gotcha #1: vitest is pinned to v4 and Vite is overridden
# because of addon-vitest browser mode — validate before changing either.
test_command: npx vitest run --reporter=json
build_command: npm run build

# --- Orchestration concurrency (orchestrator-dev worker dispatch) ---
max_parallel_workers: 1   # single-domain (frontend only)

# --- Frontend config (u-fe-developer, u-fe-qa) ---
i18n: false                 # single-owner, pt-BR only — strings written directly in code
accessibility: wcag-2.2-aa  # QA verifies labels, aria, contrast, focus

# --- QA feature flags ---
observability_required: false
dependency_audit: false

# --- Git conventions ---
git_conventions:
  branch_pattern: feat/|fix/|chore/
  commit_format: conventional-commits
  pr_target: main

# --- Docs and changelog policy ---
changelog_required: false
docs_update_policy: manual

# --- Design system (u-ui-design) ---
design_system:
  tailwind_integration: theme   # CSS-first config via @theme in theme.css

---

## Environment

- Node: v20 LTS
- OS: Windows + WSL2
- Package manager: npm (autonomous package — no root workspace)
- Linter: ESLint + @typescript-eslint
- Formatter: Prettier + prettier-plugin-tailwindcss
- CI: GitHub Actions
- Dev server: vite (`npm run dev`) / Storybook (`npm run storybook`)
- Container: none

> All commands run from inside `frontend/`. This is a standalone package, not a workspace member.

---

## Commands

| Task       | Command                          |
|------------|----------------------------------|
| dev        | `npm run dev`                    |
| storybook  | `npm run storybook`              |
| build      | `npm run build`                  |
| build-sb   | `npm run build-storybook`        |
| test       | `npx vitest run`                 |
| test (sb)  | `npx vitest run` (runs stories as component tests via addon-vitest) |
| e2e        | `npx playwright test`            |
| lint       | `npm run lint`                   |
| typecheck  | `npx tsc --noEmit`               |

---

## Directory Structure

```
frontend/                     # autonomous package (no root workspace)
  src/
    features/{feature}/       # one folder per cohesive area
      api/                    #   TanStack Query hooks — the ONLY place server calls live
      components/             #   feature-scoped components
      hooks/                  #   feature-scoped hooks
      types.ts                #   feature types
    shared/                   # cross-feature code — the only cross-cutting import source
      components/ui/          #   shadcn/ui primitives — owned, do not regenerate via CLI
      lib/                    #   cn(), query keys, QueryClient, utilities
    theme.css                 # Tailwind v4 @theme — semantic tokens live here
  .storybook/                 # Storybook 9 config (@storybook/react-vite + addon-a11y + addon-vitest)
  e2e/                        # Playwright specs

docs/specs/                   # specs_dir
  _global/                    #   conventions.md, error-codes.md, glossary.md
  front/                      #   front.md (global), features/, components/, _flows/, design-system/
    components/*.component.spec.md
    features/*.feature.spec.md
    _flows/*.flow.md
    design-system/            #   tokens.md, visual personality
  handoff-manifest.yaml       # Delivery contract read by orchestrator-dev — see Handoff Manifest
  decisions.md                # Active architectural decisions

docs/sessions/{session}/      # sessions_dir — backlog, delivery, qa, decisions artifacts

.orch/                        # Orchestration engine state — NOT committed
  log.jsonl                   #   Append-only event log — source of truth for phase state
  config.json                 #   Optional: retry / circuit-breaker overrides
  workflow.json               #   Optional: override default phase sequence

docs/runtime/logs/            # runtime_dir — ephemeral traces — NOT committed
```

**.gitignore rules (add to project root):**
```
# Orchestration engine runtime state — never commit
.orch/

# Ephemeral runtime traces
docs/runtime/
```

---

## Stack — Frontend

### Component Contract (shared UI layer)

Every exported component:

- Accepts `className` merged with `cn()` (tailwind-merge + clsx) — **never** concatenate strings.
- Accepts `ref` as a normal prop (React 19) — **never** `forwardRef`.
- Consumes **only** semantic tokens — never raw values.
- Uses **CVA only when there are 2+ visual variants**. One variant → no CVA. Define the `cva()` call **outside** the component (module scope) — never inside the render body.
- Ships three files: `component.tsx`, `component.types.ts`, `index.ts`.
  (The per-component `index.ts` re-exporting that single component's public surface is the sanctioned exception to the no-barrel rule. Project-wide `export *` barrels remain forbidden.)

Every component ships at least one `.stories.tsx` — the story is its canonical presentation and its component test surface.

### Data Layer (TanStack Query) — hard rules

- Every server call is a hook in `features/{feature}/api/`.
- **Forbidden:** `fetch`/`axios` inside a component; `useEffect` to fetch data.
- Query keys are typed and centralized per entity (key factory). Never duplicate a key:
  ```ts
  export const customerKeys = {
    all: ["customers"] as const,
    detail: (id: string) => ["customers", id] as const,
  };
  ```
- `staleTime`: stable data 5min; volatile data 0.
- Mutations always `invalidateQueries` for the affected keys. Optimistic updates only on demand.
- Share `queryKey` + `queryFn` via the `queryOptions` helper. Do not mix mutations and queries in the same factory.
- Global `QueryClient`: `retry: 1`; errors handled centrally in the Query Cache `onError` (the `useQuery` `onError` callback was removed in v5).

### Tailwind CSS v4

- CSS-first config via `@theme` in `theme.css`. No `tailwind.config.ts`.
- Token layering: `base` (raw values) → `semantic` (purpose) → `component` (variants). Component-scoped tokens are allowed in the component file, but they must reference semantic tokens — never raw values.
- Never hardcode a value — always reference a semantic token.
- Breakpoints: mobile-first Tailwind named breakpoints — `sm`, `md` ≥768px, `lg` ≥1024px, `xl`, `2xl`. Use **container queries** for reusable components (sized by their container, not the viewport). Custom CSS media queries are forbidden.
- **Two border namespaces exist** — see Known Gotchas: `--color-border-*` (color) vs `--border-*` (width). Mixing them silently drops the border.

### shadcn/ui (Radix)

- `shared/components/ui/` is generated but **owned** — modify with intent; never regenerate via the CLI.
- Merge classes with `cn()` — never string concatenation.
- `cn()` must be built from a single module that configures `tailwind-merge` for our custom tokens/utilities (`extendTailwindMerge`). Otherwise `twMerge` mis-resolves conflicts on custom classes (interacts with Gotcha #2 — border namespaces).

### Forms — React Hook Form v7 + Zod v4

- Schema-first: `schema → z.infer → form`. Always use `zodResolver`. Never write manual `validate` functions.
- Zod v4 is imported from the `zod/v4` subpath (coexists with v3). Use `z.strictObject()` / `z.looseObject()` — `.strict()` / `.passthrough()` are deprecated.
- Given the < 300kb bundle budget, prefer `@zod/mini` (~1.9kb gzip, tree-shakable) for form validation when the full Zod surface isn't needed.
- Validate client-side (Zod) **and** assume server-side validation — never trust the client alone.
- Visible loading and error states; friendly messages.
- Accessibility: associated `label`; `aria-invalid` on invalid fields; error linked via `aria-describedby` (see `u-fe-standards §4`).

### State — Zustand v5 + TanStack Query v5

- Zustand for client state; TanStack Query for server state. Do not store server data in Zustand.
- Always subscribe via a selector (`useStore(s => s.x)`) — never consume the whole store. Use `useShallow` when selecting an object with multiple picks. Split by domain (`useUiStore`, etc.) rather than one god-store.

### Routing / Tables — TanStack Router + TanStack Table

- Tables always ship sorting, filtering, pagination, selection, loading, and empty states.
- Persist sorting / filtering / pagination in the **URL** (router), not local state. Validate search params with a Zod schema via the route's `validateSearch`.
- Server-side data: use `manualPagination` / `manualSorting` / `manualFiltering` + provide `rowCount`/`pageCount`, and include sort/filter/page in the TanStack Query `queryKey` so the query re-fetches on change.
- Virtualization on demand only — for large lists (> ~1000 rows).

### Graph — React Flow (@xyflow/react v12) + d3-force

- `@xyflow/react` is the renderer; `d3-force` computes layout. This is the central component of the SPA — the knowledge-graph explorer.
- Define `nodeTypes` / `edgeTypes` **outside** the component body (or `useMemo`) — inline objects cause re-render loops.
- Drive the d3-force simulation via a `useLayoutedElements` hook reading `getNodes`/`getEdges` from `useReactFlow` — never reconfigure the simulation on every node update. Memoize custom nodes for large graphs.

### Animation / Notifications / Icons

- **Motion** (`motion/react`, formerly Framer Motion) for animation. Prefer `LazyMotion` + the `m` component over `motion` to keep the initial bundle small (~6kb vs ~34kb); animate `transform`/`opacity` for hardware acceleration.
- `sonner`: a single `<Toaster />` at the app root — never multiple instances.
- `lucide-react`: named imports only, never default import. Vite does not tree-shake in dev; if the production bundle pulls unused icons, switch to per-icon path imports or a `vite.config.ts` alias.

### Build

- Vite 6.

---

## Testing

- Unit / component: **Vitest**. Stories run as browser component tests via `addon-vitest` (Playwright-driven).
- E2E: **Playwright** under `frontend/e2e/`.
- API mocking: **MSW** — network-level intercepts. Keep one shared `handlers.ts` reused across Vitest, Storybook, dev, and Playwright; wire E2E via the `@msw/playwright` fixture and call `resetHandlers()` in `afterEach` so per-test overrides don't leak.
- Accessibility: Storybook `addon-a11y` on every story; QA verifies WCAG 2.2 AA.

---

## Performance Budgets

Agents must flag violations during the QA phase.

- LCP: < 2.5s (Core Web Vitals "Good")
- INP: < 200ms (Core Web Vitals "Good")
- CLS: < 0.1 (Core Web Vitals "Good") — components must reserve space (skeletons, sized media, font-display) to avoid layout shift
- Initial bundle (gzipped): < 300kb
- Lighthouse CI gate: ≥ 85 performance, ≥ 90 accessibility

**QA viewports:** 320px · 768px (md) · 1024px (lg) · 1440px (xl/2xl).

---

## Conventions

- Language: TypeScript strict mode.
- Feature folder: `frontend/src/features/{feature}/` with `api/`, `components/`, `hooks/`, `types.ts`.
- Shared code: `frontend/src/shared/` — the only cross-cutting import source.
- Never import from a sibling feature — only from `shared/` or the feature's own folder.
- Semantic tokens are the single source of visual values; they live in `theme.css` under `@theme`.
- i18n is off: single-owner, pt-BR only. Write strings directly in code — no translation layer.

---

## Anti-patterns

### Architecture

- Never import from a sibling feature — only from `shared/` or the own feature.
- Never use `forwardRef` — `ref` is a normal prop in React 19.
- Never use `any` — use `unknown` and narrow explicitly.

### Data

- Never call `fetch`/`axios` inside a component — server calls are hooks in `features/{feature}/api/`.
- Never use `useEffect` to fetch data — use a TanStack Query hook.
- Never duplicate a query key or a token — keys come from the per-entity factory.

### Frontend / Styling

- Never concatenate `className` strings — use `cn()`.
- Never hardcode a raw visual value — reference a semantic token.
- Never write custom CSS media queries — use Tailwind named breakpoints or container queries.
- Never use CVA for a single-variant component.

### Tooling

- Never regenerate `shared/components/ui/` via the shadcn CLI — those files are owned.
- Never bump `vitest` or `vite` without revalidating Storybook browser mode (see Gotcha #1).

---

## Known Gotchas

1. **vitest/vite are pinned** — `vitest` is pinned to v4 with a Vite override because of `addon-vitest` browser mode. Do not bump `vitest` or `vite` without revalidating the browser mode end-to-end.
2. **Tailwind v4 — two border namespaces:** `--color-border-*` (color) vs `--border-*` (width). Mixing them makes the border disappear silently.
3. **Tailwind v4 — `max-w-sm` × spacing tokens (RESOLVED):** named spacing tokens were shadowing the container scale. Fixed in `theme.css` with a `--container-*` scale under `@theme` plus non-layered `.max-w-*` / `.min-w-*` rules. Do **not** use `@utility` for this.
4. **shadcn/ui init requires the canary/latest CLI** for React 19 + Tailwind v4 (`npx shadcn@canary init`). Generated primitives ship a `data-slot` attribute (used for styling) and have `forwardRef` removed. The `toast` component is deprecated in favor of `sonner` (already our choice). HSL colors are converted to OKLCH. Reminder: `shared/components/ui/` is owned — do not regenerate via CLI after the initial add.

---

## Security

**Never commit:**
- `.env`, `*.pem`, `secrets.*`, `credentials.*`, `*.key`, `*.p12`

**Secrets management:** `.env.local` (gitignored, never committed).

**Forbidden patterns:**
- Hardcoded API keys, tokens, or passwords in source code.
- Logging sensitive fields (tokens, PII) at any log level.
- Committing `.orch/` or `docs/runtime/` — verify `.gitignore` before the first push.

---

## Agent Behavior

- confirmation_style: ask-before-destructive
- response_language: pt-BR
- verbosity: normal
- preferred_model: claude-sonnet-4-6

---

## Siegard Frontend Agents, Skills & Commands

This project uses the Siegard framework. The frontend chain:

| Agent | Role |
|---|---|
| `u-fe-planner` | Frontend backlog (Epics + Task Contracts) |
| `u-fe-spec-writer` | `.component.spec.md` for shared components |
| `u-fe-ui` | Translates `feature.spec.md` §2/§3 + `flow.md` into visual specs (`ui-epic-XX.md`) |
| `u-fe-developer` | Implements FE Task Contracts + bug fixes |
| `u-fe-qa` / `u-fe-qa-docs` | Tests against acceptance criteria, a11y, regression |

**FE skills:** `u-fe-development` (code patterns) · `u-fe-standards` (single source of dev+QA quality) · `u-fe-qa-docs` · `u-fe-review` (ad-hoc audit, `--fix`) · `u-fe-templates` · `u-ui-design` · `u-ui-brief`.

**User-invocable FE commands:**
- `/u-fe-validate [TARGET]` — validate quality + design-system rules standalone (no Task Contract / session).
- `/u-fe-review` — audit a component or feature.

FE specs live in `docs/specs/front/`: `front.md` (global), `features/*.feature.spec.md`, `components/*.component.spec.md`, `_flows/*.flow.md`, `design-system/`.

---

## Orchestration Engine

<!-- How the Siegard orchestration engine behaves here. Tune via .orch/config.json and
     .orch/workflow.json — not by editing CLAUDE.md. -->

### Entry points

| Command          | When to use                                                        |
|------------------|--------------------------------------------------------------------|
| `/u-spec`        | New component / feature — full SDD → Dev → Review → Test            |
| `/u-dev`         | Skip spec phase — Dev → Review → Test                              |
| `/u-improve`     | Incremental change to an existing spec or component behavior       |
| `/u-reverse-spec`| Generate specs from existing code                                  |

**Utility commands (ad-hoc):** `/u-fe-validate`, `/u-fe-review`, `/u-doc-cleanup`, `/u-cleanup`, `/u-orchestrator`.

### Default workflow

`dev-cycle` — four phases: `sdd` → `dev` → `review` → `test`. Override the sequence in `.orch/workflow.json` **before** the first `/u-spec`; once the log exists, the sequence is derived from events and `workflow.json` is ignored.

### Retry & circuit breaker (`.orch/config.json`)

Exponential backoff with per-tier defaults (critical / standard / bulk). The circuit breaker trips when the failure rate exceeds `failure_threshold` (%) within `window_minutes`. The four fields (`enabled`, `window_minutes`, `failure_threshold`, `scope`) are the entire contract — there is no cooldown or success-reset logic; do not add `cooldown_minutes` or `reset_on_success_count` (silently ignored). Clear a tripped breaker by letting the window elapse or via `scripts/circuit_breaker.py`.

### Worker recursion limit

Orchestrators refuse to spawn at `nesting_depth >= 3`. If seen, a call chain has a cycle — investigate the orchestrator re-spawning itself.

### Diagnosing a stuck session

1. Read `.orch/metrics/current.json` (written by the `on_stop` hook).
2. Check `.orch/last_error.json` (orphaned phase / stuck improve workflow).
3. Run `/u-orchestrator` to derive the current phase and pending tasks from the log.

---

## Handoff Manifest

<!-- The delivery contract between SDD and Dev/Review/Test. Generated deterministically by
     orchestrator-sdd over validated specs, validated by u-handoff-validator, consumed by the
     Dev/Review/Test orchestrators. A pure function of on-disk specs — do not hand-edit. -->

**File location:** `docs/specs/handoff-manifest.yaml`

**Validation (the gate):**

```bash
python3 .claude/skills/u-handoff-validator/validate.py \
  --manifest docs/specs/handoff-manifest.yaml --specs-dir .
```

`status: valid` (exit 0) **is** the approval — there is no `approval_status` field. The SDD→Dev gate proceeds only on `status: valid`. Worker dispatch is inferred from artifact presence: `frontend_package` present → FE workers. Do not add a `stack` field (not in the schema; never emitted).

**Schema strictness:** the canonical schema is `additionalProperties: false` at every level. `validate.py` checks only its rule set and ignores extra keys, so keep the manifest to the canonical structure. Regenerate (never hand-edit) after any spec edit so `sha256` values stay current.

---

## Architectural Decisions (ADR inline)

### ADR-001: Storybook is the presentation and component-test surface

**Decision:** Every standardized component is presented through Storybook, and its stories run as browser-level component tests via `addon-vitest`.
**Justification:** One artifact serves documentation, visual review, and automated a11y/interaction testing — eliminating drift between "how it looks" and "how it's tested".
**Risk accepted:** Storybook build health becomes release-blocking; a broken story breaks the test suite. The `vitest`/`vite` pin (Gotcha #1) exists to keep browser mode stable.
**Revisit when:** the component count makes a single Storybook build too slow for CI, or `addon-vitest` browser mode is deprecated.

### ADR-002: Autonomous frontend package, no root workspace

**Decision:** `frontend/` is a standalone npm package; there is no monorepo workspace root.
**Justification:** The design system has a single owner and single consumer surface; a workspace adds tooling overhead with no current payoff.
**Risk accepted:** If a backend or second frontend package is added later, dependency and script sharing must be reworked into a workspace.
**Revisit when:** a second deployable package enters the repo, or shared build config needs to be hoisted.
