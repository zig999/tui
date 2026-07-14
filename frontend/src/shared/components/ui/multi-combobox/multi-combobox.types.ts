import type { ComponentProps } from "react";

// One selectable option. Presentational — caller owns fetching/filtering the
// data source (see MIGRATION note in multi-combobox.tsx).
export interface MultiComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface MultiComboboxProps
  extends Omit<ComponentProps<"div">, "onChange" | "value"> {
  /** Candidate options to choose from. Presentational — caller owns fetching. */
  options: MultiComboboxOption[];
  /** Selected option values, in selection order. */
  value: string[];
  onChange: (value: string[]) => void;
  /** Called with the current search query on every keystroke. Optional hook
   * for callers that want to drive server-side search; the component always
   * also narrows `options` locally by label as a client-side fallback (same
   * contract as the person-picker primitive). */
  onSearch?: (query: string) => void;
  /** Shows a loading row inside the dropdown instead of the option list. */
  loading?: boolean;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Max number of selected items. Once reached, the search input is hidden. */
  maxItems?: number;
  error?: string;
}
