import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
  Single source of the class merge util (CLAUDE.md → shadcn/ui).
  twMerge must be extended so it resolves conflicts on our custom tokens/utilities
  correctly — otherwise it mis-merges custom classes (interacts with Gotcha #2 —
  border namespaces). Register any custom class group here as the token set grows.
*/
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Container-scale widths driven by --container-* (see theme.css Gotcha #3).
      "max-w": [{ "max-w": ["xs", "sm", "md", "lg"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
