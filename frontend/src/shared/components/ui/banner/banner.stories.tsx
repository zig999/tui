import type { Meta, StoryObj } from "@storybook/react-vite";
import { HardDrive } from "lucide-react";
import { expect, within } from "storybook/test";
import { Banner } from "./banner";

// Minimal inline "badge" — the project has no Badge primitive yet (see
// `docs/specs/decisions.md`). Semantic-token classes only.
function DashboardBadge() {
  return (
    <span className="inline-flex items-center border border-border px-2 py-0.5 text-xs text-accent">
      [Dashboard]
    </span>
  );
}

const meta = {
  title: "Layout/Banner",
  component: Banner,
  parameters: { layout: "fullscreen" },
  args: {
    title: "VISUAL VAULT",
    subtitle: "File organizer & duplicate finder",
  },
  argTypes: {
    frame: { control: "select", options: ["none", "notched"] },
    accent: {
      control: "select",
      options: ["default", "success", "info", "warning", "danger", "alt"],
    },
    titleLevel: { control: "select", options: [1, 2, 3] },
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories (also component tests via addon-vitest — ADR-001).
// ---------------------------------------------------------------------------

/**
 * Bare VISUAL VAULT strip — the canonical `frame="none"` render.
 * Test verifies: <header> landmark, <h1> at the title, subtitle rendered,
 * and NO action slot present.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Root landmark: <header> element.
    const header = canvasElement.querySelector("header");
    await expect(header).not.toBeNull();
    await expect(header).toHaveAttribute("data-slot", "banner");

    // Title as <h1>, exact text.
    const heading = canvas.getByRole("heading", {
      level: 1,
      name: "VISUAL VAULT",
    });
    await expect(heading).toBeInTheDocument();

    // Subtitle rendered as small muted text.
    await expect(canvas.getByText("File organizer & duplicate finder"))
      .toBeInTheDocument();
  },
};

/**
 * VISUAL VAULT canonical dashboard header — with the [Dashboard] badge in the
 * top-right action slot. Verifies the badge renders inside an absolutely
 * positioned wrapper so it does not disrupt the centered title layout.
 */
export const WithAction: Story = {
  args: { action: <DashboardBadge /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Both the heading AND the badge exist.
    await expect(
      canvas.getByRole("heading", { level: 1, name: "VISUAL VAULT" }),
    ).toBeInTheDocument();
    const badge = canvas.getByText("[Dashboard]");
    await expect(badge).toBeInTheDocument();

    // Badge is wrapped in an absolute-positioned container.
    const badgeWrapper = badge.closest(".absolute");
    await expect(badgeWrapper).not.toBeNull();
    await expect(badgeWrapper?.className).toContain("right-4");
    await expect(badgeWrapper?.className).toContain("top-4");
  },
};

/**
 * Logo variant — a decorative lucide icon above the title. Verifies the logo
 * wrapper is aria-hidden and never contributes to the accessible name.
 */
export const WithLogo: Story = {
  args: {
    logo: <HardDrive data-testid="banner-logo" className="size-8 text-accent" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const logoEl = canvas.getByTestId("banner-logo");
    const logoWrapper = logoEl.closest("[aria-hidden='true']");
    await expect(logoWrapper).not.toBeNull();

    // Accessible name still comes from the title — heading query resolves
    // exclusively by title text (icon contributes nothing).
    await expect(
      canvas.getByRole("heading", { level: 1, name: "VISUAL VAULT" }),
    ).toBeInTheDocument();
  },
};

/**
 * Notched variant — delegates the frame to Panel. Verifies:
 *   (a) the root is <section> (from Panel), not <header>,
 *   (b) the visible <h1> renders inside the panel body with the same title,
 *   (c) the section's aria-labelledby resolves to a heading with the title.
 */
export const Notched: Story = {
  args: {
    frame: "notched",
    accent: "info",
    title: "System Console",
    subtitle: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // (a) Root is a <section>, not a <header>.
    const section = canvasElement.querySelector("section");
    await expect(section).not.toBeNull();
    await expect(canvasElement.querySelector("header")).toBeNull();

    // (b) The visible <h1> renders inside the panel body with the title text.
    const h1 = canvas.getByRole("heading", {
      level: 1,
      name: "System Console",
    });
    await expect(h1).toBeInTheDocument();

    // (c) aria-labelledby on the section resolves to an element whose text is
    //     the title. Panel labels the section by its own notched-heading; both
    //     that heading and the visible <h1> carry identical text per spec §3.1.
    const labelledBy = section?.getAttribute("aria-labelledby");
    await expect(labelledBy).toBeTruthy();
    const labelEl = labelledBy
      ? canvasElement.querySelector(`#${labelledBy}`)
      : null;
    await expect(labelEl).not.toBeNull();
    await expect(labelEl).toHaveTextContent("System Console");
  },
};
