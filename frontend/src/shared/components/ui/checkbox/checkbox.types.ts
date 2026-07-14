import type { ComponentProps, ReactNode } from "react";

export type CheckboxProps = Omit<
  ComponentProps<"input">,
  "type" | "checked" | "onChange"
> & {
  checked: boolean | "indeterminate";
  onChange: NonNullable<ComponentProps<"input">["onChange"]>;
  children?: ReactNode;
};
