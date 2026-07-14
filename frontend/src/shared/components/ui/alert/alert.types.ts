import type { ComponentProps, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import type { alertVariants } from "./alert";

export type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>;

export type AlertProps = Omit<ComponentProps<"div">, "title" | "role"> &
  VariantProps<typeof alertVariants> & {
    /** Optional bold short title line above the body */
    title?: string;
    /** Optional action slot rendered below the body */
    action?: ReactNode;
    /** When true, shows a dismiss button that removes the alert from the DOM */
    dismissible?: boolean;
    /** ARIA role override — defaults to "status" for info/success, "alert" for warning/destructive */
    role?: "alert" | "status";
  };
