import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import type { progressFillVariants } from "./progress";

export type ProgressProps = ComponentProps<"div"> &
  VariantProps<typeof progressFillVariants> & {
    /** Current value (0..max) */
    value: number;
    /** Maximum value — defaults to 100 */
    max?: number;
    /** Optional label shown above the bar */
    label?: string;
    /** Shows the percentage value right-aligned when true */
    showValue?: boolean;
  };
