import { useState } from "react";
import { cva } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { AlertProps, AlertVariant } from "./alert.types";

// CVA defined at module scope — never inside the render body (Component Contract).
// Terminal style: border-l-2 border-<intent>, bg-surface, lucide icon + text-<intent> title.
export const alertVariants = cva("relative flex gap-3 border-l-2 bg-surface p-4", {
  variants: {
    variant: {
      info: "border-info",
      success: "border-success",
      warning: "border-warning",
      destructive: "border-destructive",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

const VARIANT_ICON = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: XCircle,
} as const satisfies Record<AlertVariant, typeof Info>;

const VARIANT_TEXT_CLASS: Record<AlertVariant, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

const DEFAULT_ROLE: Record<AlertVariant, "alert" | "status"> = {
  info: "status",
  success: "status",
  warning: "alert",
  destructive: "alert",
};

// ref is a normal prop (React 19) — never forwardRef.
export function Alert({
  variant,
  title,
  children,
  action,
  dismissible = false,
  className,
  role,
  ...props
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const resolvedVariant = variant ?? "info";
  const Icon = VARIANT_ICON[resolvedVariant];
  const textClass = VARIANT_TEXT_CLASS[resolvedVariant];

  return (
    <div
      role={role ?? DEFAULT_ROLE[resolvedVariant]}
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", textClass)} aria-hidden="true" />

      <div className="flex flex-1 flex-col gap-1">
        {title && (
          <span className={cn("text-xs font-semibold uppercase tracking-wider", textClass)}>
            {title}
          </span>
        )}
        {children && <div className="text-sm text-foreground">{children}</div>}
        {action && <div className="mt-1">{action}</div>}
      </div>

      {dismissible && (
        <button
          type="button"
          aria-label="Fechar aviso"
          className="absolute right-2 top-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setDismissed(true)}
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
