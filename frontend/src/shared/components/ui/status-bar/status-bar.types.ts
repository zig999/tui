import type { ComponentProps, ReactNode } from "react";

/**
 * Props for the {@link StatusBar} component.
 *
 * Native `role` is excluded from passthrough because the typed `role` prop
 * below constrains the allowed landmark/live-region values.
 */
export interface StatusBarProps extends Omit<ComponentProps<"div">, "role"> {
  /** Left-aligned slot. Typical content: mode indicator, primary status. */
  left?: ReactNode;
  /** Center-aligned slot. Typical content: current filter / active dataset / breadcrumb summary. */
  center?: ReactNode;
  /** Right-aligned slot. Typical content: timestamp, connection state, keyboard hint. */
  right?: ReactNode;
  /**
   * Accessible name for the root landmark.
   *
   * @default "Status bar"
   */
  ariaLabel?: string;
  /**
   * Landmark / live-region role.
   *
   * - `"status"` (default): announces content changes politely (implicit `aria-live="polite"`).
   * - `"contentinfo"`: labels the bar as a page-level footer landmark.
   * - `"none"`: no ARIA role — the bar is decorative.
   *
   * @default "status"
   */
  role?: "status" | "contentinfo" | "none";
}
