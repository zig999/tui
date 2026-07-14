import type { ComponentProps } from "react";

// MIGRATION: native `div` props are extended for ref/className pass-through
// (Component Contract). `onChange` is redefined below because DOMAttributes
// declares a generic `onChange?: ChangeEventHandler<T>` on every element.
export interface DatePickerProps
  extends Omit<ComponentProps<"div">, "onChange"> {
  /** Selected date, or `null` when empty. Controlled — the caller owns state. */
  value: Date | null;
  /** Fired with the newly selected date, or `null` when cleared. */
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Adds an hour/minute stepper below the calendar grid. */
  showTime?: boolean;
}

export type DateTimePickerProps = Omit<DatePickerProps, "showTime">;
