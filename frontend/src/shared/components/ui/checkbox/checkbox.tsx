import { useCallback } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { CheckboxProps } from "./checkbox.types";

// MIGRATION: source set `.indeterminate` via forwardRef + a separate
// useEffect watching a locally-held ref. Refactored to a memoized callback
// ref so `ref` stays a normal prop (React 19, never forwardRef) while still
// forwarding the caller's own ref.
// ref is a normal prop (React 19) — never forwardRef.
export function Checkbox({
  id,
  checked,
  onChange,
  disabled,
  className,
  children,
  ref,
  ...props
}: CheckboxProps) {
  const isChecked = checked === true;
  const isIndeterminate = checked === "indeterminate";
  const isActive = isChecked || isIndeterminate;

  const setRef = useCallback(
    (node: HTMLInputElement | null) => {
      if (node) node.indeterminate = isIndeterminate;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [isIndeterminate, ref],
  );

  return (
    <label
      htmlFor={id}
      className={cn(
        "group inline-flex select-none items-center gap-2 text-sm text-foreground",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      <input
        ref={setRef}
        id={id}
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        disabled={disabled}
        className="peer sr-only"
        {...props}
      />
      <span
        data-slot="checkbox"
        aria-hidden="true"
        className={cn(
          "flex size-4 shrink-0 items-center justify-center border border-border transition-colors motion-reduce:transition-none",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
          "peer-aria-invalid:border-destructive",
          isActive && "border-primary bg-primary text-primary-foreground",
          !disabled && !isActive && "group-hover:border-border-strong",
        )}
      >
        {isChecked && <Check className="size-3" />}
        {isIndeterminate && <Minus className="size-3" />}
      </span>
      {children}
    </label>
  );
}
