# Design System — TUI UI Kit

> Path: `docs/specs/front/design-system/`
> Implementation: `frontend/src/theme.css`
> Version: 1.1.0 | Layer: permanent

---

## 1. System principles

| Principle | Description |
|---|---|
| Semantic tokens only | Components never reference raw hex values, raw px sizes, or base tokens. Every visual value comes from a semantic token in `theme.css`. |
| Monospace everywhere | `--font-sans` is aliased to `--font-mono`. No sans-serif stack exists in the kit — the TUI identity is monospace-first. |
| Sharp corners | All radius tokens are `0px`. The CRT terminal aesthetic forbids rounded corners throughout the kit. |
| Two border namespaces | `--color-border-*` controls border **color**; `--border-*` controls border **width**. Mixing them silently drops the border (Gotcha #2). |
| Component Contract | Every exported component: accepts `className` merged with `cn()`; accepts `ref` as a normal prop (React 19, no `forwardRef`); uses CVA only when 2+ visual variants exist; ships three files: `component.tsx` + `component.types.ts` + `index.ts`. |
| Switchable themes | The `phosphor` theme (default) and the `default` theme (Terminal.css/Dracula) are switched via `data-theme` on `<html>`. Adding a theme requires updating both `@theme` and `:root[data-theme="X"]` blocks for all semantic tokens. |

---

## 2. Visual context

- **Color mode:** dark-only (both themes are dark; no light-mode variant exists)
- **Aesthetic constraints:** TUI / CRT phosphor terminal — green-on-black by default, monospace, sharp corners, box borders, subtle scanline effect and phosphor glow inherited from the `:root` CSS. Components must not introduce raster images, gradients, drop shadows on surfaces, or rounded corners.
- **CRT effects:** phosphor glow is applied globally via `text-shadow: 0 0 1px currentColor, 0 0 4px color-mix(…)` on `:root`. Scanline overlay runs via `body::after`. Both are opt-out via `<html data-crt="off">` and are automatically suppressed by `@media (prefers-reduced-transparency: reduce)`.

**Visual personality** — consumed by `u-ui-design` to calibrate directional rules:

```yaml
visual_personality:
  direction: minimal
  intensity: 4
```

*Minimal at intensity 4*: the TUI/CRT aesthetic is a strongly directional minimal design — clarity and information density dominate. Every decoration must earn its place; the glow/scanline effect is the one permitted accent because it is the identity of the kit.

---

## 3. File summary

| File | Content | When to load |
|---|---|---|
| `tokens.md` | All semantic color/typography/spacing/radius tokens; CSS block + YAML manifest; `--color-accent-alt` documentation | Whenever implementing or reviewing visual styles |
| `composition.md` | CRT visual effects (glow, scanline); Z-index scale; information hierarchy; layout patterns; visual density | Screens with effects, dashboard shells, complex layout |
| `components.md` | DS primitive membership rules; component catalog (slots × states × do/don't) | Implementing or specifying visual components |
| `implementation.md` | Accessibility (WCAG 2.2 AA); animations; QA checklist | Visual QA, PR review, accessibility adjustments |

---

## Changelog

| Version | Date | Author | Type | Description | CR |
|---|---|---|---|---|---|
| 1.0.0 | 2026-07-15 | Front Spec Agent | initial | Initial `_index.md` created; tokens.md pre-existed with `--color-accent-alt`; completed missing files (composition.md, components.md, implementation.md, design-system-rules.md) for the VISUAL VAULT Panel family (Panel / StatPanel / Banner / StatusBar / MenuBar) | -- |
| 1.1.0 | 2026-07-15 | Front Spec Agent | minor | Updated tokens.md with Token Declarations CSS block + token-manifest YAML block (rules 10a/10b compliance) | -- |
