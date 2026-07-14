import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { ButtonProps } from "./button.types";

// CVA defined at module scope — never inside the render body (Component Contract).
// TUI aesthetic: 1px box border, sharp corners, uppercase, invert on hover
// (like a terminal selection). Colors are semantic tokens only.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 border font-medium tracking-wider uppercase transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary",
        secondary:
          "border-border bg-surface text-foreground hover:border-border-strong hover:bg-elevated hover:text-primary",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-hover hover:text-primary",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:bg-transparent hover:text-destructive",
        outline:
          "border-border bg-transparent text-foreground hover:border-primary hover:text-primary",
      },
      size: {
        sm: "h-7 px-2 text-xs",
        md: "h-9 px-3 text-sm",
        lg: "h-11 px-4 text-base",
        icon: "h-9 w-9 p-0",
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
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <Loader2
          className="h-4 w-4 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
      {children}
    </Comp>
  );
}
