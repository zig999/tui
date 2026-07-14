import type { ReactNode } from "react";

export type TooltipProviderProps = {
  children: ReactNode;
  /** Delay (ms) before the tooltip opens on hover/focus — defaults to 200 */
  delayDuration?: number;
};

export type TooltipProps = {
  /** Trigger element — must accept a ref (Radix `asChild` requirement) */
  children: ReactNode;
  /** Tooltip body text */
  content: string;
  /** Preferred side relative to the trigger — defaults to "right" */
  side?: "top" | "right" | "bottom" | "left";
  /** When true, renders children with no tooltip wrapping */
  disabled?: boolean;
  className?: string;
};
