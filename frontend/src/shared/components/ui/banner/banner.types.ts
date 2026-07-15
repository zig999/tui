import type { ComponentProps, ReactNode } from "react";

/** Frame identity — `"none"` is the full-width strip; `"notched"` delegates to Panel. */
export type BannerFrame = "none" | "notched";

/** Accent forwarded to `Panel` only when `frame="notched"`. Ignored otherwise. */
export type BannerAccent =
  | "default"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "alt";

/** Heading level for the visible `title` heading. */
export type BannerTitleLevel = 1 | 2 | 3;

/**
 * Banner — dashboard top-of-page composition over `Panel`.
 *
 * The native `title` attribute is Omit'ed because the typed `title` prop below
 * replaces it (the large centered heading string, also used as the notched
 * border label when `frame="notched"`).
 */
export type BannerProps = Omit<ComponentProps<"header">, "title"> & {
  /** Large centered title text. Rendered as `<h1>` by default (see `titleLevel`). */
  title: string;
  /** Optional subtitle rendered below the title in muted small text. */
  subtitle?: string;
  /** Right-hand slot rendered in the top-right corner of the banner body. */
  action?: ReactNode;
  /**
   * Optional decorative logo/glyph rendered above the title.
   * Always wrapped with `aria-hidden="true"` — never contributes to the a11y name.
   */
  logo?: ReactNode;
  /**
   * Frame identity. `"none"` (default): full-width `<header>` strip.
   * `"notched"`: delegates the frame to `Panel` (notched-border label = `title`).
   */
  frame?: BannerFrame;
  /**
   * Accent forwarded to `Panel.accent` when `frame="notched"`.
   * Silently ignored when `frame="none"` (the strip has no border to color).
   */
  accent?: BannerAccent;
  /** Heading level for the visible `title`. Defaults to `1`. */
  titleLevel?: BannerTitleLevel;
};
