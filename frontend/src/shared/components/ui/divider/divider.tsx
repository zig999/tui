import { cn } from "@/shared/lib/cn";
import type { DividerProps } from "./divider.types";

export function Divider({ label, vertical = false, className }: DividerProps) {
  if (vertical) {
    return (
      <span
        className={cn(
          "inline-block h-full w-px border-l border-dashed border-border",
          className,
        )}
        aria-hidden="true"
      />
    );
  }

  if (label) {
    return (
      <div
        className={cn("flex items-center gap-2", className)}
        role="separator"
        aria-label={label}
      >
        <span className="flex-1 border-t border-dashed border-border" />
        <span className="shrink-0 text-xs tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <span className="flex-1 border-t border-dashed border-border" />
      </div>
    );
  }

  return (
    <hr
      className={cn("border-dashed border-border", className)}
      aria-hidden="true"
    />
  );
}
