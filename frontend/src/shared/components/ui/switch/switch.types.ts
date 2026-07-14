import type { ComponentProps } from "react";

export type SwitchProps = Omit<
  ComponentProps<"button">,
  "onClick" | "onChange" | "type" | "role" | "children"
> & {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};
