import type { ComponentProps, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import type { emptyVariants } from "./empty";

export type EmptyProps = Omit<ComponentProps<"div">, "title"> &
  VariantProps<typeof emptyVariants> & {
    /** ASCII glyph or custom icon node rendered above the title */
    icon?: string | ReactNode;
    /** Short uppercase empty-state title */
    title: string;
    /** Secondary guidance text below the title */
    description?: string;
    /** Primary action slot (e.g. a Button) */
    action?: ReactNode;
  };
