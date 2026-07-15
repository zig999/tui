import { cn } from "@/shared/lib/cn";
import type { StatusBarProps } from "./status-bar.types";

/**
 * Terminal-style footer strip with three fixed slots (left / center / right).
 *
 * All three slot regions render unconditionally (empty when the slot is
 * undefined) so `right` stays pinned to the right edge and `center` remains
 * truly centered even when other slots are missing — see
 * `status-bar.component.spec.md` §3.1 and §8 "Empty slot preserves layout".
 *
 * Not a `Panel`: single top border, no notched title, single visual variant
 * (no CVA).
 */
export function StatusBar({
  left,
  center,
  right,
  ariaLabel = "Status bar",
  role = "status",
  className,
  ...rest
}: StatusBarProps) {
  // role="none" removes all ARIA semantics — omit the attribute entirely so
  // assistive tech does not expose the bar as a landmark or live region
  // (spec §8 "Decorative role").
  const roleAttr = role === "none" ? undefined : role;

  return (
    <div
      {...rest}
      role={roleAttr}
      aria-label={ariaLabel}
      className={cn(
        "flex w-full items-center justify-between gap-4 border-t border-border bg-surface px-4 py-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <div className="flex flex-1 items-center justify-start gap-2">{left}</div>
      <div className="flex flex-1 items-center justify-center gap-2">{center}</div>
      <div className="flex flex-1 items-center justify-end gap-2">{right}</div>
    </div>
  );
}
