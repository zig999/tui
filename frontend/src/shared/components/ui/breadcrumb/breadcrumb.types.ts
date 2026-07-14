export type BreadcrumbItem = string | { label: string; href?: string };

export interface BreadcrumbProps {
  /** Array of items — strings or objects with optional href */
  items: BreadcrumbItem[];
  /** Passthrough for spacing overrides */
  className?: string;
}
