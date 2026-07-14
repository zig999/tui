import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/shared/lib/cn";
import type { LabelProps } from "./label.types";

// ref is a normal prop (React 19) — never forwardRef.
export function Label({ className, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "block text-sm leading-none font-medium tracking-wider text-accent uppercase",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}
