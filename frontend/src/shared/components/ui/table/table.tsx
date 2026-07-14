import { cn } from "@/shared/lib/cn";
import type {
  TableBodyProps,
  TableCellProps,
  TableHeadProps,
  TableHeaderProps,
  TableProps,
  TableRowProps,
} from "./table.types";

// MIGRATION: source `table.tsx` was a monolithic, columns/data-driven Table that
// also pulled in out-of-scope sibling primitives (`Empty`, `Skeleton`) for its
// loading/empty states. This migration instead ships the compound-component shape
// requested (Table/TableHeader/TableBody/TableRow/TableHead/TableCell) — thin,
// composable, dependency-free wrappers re-themed to TUI tokens. Sorting, density,
// loading and empty-state affordances from the source were dropped; compose them
// at the call site if needed.

// ref is a normal prop (React 19) — never forwardRef.
export function Table({ className, ...props }: TableProps) {
  return (
    <div data-slot="table-container" className="w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: TableHeaderProps) {
  return (
    <thead
      data-slot="table-header"
      className={cn("border-b border-border bg-surface", className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: TableBodyProps) {
  return (
    <tbody data-slot="table-body" className={cn(className)} {...props} />
  );
}

export function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border odd:bg-transparent even:bg-zebra transition-colors hover:bg-hover motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-3 text-left align-middle text-xs font-medium uppercase tracking-wider text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn("px-3 py-2 align-middle text-foreground", className)}
      {...props}
    />
  );
}
