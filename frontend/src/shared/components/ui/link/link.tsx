import { cn } from "@/shared/lib/cn";
import type { LinkProps } from "./link.types";

export function Link({
  href,
  children,
  external = false,
  className,
  ...rest
}: LinkProps) {
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <a
      href={href}
      className={cn(
        "text-primary no-underline hover:underline",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "transition-colors motion-reduce:transition-none",
        className,
      )}
      {...externalProps}
      {...rest}
    >
      {children}
      {external && (
        <span aria-hidden="true" className="ml-0.5 inline-block">
          ↗
        </span>
      )}
    </a>
  );
}
