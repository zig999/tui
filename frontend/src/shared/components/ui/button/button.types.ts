import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "./button";

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;
