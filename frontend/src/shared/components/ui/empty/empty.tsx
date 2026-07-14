import { cva } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";
import type { EmptyProps } from "./empty.types";

// CVA defined at module scope — never inside the render body (Component Contract).
export const emptyVariants = cva("flex flex-col items-center justify-center text-center", {
  variants: {
    size: {
      sm: "p-6",
      md: "p-8",
      lg: "p-12",
    },
    bordered: {
      true: "border border-dashed border-border",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    bordered: true,
  },
});

// ref is a normal prop (React 19) — never forwardRef.
export function Empty({
  icon = "○",
  title,
  description,
  action,
  bordered,
  size,
  className,
  ...props
}: EmptyProps) {
  const isStringIcon = typeof icon === "string";
  const isSmall = size === "sm";

  return (
    <div
      data-slot="empty"
      className={cn(emptyVariants({ size, bordered }), className)}
      {...props}
    >
      <div
        className={cn(
          "mb-4 flex items-center justify-center text-muted-foreground",
          isSmall ? "size-8 text-3xl" : "size-10 text-4xl",
        )}
      >
        {isStringIcon ? (
          <span aria-hidden="true" className="leading-none">
            {icon}
          </span>
        ) : (
          icon
        )}
      </div>

      <span className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
        {title}
      </span>

      {description && (
        <p className="mb-4 max-w-xs text-xs leading-relaxed text-foreground">{description}</p>
      )}

      {action && <div className={description ? undefined : "mt-4"}>{action}</div>}
    </div>
  );
}
