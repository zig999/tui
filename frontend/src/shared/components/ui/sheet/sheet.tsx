import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useCallback } from "react";
import { cn } from "@/shared/lib/cn";
import type {
  SheetBodyProps,
  SheetContentProps,
  SheetHeaderProps,
  SheetProps,
  SheetTitleProps,
} from "./sheet.types";

// ref is a normal prop (React 19) — never forwardRef.
export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function SheetContent({
  className,
  children,
  onCloseAttempt,
  ...props
}: SheetContentProps) {
  // Intercept Radix pointer-down-outside (backdrop click) and escape-key-down —
  // only when the consumer opted into a close guard via onCloseAttempt.
  const handlePointerDownOutside = useCallback(
    (e: Event) => {
      if (onCloseAttempt) {
        e.preventDefault();
        onCloseAttempt();
      }
    },
    [onCloseAttempt],
  );

  const handleEscapeKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (onCloseAttempt) {
        e.preventDefault();
        onCloseAttempt();
      }
    },
    [onCloseAttempt],
  );

  const handleXClick = useCallback(() => {
    onCloseAttempt?.();
    // When no guard is set, DialogPrimitive.Close handles closing natively —
    // handleXClick is only wired to the plain <button> below.
  }, [onCloseAttempt]);

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="sheet-overlay"
        className="fixed inset-0 z-40 bg-black/60"
      />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        aria-describedby={undefined}
        onPointerDownOutside={handlePointerDownOutside}
        onEscapeKeyDown={handleEscapeKeyDown}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[50vw] flex-col gap-0",
          "overflow-y-auto border-l border-border bg-surface",
          "focus-visible:outline-none",
          className,
        )}
        {...props}
      >
        {/* Close button — a plain <button> when onCloseAttempt is set, so the
            guard runs instead of Radix's default close. */}
        {onCloseAttempt ? (
          <button
            type="button"
            onClick={handleXClick}
            data-slot="sheet-close"
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Fechar"
          >
            <X size={16} aria-hidden="true" />
          </button>
        ) : (
          <DialogPrimitive.Close
            data-slot="sheet-close"
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Fechar"
          >
            <X size={16} aria-hidden="true" />
          </DialogPrimitive.Close>
        )}
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex items-center gap-3 px-6 pt-6 pb-4", className)}
      {...props}
    />
  );
}

export function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-semibold tracking-wider text-accent uppercase", className)}
      {...props}
    />
  );
}

export function SheetBody({ className, ...props }: SheetBodyProps) {
  return (
    <div
      data-slot="sheet-body"
      className={cn("flex-1 overflow-y-auto px-6 pb-6", className)}
      {...props}
    />
  );
}
