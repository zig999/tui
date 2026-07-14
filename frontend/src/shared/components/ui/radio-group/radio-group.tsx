import { createContext, useContext, useId } from "react";
import { cn } from "@/shared/lib/cn";
import type {
  RadioGroupContextValue,
  RadioGroupItemProps,
  RadioGroupProps,
} from "./radio-group.types";

// MIGRATION: source took a data-driven `options[]` prop plus a `colored`
// palette-cycling feature that hardcoded two raw hex colors with no semantic
// token equivalent. Refactored to a composable Root + Item API (RadioGroup +
// RadioGroupItem) so consumers compose options as JSX, matching how this
// kit's other compound components are shaped. The raw-hex `colored` palette
// was dropped — no equivalent exists in the token map.
const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext(): RadioGroupContextValue {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroupItem must be used within a RadioGroup");
  }
  return context;
}

// ref is a normal prop (React 19) — never forwardRef.
export function RadioGroup({
  name,
  value,
  onValueChange,
  disabled,
  className,
  children,
  ref,
  ...props
}: RadioGroupProps) {
  const generatedName = useId();

  return (
    <RadioGroupContext.Provider
      value={{ name: name ?? generatedName, value, onValueChange, disabled }}
    >
      <div
        ref={ref}
        role="radiogroup"
        data-slot="radio-group"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export function RadioGroupItem({
  value,
  disabled: itemDisabled,
  className,
  children,
  id,
  ref,
  ...props
}: RadioGroupItemProps) {
  const {
    name,
    value: groupValue,
    onValueChange,
    disabled: groupDisabled,
  } = useRadioGroupContext();
  const isSelected = groupValue === value;
  const isDisabled = groupDisabled || itemDisabled;
  const inputId = id ?? `${name}-${value}`;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "group inline-flex select-none items-center gap-2 text-sm text-foreground",
        isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      <input
        ref={ref}
        id={inputId}
        type="radio"
        name={name}
        value={value}
        checked={isSelected}
        disabled={isDisabled}
        onChange={() => onValueChange(value)}
        className="peer sr-only"
        {...props}
      />
      <span
        data-slot="radio-group-item"
        aria-hidden="true"
        className={cn(
          "flex size-4 shrink-0 items-center justify-center border border-border transition-colors motion-reduce:transition-none",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
          "peer-aria-invalid:border-destructive",
          isSelected && "border-primary bg-primary",
          !isDisabled && !isSelected && "group-hover:border-border-strong",
        )}
      >
        {isSelected && <span className="size-1.5 bg-primary-foreground" />}
      </span>
      {children}
    </label>
  );
}
