import type { ComponentProps } from "react";

export type TabsProps = ComponentProps<"div"> & {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

export type TabsListProps = ComponentProps<"div">;

export type TabsTriggerProps = ComponentProps<"button"> & {
  value: string;
  /** Optional count badge rendered as [N] after the label */
  count?: number;
};

export type TabsContentProps = ComponentProps<"div"> & {
  value: string;
};
