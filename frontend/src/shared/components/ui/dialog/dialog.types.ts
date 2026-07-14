import type { ComponentProps } from "react";
import type * as DialogPrimitive from "@radix-ui/react-dialog";

export type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content>;
export type DialogOverlayProps = ComponentProps<typeof DialogPrimitive.Overlay>;
export type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title>;
export type DialogDescriptionProps = ComponentProps<typeof DialogPrimitive.Description>;
export type DialogHeaderProps = ComponentProps<"div">;
export type DialogFooterProps = ComponentProps<"div">;
