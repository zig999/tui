import { cn } from "@/shared/lib/cn";
import { Link } from "../link";
import type { BreadcrumbProps } from "./breadcrumb.types";

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className={cn(className)}>
      <ol className="flex flex-wrap items-center text-xs">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const label = typeof item === "string" ? item : item.label;
          const href = typeof item === "string" ? undefined : item.href;

          return (
            <li key={index} className="flex items-center">
              {isLast ? (
                <span aria-current="page" className="text-primary">
                  {label}
                </span>
              ) : href ? (
                <Link href={href} className="text-xs text-foreground">
                  {label}
                </Link>
              ) : (
                <span className="text-muted-foreground">{label}</span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="mx-1 text-muted-foreground">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
