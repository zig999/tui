import { Panel } from "@/shared/components/ui/panel";
import { cn } from "@/shared/lib/cn";
import type { StatPanelProps } from "./stat-panel.types";

// No CVA on StatPanel — every visual axis (accent border, notched title) is
// delegated to Panel. StatPanel owns only the body layout: a centered value
// line and an optional caption below it.
//
// The value stays at `text-foreground` regardless of `accent` (spec §6/§7):
// the accent identity of the tile lives in the border + notched title, and
// tinting the value too would double-encode the intent.
export function StatPanel({
  value,
  caption,
  className,
  ...panelProps
}: StatPanelProps) {
  return (
    <Panel {...panelProps} className={className}>
      <div
        data-slot="stat-panel-body"
        className={cn("flex flex-col items-center justify-center gap-1 py-2")}
      >
        <div
          data-slot="stat-panel-value"
          className="text-3xl font-semibold text-foreground"
        >
          {String(value)}
        </div>
        {caption != null && (
          <div
            data-slot="stat-panel-caption"
            className="text-xs tracking-widest text-muted-foreground uppercase"
          >
            {caption}
          </div>
        )}
      </div>
    </Panel>
  );
}
