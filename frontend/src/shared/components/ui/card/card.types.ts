import type { ComponentProps, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import type { cardVariants } from "./card";

export type CardProps = ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & {
    /** Custom header slot — takes precedence over headerTitle */
    header?: ReactNode;
    /** When provided (and no header slot), renders an uppercase title row */
    headerTitle?: string;
    /** Optional footer slot */
    footer?: ReactNode;
    /** When provided, the card becomes interactive (button role, hover/focus states) */
    onClick?: () => void;
  };
