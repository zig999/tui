import { cn } from "@/shared/lib/cn";
import type { SkeletonProps } from "./skeleton.types";

// MIGRATION: source used a linear-gradient shimmer sweep driven by a keyframe
// (t1-skeleton-shimmer) defined only in the source project's theme.css. Gradients
// are forbidden by our flat TUI visual language, so this uses Tailwind's built-in
// animate-pulse on a semantic token instead of introducing a new keyframe.
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-elevated motion-reduce:animate-none",
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
