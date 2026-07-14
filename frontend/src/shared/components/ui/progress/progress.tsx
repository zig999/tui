import { cva } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";
import type { ProgressProps } from "./progress.types";

// CVA defined at module scope — never inside the render body (Component Contract).
// MIGRATION: source (2ndbrain `progress.tsx`) drew the bar with Unicode block
// glyphs (█/░). Per this migration's brief, replaced with a hand-rolled two-div
// bar (track bg-surface, fill bg-primary/tone) — sharp corners, no glyphs.
export const progressFillVariants = cva(
  "h-full transition-[width] duration-150 motion-reduce:transition-none",
  {
    variants: {
      tone: {
        default: "bg-primary",
        success: "bg-success",
        warning: "bg-warning",
        destructive: "bg-destructive",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

// ref is a normal prop (React 19) — never forwardRef.
export function Progress({
  value,
  max = 100,
  label,
  tone,
  showValue = false,
  className,
  ...props
}: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? clamped / max : 0;
  const percentLabel = `${Math.round(percent * 100)}%`;

  return (
    <div data-slot="progress" className={cn("flex flex-col gap-1", className)} {...props}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-2">
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
          {showValue && <span className="ml-auto text-xs text-foreground">{percentLabel}</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="h-2 w-full bg-surface"
      >
        {/* MIGRATION: width is a computed data value, not a design token — the
            only dimension a semantic-token system cannot express. */}
        <div
          className={cn(progressFillVariants({ tone }))}
          style={{ width: `${percent * 100}%` }}
        />
      </div>
    </div>
  );
}
