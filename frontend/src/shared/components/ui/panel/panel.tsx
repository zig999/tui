import { useId } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";
import type { PanelProps } from "./panel.types";

// CVA defined at module scope — never inside the render body (Component Contract).
// Base: <section> border on all four sides + surface background; positioned relative
// so the notched-title element can visually break the top rule via a background mask.
export const panelVariants = cva("relative border bg-surface p-4", {
  variants: {
    accent: {
      default: "border-border",
      success: "border-success",
      info: "border-info",
      warning: "border-warning",
      danger: "border-destructive",
      alt: "border-accent-alt",
    },
  },
  defaultVariants: {
    accent: "default",
  },
});

type PanelAccent = NonNullable<PanelProps["accent"]>;

// Title color mirrors the accent border color (see spec §6). Kept as a plain
// map (not a CVA) because it is one axis with the same key set as `panelVariants`.
const titleAccentClass: Record<PanelAccent, string> = {
  default: "text-foreground",
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  danger: "text-destructive",
  alt: "text-accent-alt",
};

// ref is a normal prop (React 19) — passed through via `...props` (never
// destructured, never forwardRef).
export function Panel({
  title,
  icon,
  accent,
  titleLevel = 3,
  className,
  children,
  ...props
}: PanelProps) {
  // Normalize the variant to its default so downstream lookups are safe
  // (VariantProps' inferred type allows null).
  const resolvedAccent: PanelAccent = accent ?? "default";
  const titleId = useId();

  // Heading level chosen at render — matches titleLevel (default 3). The map is
  // exhaustive over the prop's literal union, so TypeScript enforces coverage
  // and the runtime never falls back to a string.
  const HeadingTag = ({ 2: "h2", 3: "h3", 4: "h4" } as const)[titleLevel];

  return (
    <section
      aria-labelledby={titleId}
      data-slot="panel"
      className={cn(panelVariants({ accent: resolvedAccent }), className)}
      {...props}
    >
      {/* Notched title: the heading's own background masks the intersecting
          top-border segment, producing the TUI `┌─ Título ─┐` frame. The
          `-mt-[0.6em]` pulls the heading half-line above the border rule so the
          text sits centered on it. `w-fit` keeps the mask width equal to the
          content width — never spanning the full panel. */}
      <HeadingTag
        id={titleId}
        className={cn(
          "-mt-[0.6em] w-fit bg-surface px-2 text-sm font-medium",
          titleAccentClass[resolvedAccent],
        )}
      >
        {icon != null && (
          <span aria-hidden="true" className="mr-1 inline-flex items-center">
            {icon}
          </span>
        )}
        {title}
      </HeadingTag>
      {children}
    </section>
  );
}
