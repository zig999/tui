import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, Ref } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { SelectOption, SelectProps } from "./select.types";

// MIGRATION: source `select.tsx` let each option carry an arbitrary caller-supplied
// CSS color (`color`/`bg`/`dot`) for a semantic status dot. That conflicts with the
// "semantic tokens only, never raw values" rule and with the brief's terminal
// aesthetic (highlighted option simply inverts bg-primary/text-primary-foreground),
// so those props were dropped. Also dropped the `Empty` sibling component for the
// no-options state (out of scope for this migration) in favor of a plain muted
// message with the same wording.

function setRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    (ref as { current: T | null }).current = value;
  }
}

// ref is a normal prop (React 19) — never forwardRef.
export function Select({
  ref,
  value,
  onChange,
  options,
  placeholder = "Selecionar...",
  disabled = false,
  className,
  ...props
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.value === value) ?? null;

  // Click outside closes the dropdown.
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // Keep the keyboard-focused option in view.
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[focusedIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    const navigable = options.filter((o) => !o.disabled);
    const currentNavIndex =
      focusedIndex >= 0 ? navigable.findIndex((o) => o === options[focusedIndex]) : -1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(0);
        return;
      }
      const nextNavIndex = currentNavIndex < navigable.length - 1 ? currentNavIndex + 1 : 0;
      setFocusedIndex(options.indexOf(navigable[nextNavIndex]));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(options.length - 1);
        return;
      }
      const nextNavIndex = currentNavIndex > 0 ? currentNavIndex - 1 : navigable.length - 1;
      setFocusedIndex(options.indexOf(navigable[nextNavIndex]));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      if (focusedIndex >= 0 && !options[focusedIndex]?.disabled) {
        onChange(options[focusedIndex].value);
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setFocusedIndex(-1);
    } else if (e.key === "Tab") {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  }

  function handleOpen() {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (!isOpen) setFocusedIndex(-1);
  }

  function handleSelect(opt: SelectOption) {
    if (opt.disabled) return;
    onChange(opt.value);
    setIsOpen(false);
    setFocusedIndex(-1);
  }

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        setRef(ref, node);
      }}
      data-slot="select"
      className={cn("relative w-full", className)}
      {...props}
    >
      {/* Trigger */}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-slot="select-trigger"
        data-value={value ?? ""}
        disabled={disabled}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 border bg-elevated px-3 text-sm text-foreground",
          "transition-colors outline-none motion-reduce:transition-none",
          "focus-visible:ring-2 focus-visible:ring-ring",
          isOpen ? "border-primary" : "border-border hover:border-border-strong",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span className="min-w-0 truncate">
          {selectedOption ? (
            <span className="truncate text-foreground">{selectedOption.label}</span>
          ) : (
            <span className="truncate text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          aria-hidden="true"
          size={14}
          className={cn(
            "shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <ul
          role="listbox"
          ref={listRef}
          data-slot="select-content"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto border border-border bg-elevated py-1"
        >
          {options.length === 0 ? (
            <li role="presentation" className="px-3 py-2 text-sm text-muted-foreground">
              Nenhuma opção disponível.
            </li>
          ) : (
            options.map((opt, index) => {
              const isSelected = opt.value === value;
              const isFocused = focusedIndex === index;

              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                  data-slot="select-item"
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors motion-reduce:transition-none",
                    opt.disabled
                      ? "cursor-not-allowed opacity-40"
                      : isFocused
                        ? "cursor-pointer bg-primary text-primary-foreground"
                        : "cursor-pointer text-foreground",
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(opt);
                  }}
                  onMouseEnter={() => {
                    if (!opt.disabled) setFocusedIndex(index);
                  }}
                >
                  <span className="min-w-0 truncate">{opt.label}</span>
                  {isSelected && (
                    <Check
                      aria-hidden="true"
                      size={14}
                      className={cn(
                        "shrink-0",
                        isFocused ? "text-primary-foreground" : "text-primary",
                      )}
                    />
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
