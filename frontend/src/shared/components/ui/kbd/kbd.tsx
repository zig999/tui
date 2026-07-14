import { cn } from "@/shared/lib/cn";
import type { KbdProps } from "./kbd.types";

// MIGRATION: dropped the source's 2px bottom-border "keycap" bevel (inline style) —
// conflicts with the flat, no-3D TUI visual language; uniform 1px border instead.
// MIGRATION: source used arbitrary 10px/11px font sizes with no matching token; both
// sizes render text-xs and differ only by padding.
export function Kbd({ children, size = "md", className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center border border-border bg-elevated text-xs text-accent select-none",
        size === "sm" && "px-1 py-0.5",
        size === "md" && "px-1.5 py-1",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
