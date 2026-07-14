import { cn } from "@/shared/lib/cn";
import type { InputProps } from "./input.types";

// MIGRATION: dropped the source's `$` prompt prefix and loading/error/success
// glyph state machine (and the `useState` it required for focus tracking) in
// favor of the standard `aria-invalid` contract mandated by this migration —
// consumers drive error state the same way the rest of this kit's forms do.
// File-input reset classes were also dropped (no file input in this kit yet).
// ref is a normal prop (React 19) — never forwardRef.
export function Input({ className, ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      className={cn(
        "flex h-9 w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground",
        "outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        "aria-invalid:border-destructive",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
