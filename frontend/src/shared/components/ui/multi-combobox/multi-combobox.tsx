// MIGRATION: the source component (2ndbrain `multi-combobox.tsx`) used
// @tanstack/react-query internally (`entity.searchFn` + `useQuery`) to fetch
// options, plus a "creatable" mode that ran an async `onCreate` mutation.
// Both violate the shared-primitive contract (no data fetching/mutations
// inside `shared/components/ui/`). This version is fully presentational:
//   - `options` is supplied by the caller (a static list, or the result of
//     the caller's own TanStack Query hook living in `features/*/api/`).
//   - `onSearch(query)` is an optional hook so a caller can drive server-side
//     search (refetch `options` on change); the component ALSO narrows
//     `options` locally by label as a client-side fallback — same contract
//     as the `person-picker` primitive.
//   - `loading` replaces the internal `isLoading`/`isError` query state.
//   - The "creatable" (inline create-new-item) mode was dropped — it required
//     an async `onCreate` mutation, which belongs in a feature hook composed
//     around this primitive, not in the primitive itself.
//   - `minChars`/debounce were dropped — throttling network calls is the
//     caller's concern (e.g. inside the query hook that feeds `onSearch`).
//   - Selection is now `value: string[]` (controlled) instead of an
//     uncontrolled `initialItems` + emitted delta object.

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type {
  MultiComboboxOption,
  MultiComboboxProps,
} from "./multi-combobox.types";

// ref is a normal prop (React 19) — never forwardRef. It is forwarded to the
// root element via the `...props` rest spread, mirroring the Button primitive.
export function MultiCombobox({
  className,
  options,
  value,
  onChange,
  onSearch,
  loading = false,
  label,
  placeholder = "Buscar...",
  disabled = false,
  maxItems,
  error,
  ...props
}: MultiComboboxProps) {
  const reactId = useId();
  const inputId = `${reactId}-input`;
  const listboxId = `${reactId}-listbox`;
  const errorId = `${reactId}-error`;

  const inputRef = useRef<HTMLInputElement>(null);
  const activeItemRef = useRef<HTMLLIElement>(null);
  // Caches labels for values that were selected while their option was
  // visible, so chips keep a readable label even after `options` narrows
  // (e.g. server-side search removed that option from the current page).
  const knownOptionsRef = useRef(new Map<string, MultiComboboxOption>());
  for (const option of options) knownOptionsRef.current.set(option.value, option);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const atMaxItems = maxItems !== undefined && value.length >= maxItems;
  const queryTrimmed = query.trim().toLowerCase();
  const availableOptions = options.filter(
    (option) =>
      !value.includes(option.value) &&
      (queryTrimmed === "" || option.label.toLowerCase().includes(queryTrimmed)),
  );
  const showDropdown = open && !disabled && !atMaxItems;

  const selectedOptions = value.map(
    (v) => knownOptionsRef.current.get(v) ?? { value: v, label: v },
  );

  const selectOption = useCallback(
    (option: MultiComboboxOption) => {
      if (value.includes(option.value)) return;
      onChange([...value, option.value]);
      setQuery("");
      onSearch?.("");
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.focus();
    },
    [value, onChange, onSearch],
  );

  const removeOption = useCallback(
    (val: string) => {
      onChange(value.filter((v) => v !== val));
      inputRef.current?.focus();
    },
    [value, onChange],
  );

  // Scroll the active option into view on keyboard navigation.
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      setActiveIndex(-1);
      onSearch?.(val);
      setOpen(val.length > 0);
    },
    [onSearch],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!open) setOpen(true);
        if (availableOptions.length > 0) {
          setActiveIndex((prev) => (prev < availableOptions.length - 1 ? prev + 1 : 0));
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (availableOptions.length > 0) {
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : availableOptions.length - 1));
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (open && activeIndex >= 0 && activeIndex < availableOptions.length) {
          selectOption(availableOptions[activeIndex]);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
      } else if (e.key === "Backspace" && query === "" && value.length > 0) {
        removeOption(value[value.length - 1]);
      } else if (e.key === "Tab") {
        setOpen(false);
        setActiveIndex(-1);
      }
    },
    [open, availableOptions, activeIndex, query, value, selectOption, removeOption],
  );

  let activeDescendantId: string | undefined;
  if (activeIndex >= 0 && activeIndex < availableOptions.length) {
    activeDescendantId = `${reactId}-option-${availableOptions[activeIndex].value}`;
  }

  return (
    <div
      data-slot="multi-combobox"
      className={cn("relative", disabled && "pointer-events-none opacity-50", className)}
      {...props}
      onBlur={(e) => {
        // Closes on outside click/focus-away. Works without a dedicated
        // container ref because React's onBlur bubbles from focusout, and
        // `ref` here is reserved for forwarding (see Component Contract).
        props.onBlur?.(e);
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      }}
    >
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 border bg-elevated px-3 py-2",
          error
            ? "border-destructive"
            : "border-border focus-within:border-border-strong",
        )}
        onClick={() => {
          if (!disabled && !atMaxItems) inputRef.current?.focus();
        }}
      >
        {selectedOptions.map((option) => (
          <span
            key={option.value}
            className="inline-flex items-center gap-1 border border-border bg-surface px-2 py-0.5 text-xs text-foreground"
          >
            {option.label}
            <button
              type="button"
              aria-label={`Remover ${option.label}`}
              className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              onClick={(e) => {
                e.stopPropagation();
                removeOption(option.value);
              }}
              tabIndex={disabled ? -1 : 0}
            >
              <X size={14} />
            </button>
          </span>
        ))}

        {!atMaxItems && (
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-activedescendant={activeDescendantId}
            aria-busy={loading}
            aria-describedby={error ? errorId : undefined}
            disabled={disabled}
            value={query}
            placeholder={value.length === 0 ? placeholder : ""}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.length > 0) setOpen(true);
            }}
            className="min-w-[80px] flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        )}
      </div>

      {atMaxItems && (
        <p className="mt-1 text-xs text-muted-foreground">
          Limite de {maxItems} itens atingido
        </p>
      )}

      {error && (
        <p id={errorId} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}

      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto border border-border bg-elevated"
        >
          {loading ? (
            <li className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <Loader2 size={16} className="shrink-0 animate-spin motion-reduce:animate-none" />
              Buscando...
            </li>
          ) : availableOptions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              {queryTrimmed ? "Nenhuma opção encontrada" : "Nenhuma opção disponível"}
            </li>
          ) : (
            availableOptions.map((option, index) => {
              const isActive = index === activeIndex;
              return (
                <li
                  key={option.value}
                  id={`${reactId}-option-${option.value}`}
                  ref={isActive ? activeItemRef : undefined}
                  role="option"
                  aria-selected={isActive}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm transition-colors motion-reduce:transition-none",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-hover",
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectOption(option);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div>{option.label}</div>
                  {option.sublabel && (
                    <div
                      className={cn(
                        "text-xs",
                        isActive ? "text-primary-foreground" : "text-muted-foreground",
                      )}
                    >
                      {option.sublabel}
                    </div>
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

MultiCombobox.displayName = "MultiCombobox";
