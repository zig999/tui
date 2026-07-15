# Front-end Spec — Global (TUI UI Kit)

> Stack: React 19 + Vite 6 + Tailwind CSS v4 | State: none (component library) | Fetching: none (component library)
> Version: 1.0.0 | Status: approved | Layer: permanent

> This is the global frontend architecture document for the TUI UI Kit project.
> This package is an **autonomous UI component library** — it has no backend, no routes, no data fetching.
> Storybook is both the presentation surface and the component test surface.

---

## 1. Stack and Patterns

- **Framework:** React 19 (function components; `ref` as a normal prop — no `forwardRef`)
- **Build tool:** Vite 6
- **Styling:** Tailwind CSS v4 — CSS-first `@theme` in `frontend/src/theme.css`; no `tailwind.config.ts`
- **Component library:** shadcn/ui (Radix primitives) — owned and modified in `src/shared/components/ui/`; never regenerated via the shadcn CLI after initial setup
- **Class merging:** `cn()` from `@/shared/lib/cn` — `tailwind-merge` configured via `extendTailwindMerge` for custom tokens (required to avoid mis-resolution of `--color-border-*` vs `--border-*` class conflicts)
- **Variants:** `class-variance-authority` (CVA) — only when a component has 2+ visual variants; defined at module scope, never inside the render body
- **State management:** not applicable — this is a stateless component library
- **Data fetching:** not applicable — components are purely presentational
- **Router:** not applicable — no routes in a UI Kit
- **Testing:** Vitest (pinned — see Gotcha #1) + Storybook `addon-vitest` (browser component tests via Playwright) + `addon-a11y`
- **Language:** TypeScript 5 (strict mode)
- **Language/i18n:** pt-BR only; strings written directly in code; no translation layer

---

## 2. Routing Conventions

Not applicable — this package is a component library with no application routes.
Storybook stories are the only "navigation surface" and are organized by the taxonomy below.

### Storybook taxonomy (sidebar sections)

| Section | Components |
|---|---|
| `Actions/` | `Button` |
| `Data Display/` | `Card`, `Divider`, `Kbd`, `Skeleton`, `Progress` |
| `Feedback/` | `Alert`, `Empty` |
| `Forms/` | `Checkbox`, `DatePicker`, `Input`, `Label`, `MultiCombobox`, `PersonPicker`, `RadioGroup`, `Select` |
| `Layout/` | `Panel`, `StatPanel`, `Banner`, `StatusBar` |
| `Navigation/` | `Breadcrumb`, `Link`, `Tabs` (includes `MenuBarStyle` story) |
| `Overlays/` | `Dialog`, `Sheet` |

Every new component is placed in the appropriate section. If the component spans multiple roles, use the primary role.

---

## 3. Global State Strategy

Not applicable — this is a stateless component library. No Zustand stores, no React Context providers, no persisted data.

**Note on component-local state:**

| Component | Local state allowed | Notes |
|---|---|---|
| `Tabs` | Yes — active item | Single `useState` for uncontrolled usage; also supports controlled mode via `value`/`onValueChange` |
| `Checkbox`, `RadioGroup`, `Select`, etc. | Yes — checked/selected state | Radix provides controlled + uncontrolled patterns |
| `Dialog`, `Sheet` | Yes — open/closed | Radix Popover/Dialog pattern |

---

## 4. Component Patterns

### Folder structure

```
frontend/src/
  shared/
    components/
      ui/
        {component}/
          {component}.tsx          # implementation
          {component}.types.ts     # prop types
          {component}.stories.tsx  # Storybook stories + component tests
          index.ts                 # per-component barrel (sanctioned exception)
    lib/
      cn.ts                        # cn() — tailwind-merge + clsx
  theme.css                        # Tailwind v4 @theme — single source of semantic tokens
```

### Component Contract (binding for every exported component)

1. Accepts `className` merged with `cn()` — never string concatenation
2. Accepts `ref` as a normal prop (React 19) — never `forwardRef`
3. Consumes only semantic tokens from `theme.css` — never raw values
4. Uses CVA only when 2+ visual variants exist — defined at module scope
5. Ships three files: `component.tsx` + `component.types.ts` + `index.ts`
6. Ships at least one `.stories.tsx` with `play()` covering render + ARIA

### Naming

- Components: `PascalCase` (e.g., `StatPanel`)
- Hooks (if any): `camelCase` with `use` prefix (e.g., `useTabsContext`)
- Types: `PascalCase` (e.g., `PanelProps`, `PanelAccent`)
- Files: `kebab-case` matching the component directory name (e.g., `stat-panel.tsx`)

### Path aliases

```
@/shared/components/ui/{component} → src/shared/components/ui/{component}/
@/shared/lib → src/shared/lib/
```

---

## 5. Global Error Handling

Not applicable — this is a component library, not an application. There are no HTTP requests, authentication flows, or application-level errors.

**Component-level error patterns** (for consumers):

| Scenario | Kit component | Notes |
|---|---|---|
| Validation error on a form field | `Input` with `aria-invalid` + `aria-describedby` to error text | Error text below input via `gap-1` |
| Async operation error (consumer) | `Alert` with `variant="destructive"` inside a `Panel` | Pattern documented in `components.md §12.7` |
| Empty data set | `Empty` component or documented empty-state pattern | Required per R25 |

---

## 6. Global Accessibility

- **Minimum standard:** WCAG 2.2 AA — verified under both themes at QA time
- **Keyboard navigation:** all interactive components support Tab + Enter/Space; focus ring visible on all interactive elements (3px `ring-ring` color)
- **Focus management:** Dialog/Sheet return focus to trigger on close; focus is never trapped outside a modal
- **ARIA roles:** components use semantic roles per their `component.spec.md §9`. Non-interactive containers (`Panel`, `StatPanel`, `Banner`, `StatusBar`) use `<section>` / `<header>` / `<div>` semantics with `aria-labelledby` where applicable
- **Decorative elements:** icons used decoratively have `aria-hidden="true"` — only text contributes to accessible names
- **Contrast:** minimum 4.5:1 for normal text, 3:1 for large text and UI elements — verified in both phosphor and default themes
- **Target size (SC 2.5.8):** interactive targets ≥ 32px desktop, ≥ 44px mobile
- **Reduced motion:** all animations wrapped in `@media (prefers-reduced-motion: no-preference)`
- **CRT effects:** suppressed by `@media (prefers-reduced-transparency: reduce)` and by `data-crt="off"` toggle

---

## 7. Permitted and Prohibited Libraries

| Library | Status | Rationale |
|---------|--------|-----------|
| `class-variance-authority` (CVA) | Permitted | Component variant management — only when 2+ variants |
| `tailwind-merge` + `clsx` via `cn()` | Permitted | Class merging — mandatory for all components |
| `react` (useId, useState, etc.) | Permitted | Core hooks — ref as normal prop (React 19 pattern) |
| `lucide-react` | Permitted | Named imports only — no default import |
| `motion/react` (`LazyMotion` + `m`) | Permitted | Functional animations only — `LazyMotion` + `m` pattern to minimize bundle |
| `sonner` | Permitted — consumer responsibility | Single `<Toaster />` at app root; not rendered inside the Kit itself |
| `@tanstack/react-router` | Prohibited in Kit | No routing in a component library |
| `@tanstack/react-query` | Prohibited in Kit | No data fetching in a component library |
| `fetch` / `axios` inside components | Prohibited | Components are purely presentational |
| `useEffect` for data fetching | Prohibited | Not applicable — no data fetching |
| Custom CSS media queries | Prohibited | Use Tailwind named breakpoints (`sm`, `md`, `lg`) or container queries |
| Raw hex / px values in components | Prohibited | Semantic tokens only — see `design-system/tokens.md` |
| `tailwind.config.ts` | Prohibited | Tailwind v4 CSS-first — all config in `theme.css` |
| `forwardRef` | Prohibited | `ref` is a normal prop in React 19 |
| `any` type | Prohibited | Use `unknown` and narrow explicitly |
| shadcn CLI after initial setup | Prohibited | `shared/components/ui/` is owned — never regenerate |

---

## Changelog

| Version | Date | Author | Type | Description | CR |
|---------|------|--------|------|-------------|----|
| 1.0.0 | 2026-07-15 | Front Spec Agent | initial | Initial global frontend spec for the TUI UI Kit; establishes Component Contract, Storybook taxonomy (Layout/ section added for Panel family), accessibility baseline, and library permissions | -- |
