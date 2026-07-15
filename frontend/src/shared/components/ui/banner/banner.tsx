import { cn } from "@/shared/lib/cn";
import { Panel } from "@/shared/components/ui/panel";
import type { BannerProps, BannerTitleLevel } from "./banner.types";

// Semantic tokens only. The two frame modes render distinct trees, so there is
// no CVA — a single className expression suffices per branch.
const TITLE_CLASSES = "text-4xl font-bold tracking-wider text-foreground";
const SUBTITLE_CLASSES = "text-sm text-muted-foreground";

// Panel accepts titleLevel 2 | 3 | 4. Banner's titleLevel range is 1 | 2 | 3
// (page-level heading contract). When we delegate to Panel we clamp the outer
// notched-label heading level to something Panel accepts while keeping the
// visible body <h1>/<h2>/<h3> at the user-requested level (double-render is
// intentional per spec §3.1).
const PANEL_LEVEL_FOR: Record<BannerTitleLevel, 2 | 3> = {
  1: 2,
  2: 2,
  3: 3,
};

function BodyHeading({
  level,
  children,
}: {
  level: BannerTitleLevel;
  children: string;
}) {
  const Tag = ({ 1: "h1", 2: "h2", 3: "h3" } as const)[level];
  return <Tag className={TITLE_CLASSES}>{children}</Tag>;
}

// ref is a normal prop (React 19). No forwardRef.
export function Banner({
  title,
  subtitle,
  action,
  logo,
  frame = "none",
  accent = "default",
  titleLevel = 1,
  className,
  ...props
}: BannerProps) {
  if (frame === "notched") {
    // Delegate the frame + aria-labelledby wiring to Panel. `accent` is
    // forwarded here; the body still renders the user-visible heading at the
    // requested level (spec §3.1 — the double-render is intentional).
    return (
      <Panel
        title={title}
        accent={accent}
        titleLevel={PANEL_LEVEL_FOR[titleLevel]}
        className={cn("relative", className)}
        // Passthrough: the overlap between ComponentProps<"header"> and
        // ComponentProps<"section"> (className, id, style, aria-*, data-*,
        // etc.) is what consumers actually pass. Header-only attributes are
        // not expected on Banner-as-Panel; the runtime forwards whatever
        // arrives.
        {...props}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          {logo != null && <div aria-hidden="true">{logo}</div>}
          <BodyHeading level={titleLevel}>{title}</BodyHeading>
          {subtitle != null && <p className={SUBTITLE_CLASSES}>{subtitle}</p>}
        </div>
        {action != null && (
          <div className="absolute right-4 top-4">{action}</div>
        )}
      </Panel>
    );
  }

  // frame === "none" — full-width strip. accent is a no-op here (spec §3.1).
  // Reference the unused arg once so ESLint stays quiet without a directive.
  void accent;

  return (
    <header
      data-slot="banner"
      className={cn(
        "relative flex items-start justify-between border-b border-border bg-surface px-4 py-6",
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 flex-col items-center gap-1 text-center">
        {logo != null && <div aria-hidden="true">{logo}</div>}
        <BodyHeading level={titleLevel}>{title}</BodyHeading>
        {subtitle != null && <p className={SUBTITLE_CLASSES}>{subtitle}</p>}
      </div>
      {action != null && <div className="absolute right-4 top-4">{action}</div>}
    </header>
  );
}
