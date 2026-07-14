import type { ComponentProps, ReactNode } from "react";

export interface RadioGroupContextValue {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export type RadioGroupProps = Omit<ComponentProps<"div">, "role"> & {
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
};

export type RadioGroupItemProps = Omit<
  ComponentProps<"input">,
  "type" | "name" | "checked" | "onChange" | "value"
> & {
  value: string;
  children?: ReactNode;
};
