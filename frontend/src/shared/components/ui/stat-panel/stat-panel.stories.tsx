import type { Meta, StoryObj } from "@storybook/react-vite";
import { Files, HardDrive, Copy, Layers } from "lucide-react";
import { expect, within } from "storybook/test";
import { StatPanel } from "./stat-panel";

const meta = {
  title: "Layout/StatPanel",
  component: StatPanel,
  parameters: { layout: "centered" },
  args: {
    title: "Total Files",
    value: 1234,
  },
  argTypes: {
    accent: {
      control: "select",
      options: ["default", "success", "info", "warning", "danger", "alt"],
    },
    titleLevel: { control: "select", options: [2, 3, 4] },
    value: { control: "text" },
    caption: { control: "text" },
  },
  render: (args) => <StatPanel {...args} className="w-56" />,
} satisfies Meta<typeof StatPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// -- Default render (spec §8, scenario 1) --------------------------------
// No caption, no accent, no icon: plain KPI tile at `text-3xl text-foreground`.
export const Default: Story = {};

// -- VISUAL VAULT dashboard tiles (spec §1, canonical use case) -----------
// The four KPI cards from the VISUAL VAULT design brief. Each pins its own
// accent so the border + notched title identify the metric at a glance.

export const TotalFilesTile: Story = {
  args: {
    title: "Total Files",
    icon: <Files className="inline size-4" />,
    value: 1234,
    caption: "arquivos",
  },
};

export const TotalSizeTile: Story = {
  args: {
    title: "Total Size",
    icon: <HardDrive className="inline size-4" />,
    accent: "info",
    value: "1.5 GB",
    caption: "in vault",
  },
};

export const DuplicatesTile: Story = {
  args: {
    title: "Duplicates",
    icon: <Copy className="inline size-4" />,
    accent: "warning",
    value: 42,
    caption: "detected",
  },
};

// MediaTypesTile — the canonical validation of the TC-01 `--color-accent-alt`
// token through StatPanel's Panel delegation. Referenced by name in TC-03
// validation criteria.
export const MediaTypesTile: Story = {
  args: {
    title: "Media Types",
    icon: <Layers className="inline size-4" />,
    accent: "alt",
    value: "12",
    caption: "unique",
  },
};

// -- Accent coverage (all six Panel variants) ----------------------------
// Sanity-checks that every accent value passes through cleanly. The four
// VISUAL VAULT tiles above already cover default/info/warning/alt; these
// fill in success + danger.

export const Success: Story = {
  args: { title: "Backup OK", accent: "success", value: "0 errors" },
};

export const Danger: Story = {
  args: { title: "Errors", accent: "danger", value: 7, caption: "last 24h" },
};

// -- Behavioral tests (ADR-001 + addon-vitest) ---------------------------

// (i) Absence of caption when the prop is omitted, and the `text-foreground`
// class on the value regardless of accent. Encodes spec §6/§7: the value is
// never accent-tinted.
export const NoCaptionAndForegroundValue: Story = {
  args: {
    title: "Total Files",
    accent: "alt",
    value: 1234,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Value renders verbatim (String(1234) = "1234") and at text-foreground
    // even though accent="alt" would tint the border/title.
    const valueEl = canvasElement.querySelector(
      '[data-slot="stat-panel-value"]',
    );
    await expect(valueEl).not.toBeNull();
    await expect(valueEl).toHaveTextContent("1234");
    await expect(valueEl?.className).toContain("text-foreground");
    await expect(valueEl?.className).toContain("text-3xl");

    // Caption is absent when the prop is omitted.
    const captionEl = canvasElement.querySelector(
      '[data-slot="stat-panel-caption"]',
    );
    await expect(captionEl).toBeNull();

    // Panel-level accent still wired via aria-labelledby to the notched title.
    const heading = canvas.getByRole("heading", { name: "Total Files" });
    await expect(heading.className).toContain("text-accent-alt");
  },
};

// (ii) Caption renders below the value with the exact utility classes from
// spec §6 when the prop is provided; also validates the MediaTypesTile shape.
export const CaptionRendered: Story = {
  args: {
    title: "Media Types",
    accent: "alt",
    value: "12",
    caption: "unique",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const captionEl = canvasElement.querySelector(
      '[data-slot="stat-panel-caption"]',
    );
    await expect(captionEl).not.toBeNull();
    await expect(captionEl).toHaveTextContent("unique");
    await expect(captionEl?.className).toContain("text-xs");
    await expect(captionEl?.className).toContain("uppercase");
    await expect(captionEl?.className).toContain("tracking-widest");
    await expect(captionEl?.className).toContain("text-muted-foreground");

    // Value still renders verbatim (String("12") = "12").
    const valueEl = canvasElement.querySelector(
      '[data-slot="stat-panel-value"]',
    );
    await expect(valueEl).toHaveTextContent("12");

    // Panel delegation: the outer <section> carries the alt border.
    const section = canvasElement.querySelector("section");
    await expect(section?.className).toContain("border-accent-alt");
    // Accessibility inherited from Panel: aria-labelledby → heading id.
    const heading = canvas.getByRole("heading", { name: "Media Types" });
    await expect(section?.getAttribute("aria-labelledby")).toBe(heading.id);
  },
};
