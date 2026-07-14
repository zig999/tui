// MIGRATION: source (2ndbrain) already received `people` as a prop — it did
// NOT actually call @tanstack/react-query inside this file (only imported
// `cn` and a sibling `Empty` component). No data-fetching code needed to be
// removed. What DID change to fit our contract:
//   - `PersonOption` (id/name/initials/color) → `PersonPickerOption`
//     (id/name/avatarUrl?) per the target prop shape requested for this
//     migration; initials are now derived from `name`, and there is no
//     per-person color from the caller.
//   - The colored circular Avatar (inline styles, arbitrary hex color) was
//     replaced by a sharp bordered initials box using semantic tokens only
//     (no Radix Avatar dependency added) — falls back to an <img> when
//     `avatarUrl` is provided.
//   - Added `loading?` (renders a loading row in the dropdown) and
//     `onSearch?` (notifies the caller of the raw query on every keystroke,
//     e.g. to drive server-side search) — the component still also narrows
//     `people` locally by name as a client-side fallback filter.
//   - The inline "clear" control is no longer nested inside the trigger
//     <button> (source had a `span role="button"` inside a `<button>`,
//     which is an invalid/inaccessible nested-interactive-control pattern).
//     It is now a sibling `<button>` absolutely positioned over the trigger.
//   - `ref` is a normal prop (React 19) — never `forwardRef`.
//   - Sharp corners, no `font-mono` (monospace is global), inverted
//     bg-primary/text-primary-foreground for the focused/selected row.

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, Ref } from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { PersonPickerOption, PersonPickerProps } from "./person-picker.types";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

function assignRef<T>(ref: Ref<T> | null | undefined, node: T | null): void {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref) {
    (ref as { current: T | null }).current = node;
  }
}

function PersonAvatar({ person }: { person: PersonPickerOption }) {
  if (person.avatarUrl) {
    return (
      <img
        src={person.avatarUrl}
        alt=""
        aria-hidden="true"
        className="h-8 w-8 shrink-0 border border-border object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 select-none items-center justify-center border border-border bg-elevated text-xs font-semibold text-foreground"
    >
      {initialsOf(person.name)}
    </span>
  );
}

export function PersonPicker({
  people,
  value,
  onChange,
  onSearch,
  loading = false,
  placeholder = "Selecionar pessoa...",
  disabled = false,
  className,
  ref,
  ...props
}: PersonPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedPerson = people.find((p) => p.id === value) ?? null;

  const filtered = search.trim()
    ? people.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()))
    : people;

  // Click outside closes the dropdown.
  useEffect(() => {
    function handleMouseDown(e: globalThis.MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
        setFocusedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // Focus search input when the dropdown opens.
  useEffect(() => {
    if (!isOpen) return undefined;
    const id = setTimeout(() => searchRef.current?.focus(), 0);
    return () => clearTimeout(id);
  }, [isOpen]);

  // Scroll the keyboard-focused item into view.
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[focusedIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  function open() {
    if (disabled) return;
    setIsOpen(true);
    setSearch("");
    setFocusedIndex(-1);
  }

  function close() {
    setIsOpen(false);
    setSearch("");
    setFocusedIndex(-1);
  }

  function handleSelect(person: PersonPickerOption) {
    onChange(person.id);
    close();
  }

  function handleClear(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onChange(null);
  }

  function handleSearchChange(query: string) {
    setSearch(query);
    setFocusedIndex(-1);
    onSearch?.(query);
  }

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const person = filtered[focusedIndex];
      if (focusedIndex >= 0 && person) {
        handleSelect(person);
      }
    } else if (e.key === "Escape" || e.key === "Tab") {
      close();
    }
  }

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        assignRef(ref, node);
      }}
      data-slot="person-picker"
      className={cn("relative w-full", className)}
      {...props}
    >
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={open}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "flex w-full items-center justify-between gap-2 border bg-elevated px-3 py-2 text-left text-sm text-foreground transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          selectedPerson && "pr-9",
          isOpen ? "border-primary" : "border-border hover:border-border-strong",
          disabled && "pointer-events-none cursor-not-allowed opacity-50",
        )}
      >
        {selectedPerson ? (
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <PersonAvatar person={selectedPerson} />
            <span className="truncate">{selectedPerson.name}</span>
          </span>
        ) : (
          <span className="flex-1 text-muted-foreground">{placeholder}</span>
        )}
      </button>

      {/* Clear — sibling button, not nested inside the trigger (a11y). */}
      {selectedPerson && !disabled && (
        <button
          type="button"
          aria-label="Limpar seleção"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full border border-border bg-elevated">
          <div className="px-3 pb-1 pt-2">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar..."
              className={cn(
                "w-full border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground",
                "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring",
              )}
            />
          </div>

          <ul ref={listRef} role="listbox" className="max-h-52 overflow-auto py-1">
            {loading ? (
              <li
                role="presentation"
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
                Carregando...
              </li>
            ) : filtered.length > 0 ? (
              filtered.map((person, index) => {
                const isActive = focusedIndex === index || person.id === value;
                return (
                  <li
                    key={person.id}
                    role="option"
                    aria-selected={person.id === value}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-hover",
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(person);
                    }}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <PersonAvatar person={person} />
                    <span className="truncate">{person.name}</span>
                  </li>
                );
              })
            ) : (
              <li role="presentation" className="px-3 py-2 text-sm text-muted-foreground">
                Nenhum resultado encontrado.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

PersonPicker.displayName = "PersonPicker";
