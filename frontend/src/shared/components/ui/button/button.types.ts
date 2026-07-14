import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "./button";

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render as the single child element (Radix Slot) instead of a <button>. */
    asChild?: boolean;
    /** Shows a spinner and disables the button while true. */
    loading?: boolean;
  };
