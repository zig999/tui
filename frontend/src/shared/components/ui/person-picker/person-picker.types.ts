import type { ComponentProps } from "react";

// A single selectable person. `avatarUrl` is optional — when absent, the
// component renders a bordered initials box instead (see MIGRATION note in
// person-picker.tsx).
export interface PersonPickerOption {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface PersonPickerProps
  extends Omit<ComponentProps<"div">, "onChange" | "value"> {
  /** Candidate people to choose from. Presentational — caller owns fetching. */
  people: PersonPickerOption[];
  /** Selected person id, or null when nothing is selected. */
  value: string | null;
  onChange: (id: string | null) => void;
  /** Called with the current search query on every keystroke. Optional hook
   * for callers that want to drive server-side search; the component always
   * also narrows `people` locally by name as a client-side fallback. */
  onSearch?: (query: string) => void;
  /** Shows a loading row inside the dropdown instead of the list. */
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}
