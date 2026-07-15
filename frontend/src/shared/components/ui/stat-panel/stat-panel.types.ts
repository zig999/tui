import type { PanelProps } from "@/shared/components/ui/panel";

/**
 * StatPanel — composition over `Panel` that renders a single KPI tile
 * (title-on-border + big centered value + optional caption).
 *
 * The body is fully owned by the component: `children` is not accepted.
 * Consumers who need arbitrary body content should use `Panel` directly.
 * All frame-related props (`title`, `icon`, `accent`, `titleLevel`,
 * `className`, and the `<section>` passthrough) are forwarded to `Panel`
 * unchanged.
 */
export type StatPanelProps = Omit<PanelProps, "children"> & {
  /**
   * The big centered value rendered inside the panel body.
   * Numbers are rendered via `String(value)` — the component performs no
   * formatting (no thousands separator, no unit suffix). Format at the
   * consumer site.
   */
  value: string | number;
  /**
   * Optional short caption rendered below the value in
   * `text-xs uppercase tracking-widest text-muted-foreground`.
   */
  caption?: string;
};
