import type { KeyboardEvent, Ref, RefCallback, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { DatePickerProps, DateTimePickerProps } from "./date-picker.types";

// MIGRATION notes (source: 2ndbrain/src/components/ui/date-picker.tsx, 483 lines):
// - framer-motion -> motion/react (`motion/react` re-exports the framer-motion
//   API 1:1, so AnimatePresence + motion.div are unchanged). Kept the panel
//   animation to opacity + a 4px y-transform, per the "minimal" bar.
// - date-fns was never used by the source (native Date arithmetic) — no change.
// - Dropped every `font-mono` class: monospace is global (theme.css), never
//   set per component here.
// - Dropped `rounded-[var(--radius-*)]` everywhere: our radius tokens are 0
//   (sharp corners by default) — omitting the class already yields square
//   corners, matching the button.tsx precedent.
// - Dropped the popover's `shadow-[var(--shadow-md)]` and the trigger's
//   `[box-shadow:var(--shadow-glow-teal)]` focus glow: flat surfaces only,
//   global CRT phosphor glow already comes from theme.css; focus now uses
//   `focus-visible:ring-2 focus-visible:ring-ring` instead.
// - Re-themed per the token map: popover -> bg-elevated border-border,
//   selected day -> bg-primary text-primary-foreground (invert), today ->
//   border-primary, outside/muted days -> text-muted-foreground, hover ->
//   bg-hover, focused-cell ring -> ring-ring.
// - Added `ref` as a normal prop (Component Contract) merged with the
//   internal click-outside ref via a small local `mergeRefs` — the source
//   never exposed a ref at all.
// - Kept pt-BR strings (month names, day headers, aria-labels) verbatim:
//   i18n is off project-wide (single-owner, pt-BR only).
// - Kept `DateTimePicker` as a thin wrapper (same as source) since it added
//   no extra surface area beyond the `showTime` prop already on DatePicker.

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const MONTHS_ABBREV = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

const DAY_HEADERS = ["D", "S", "T", "Q", "Q", "S", "S"];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(date: Date, showTime?: boolean): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mmm = MONTHS_ABBREV[date.getMonth()];
  const yyyy = date.getFullYear();
  if (showTime) {
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${dd} / ${mmm} / ${yyyy}  ${hh}:${min}`;
  }
  return `${dd} / ${mmm} / ${yyyy}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Build the 6x7 calendar grid cells for a given month/year. */
function buildCalendarCells(
  year: number,
  month: number,
): Array<{ date: Date; inMonth: boolean }> {
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay(); // 0 = Sunday
  const cells: Array<{ date: Date; inMonth: boolean }> = [];

  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month, -i), inMonth: false });
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }

  let trailing = 1;
  while (cells.length < 42) {
    cells.push({ date: new Date(year, month + 1, trailing++), inMonth: false });
  }

  return cells;
}

function mergeRefs(
  externalRef: Ref<HTMLDivElement> | undefined,
  internalRef: RefObject<HTMLDivElement | null>,
): RefCallback<HTMLDivElement> {
  return (node) => {
    internalRef.current = node;
    if (typeof externalRef === "function") {
      externalRef(node);
    } else if (externalRef) {
      externalRef.current = node;
    }
  };
}

// ─── TimeSpinInput (internal, not part of the public surface) ─────────────

interface TimeSpinInputProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function TimeSpinInput({ value, min, max, onChange }: TimeSpinInputProps) {
  const spinButtonClassName = cn(
    "flex h-5 w-8 items-center justify-center text-muted-foreground",
    "transition-colors hover:bg-hover hover:text-foreground",
  );
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        type="button"
        tabIndex={-1}
        onClick={() => onChange(value >= max ? min : value + 1)}
        className={spinButtonClassName}
        aria-label="Incrementar"
      >
        <ChevronUp size={12} />
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) =>
          onChange(Math.min(max, Math.max(min, Number(e.target.value))))
        }
        className={cn(
          "w-10 border border-border bg-surface py-0.5 text-center text-sm text-foreground",
          "focus:border-border-strong focus:outline-none",
          "[appearance:textfield]",
          "[&::-webkit-inner-spin-button]:appearance-none",
          "[&::-webkit-outer-spin-button]:appearance-none",
        )}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => onChange(value <= min ? max : value - 1)}
        className={spinButtonClassName}
        aria-label="Decrementar"
      >
        <ChevronDown size={12} />
      </button>
    </div>
  );
}

// ─── DatePicker ─────────────────────────────────────────────────────────────

