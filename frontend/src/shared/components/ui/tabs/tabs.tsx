import { createContext, useContext, useState } from "react";
import { cn } from "@/shared/lib/cn";
import type {
  TabsContentProps,
  TabsListProps,
  TabsProps,
  TabsTriggerProps,
} from "./tabs.types";

// ── Context ───────────────────────────────────────────────────────────────

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs subcomponent used outside <Tabs>");
  return ctx;
}

// ── Tabs root ─────────────────────────────────────────────────────────────
// ref is a normal prop (React 19) — never forwardRef.

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;

  function handleValueChange(newValue: string) {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  }

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div data-slot="tabs" className={cn("flex flex-col", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// ── TabsList ──────────────────────────────────────────────────────────────

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      data-slot="tabs-list"
      className={cn("flex gap-0 border-b border-border", className)}
      {...props}
    />
  );
}

// ── TabsTrigger ───────────────────────────────────────────────────────────
// Underline + inverted-text active state — the terminal-cleanest of the two
// options in the migration brief (full invert reads too heavy in a tab strip).

export function TabsTrigger({
  value,
  className,
  count,
  children,
  ...props
}: TabsTriggerProps) {
  const { value: activeValue, onValueChange } = useTabsContext();
  const isSelected = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      data-slot="tabs-trigger"
      onClick={() => onValueChange(value)}
      className={cn(
        "-mb-px inline-flex items-center gap-1 border-b-2 px-4 py-2 text-sm uppercase tracking-wider",
        "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    >
      {/* ▸ active marker — terminal-style selection cue */}
      {isSelected && (
        <span className="select-none" aria-hidden="true">
          ▸
        </span>
      )}
      {children}
      {count !== undefined && (
        <span
          className={cn(isSelected ? "text-primary" : "text-muted-foreground")}
          aria-label={`${count} itens`}
        >
          [{count}]
        </span>
      )}
    </button>
  );
}

// ── TabsContent ───────────────────────────────────────────────────────────

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const { value: activeValue } = useTabsContext();
  const isActive = activeValue === value;

  if (!isActive) return null;

  return (
    <div role="tabpanel" data-slot="tabs-content" className={cn("pt-4", className)} {...props}>
      {children}
    </div>
  );
}
