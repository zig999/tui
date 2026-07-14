import type { AnchorHTMLAttributes } from "react";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  /** When true, opens in new tab and appends the ↗ indicator */
  external?: boolean;
}
