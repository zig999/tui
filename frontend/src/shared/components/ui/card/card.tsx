import { cva } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";
import type { CardProps } from "./card.types";

// MIGRATION: source (2ndbrain `card.tsx`) exports a single `Card` with
// tone/header/headerTitle/footer/padding props — there is NO CardHeader/
// CardTitle/CardContent/CardFooter subcomponent in the source file. Migrated
// as-is (slot props), no shadcn-style subcomponents invented.

// CVA defined at module scope — never inside the render body (Component Contract).
export const cardVariants = cva("border transition-colors", {
  variants: {
    tone: {
      default: "border-border bg-surface",
      elevated: "border-border bg-elevated",
      data: "border-l-2 border-info bg-surface",
      warning: "border-l-2 border-warning bg-surface",
      danger: "border-l-2 border-destructive bg-surface",
    },
    padding: {
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    },
  },
  defaultVariants: {
    tone: "default",
    padding: "md",
  },
});

// ref is a normal prop (React 19) — never forwardRef.
export function Card({
  tone,
  padding,
  header,
  headerTitle,
  footer,
  children,
  className,
  onClick,
  ...props
}: CardProps) {
  const isInteractive = typeof onClick === "function";

  const resolvedHeader =
    header ??
    (headerTitle ? (
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        <span className="text-muted-foreground" aria-hidden="true">
          {"▸"}
        </span>
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {headerTitle}
        </span>
      </div>
    ) : null);

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") onClick?.();
            }
          : undefined
      }
      data-slot="card"
      className={cn(
        cardVariants({ tone, padding }),
        isInteractive &&
          "cursor-pointer hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {resolvedHeader}
      <div>{children}</div>
      {footer && <div className="mt-3 border-t border-border pt-3">{footer}</div>}
    </div>
  );
}
