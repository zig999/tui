import type { ComponentProps, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import type { panelVariants } from "./panel";

/**
 * Panel — notched-title TUI frame primitive.
 *
 * The native `title` attribute is Omit'ed because the typed `title` prop below
 * replaces it (the string rendered inside the notched heading, and the source
 * of the accessible name via `aria-labelledby`).
 */
export type PanelProps = Omit<ComponentProps<"section">, "title"> &
  VariantProps<typeof panelVariants> & {
    /** The text notched into the top border and the source of the accessible name. */
    title: string;
    /**
     * Optional decorative icon rendered inline before the title text.
     * Always wrapped with `aria-hidden="true"` — never contributes to the a11y name.
     */
    icon?: ReactNode;
    /** Heading level for the notched title (2/3/4). Defaults to 3. */
    titleLevel?: 2 | 3 | 4;
    /** Body content rendered below the notched-title top border. */
    children?: ReactNode;
  };
