import { cva } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";
import type { ButtonProps } from "./button.types";

// CVA defined at module scope — never inside the render body (Component Contract).
// TUI aesthetic: 1px box border, sharp corners, uppercase, invert on hover
// (like a terminal selection). Colors are semantic tokens only.
export const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 border font-medium uppercase tracking-wider transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:bg-transparent hover:text-destructive",
        outline:
          "border-border bg-transparent text-foreground hover:border-primary hover:text-primary",
      },
      size: {
        sm: "h-7 px-2 text-xs",
        md: "h-9 px-3 text-sm",
        lg: "h-11 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

// ref is a normal prop (React 19) — never forwardRef.
export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
