import type { ReactNode } from "react";

export interface KbdProps {
  /** Key label or symbol */
  children: ReactNode;
  /** sm: tighter padding | md (default): standard padding */
  size?: "sm" | "md";
  /** Passthrough for spacing overrides */
  className?: string;
}
