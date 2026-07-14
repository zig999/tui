import { cn } from "@/shared/lib/cn";
import type { TextareaProps } from "./textarea.types";

// MIGRATION: source bundled a composite field (optional label header, char
// counter, helper/error text) around the textarea. Simplified to a bare
// `<textarea>` primitive — consistent with Input — so label/counter/helper
// text compose from separate primitives instead of living inside this one.
// ref is a normal prop (React 19) — never forwardRef.
export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full resize-y border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground",
        "outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        "aria-invalid:border-destructive",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