export function DatePicker({
  ref,
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  showTime = false,
  ...props
}: DatePickerProps) {
  const defaultPlaceholder = showTime
    ? "⌖ dd / mmm / aaaa  hh:mm"
    : "⌖ dd / mmm / aaaa";
  const resolvedPlaceholder = placeholder ?? defaultPlaceholder;
  const today = startOfDay(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? today.getMonth());
  const [focusedDate, setFocusedDate] = useState<Date>(value ?? today);
  const [timeHour, setTimeHour] = useState(value?.getHours() ?? 0);
  const [timeMinute, setTimeMinute] = useState(value?.getMinutes() ?? 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // ── Click outside ─────────────────────────────────────────────────────
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // ── Sync view when value changes externally ─────────────────────────────
  useEffect(() => {
    if (value) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
      if (showTime) {
        setTimeHour(value.getHours());
        setTimeMinute(value.getMinutes());
      }
    }
  }, [value, showTime]);

  // ── Auto-focus popover when it opens ─────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => popoverRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  function handleOpen() {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    const base = value ?? today;
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setFocusedDate(base);
  }

  function navigateFocusedDate(newDate: Date) {
    setFocusedDate(newDate);
    if (newDate.getMonth() !== viewMonth || newDate.getFullYear() !== viewYear) {
      setViewMonth(newDate.getMonth());
      setViewYear(newDate.getFullYear());
    }
  }

  function handlePopoverKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const d = new Date(focusedDate);
      d.setDate(d.getDate() - 1);
      navigateFocusedDate(d);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const d = new Date(focusedDate);
      d.setDate(d.getDate() + 1);
      navigateFocusedDate(d);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const d = new Date(focusedDate);
      d.setDate(d.getDate() - 7);
      navigateFocusedDate(d);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const d = new Date(focusedDate);
      d.setDate(d.getDate() + 7);
      navigateFocusedDate(d);
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectDate(focusedDate);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function selectDate(date: Date) {
    if (showTime) {
      onChange(new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeHour, timeMinute));
    } else {
      onChange(startOfDay(date));
    }
    setIsOpen(false);
  }

  function selectToday() {
    selectDate(today);
  }

  function selectTomorrow() {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    selectDate(d);
  }

  function selectPlus7() {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    selectDate(d);
  }

  function clearDate() {
    onChange(null);
    setIsOpen(false);
  }

  const cells = buildCalendarCells(viewYear, viewMonth);

  return (
    <div
      ref={mergeRefs(ref, containerRef)}
      data-slot="date-picker"
      className={cn("relative w-full", className)}
      {...props}
    >
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={cn(
          "flex w-full items-center border bg-elevated px-3 py-2 text-left text-sm",
          "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          isOpen ? "border-primary" : "border-border hover:border-border-strong",
        )}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value ? `⌖ ${formatDate(value, showTime)}` : resolvedPlaceholder}
        </span>
      </button>

      {/* Calendar popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            role="dialog"
            aria-label="Selecionar data"
            tabIndex={0}
            onKeyDown={handlePopoverKeyDown}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 z-20 mt-1 w-72 border border-border bg-elevated p-4 outline-none"
          >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Mês anterior"
              >
                ◂
              </button>
              <span className="text-xs uppercase tracking-wider text-foreground">
                {MONTHS_PT[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Próximo mês"
              >
                ▸
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="mb-1 grid grid-cols-7">
              {DAY_HEADERS.map((d, i) => (
                <div
                  key={i}
                  className="flex h-6 items-center justify-center text-xs uppercase text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {cells.map(({ date, inMonth }, i) => {
                const isToday = isSameDay(date, today);
                const isSelected = value ? isSameDay(date, value) : false;
                const isFocused = isSameDay(date, focusedDate);
                const isOtherMonth = !inMonth;

                return (
                  <button
                    key={i}
                    type="button"
                    tabIndex={-1}
                    onClick={() => selectDate(date)}
                    className={cn(
                      "mx-auto flex h-8 w-8 items-center justify-center border border-transparent text-sm transition-colors",
                      isOtherMonth && "text-muted-foreground opacity-40",
                      !isOtherMonth && !isSelected && "text-foreground hover:bg-hover",
                      isToday && !isSelected && "border-primary",
                      isSelected && "border-transparent bg-primary text-primary-foreground",
                      isFocused && !isSelected && "ring-2 ring-ring",
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Time picker (showTime only) */}
            {showTime && (
              <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">Hora</span>
                <TimeSpinInput
                  value={timeHour}
                  min={0}
                  max={23}
                  onChange={(h) => {
                    setTimeHour(h);
                    if (value) {
                      onChange(new Date(value.getFullYear(), value.getMonth(), value.getDate(), h, timeMinute));
                    }
                  }}
                />
                <span className="self-center text-sm text-muted-foreground">:</span>
                <TimeSpinInput
                  value={timeMinute}
                  min={0}
                  max={59}
                  onChange={(m) => {
                    setTimeMinute(m);
                    if (value) {
                      onChange(new Date(value.getFullYear(), value.getMonth(), value.getDate(), timeHour, m));
                    }
                  }}
                />
              </div>
            )}

            {/* Quick picks */}
            <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-border pt-3">
              <button
                type="button"
                onClick={selectToday}
                className="px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                hoje
              </button>
              <button
                type="button"
                onClick={selectTomorrow}
                className="px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                amanhã
              </button>
              <button
                type="button"
                onClick={selectPlus7}
                className="px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                +7d
              </button>
              <button
                type="button"
                onClick={clearDate}
                className="ml-auto px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                limpar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── DateTimePicker ─────────────────────────────────────────────────────────

export function DateTimePicker({ ref, ...props }: DateTimePickerProps) {
  return <DatePicker ref={ref} {...props} showTime />;
}
