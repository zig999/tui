import { cn } from "@/shared/lib/cn";
import type { SwitchProps } from "./switch.types";

// ref is a normal prop (React 19) — never forwardRef.
export function Switch({
  id,
  checked,
  onChange,
  disabled,
  label,
  className,
  ref,
  ...props
}: SwitchProps) {
  return (
    <label
      className={cn(
        "inline-flex select-none items-center gap-2",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        data-slot="switch"
        className={cn(
          "min-w-28 border px-2 py-1 text-center text-xs uppercase tracking-wider outline-none transition-colors motion-reduce:transition-none",
          "focus-visible:ring-2 focus-visible:ring-ring",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-muted-foreground hover:border-border-strong",
          "aria-invalid:border-destructive",
        )}
        {...props}
      >
        {checked ? "[ ON ]" : "[ OFF ]"}
      </button>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  );
}
