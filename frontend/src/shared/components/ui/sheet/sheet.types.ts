import type { ComponentProps, ReactNode } from "react";
import type * as DialogPrimitive from "@radix-ui/react-dialog";

export type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export type SheetContentProps = Omit<
  ComponentProps<typeof DialogPrimitive.Content>,
  "onPointerDownOutside" | "onEscapeKeyDown"
> & {
  /**
   * When provided, intercepts Esc, backdrop click, and the close button —
   * calls this callback instead of closing. The consumer decides whether to
   * actually close (e.g. a dirty-guard check).
   * When absent, default Radix close behaviour applies.
   */
  onCloseAttempt?: () => void;
};

export type SheetHeaderProps = ComponentProps<"div">;
export type SheetTitleProps = ComponentProps<typeof DialogPrimitive.Title>;
export type SheetBodyProps = ComponentProps<"div">;
