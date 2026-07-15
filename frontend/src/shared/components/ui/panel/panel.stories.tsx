import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertTriangle } from "lucide-react";
import { expect, within } from "storybook/test";
import { Panel } from "./panel";

const meta = {
  title: "Layout/Panel",
  component: Panel,
  parameters: { layout: "centered" },
  args: {
    title: "Total Files",
    children: (
      <p className="text-sm text-foreground">
        Panel body content — framed by the notched-title TUI border.
      </p>
    ),
  },
  argTypes: {
    accent: {
      control: "select",
      options: ["default", "success", "info", "warning", "danger", "alt"],
    },
    titleLevel: { control: "select", options: [2, 3, 4] },
  },
  render: (args) => (
    <Panel {...args} className="w-72">
      {args.children}
    </Panel>
  ),
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Success: Story = { args: { accent: "success", title: "Backup OK" } };

export const Info: Story = { args: { accent: "info", title: "Storage" } };

export const Warning: Story = { args: { accent: "warning", title: "Quota" } };

export const Danger: Story = { args: { accent: "danger", title: "Errors" } };

export const Alt: Story = { args: { accent: "alt", title: "Media Types" } };

export const WithIcon: Story = {
  args: {
    title: "Duplicates",
    icon: <AlertTriangle className="inline size-4" />,
    accent: "warning",
  },
};

export const HeadingLevelTwo: Story = {
  args: { title: "System Status", titleLevel: 2 },
};

// The story doubles as a component test (ADR-001 + addon-vitest).
// Verifies the accessibility contract: aria-labelledby wiring resolves to the
// visible heading, and the optional icon never contributes to the a11y name.
export const AriaLabelledByWiring: Story = {
  args: {
    title: "Duplicates",
    icon: <AlertTriangle data-testid="panel-icon" className="inline size-4" />,
    accent: "warning",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // (a) The <section> has aria-labelledby pointing at a real element…
    const section = canvasElement.querySelector("section");
    await expect(section).not.toBeNull();
    const labelledBy = section?.getAttribute("aria-labelledby");
    await expect(labelledBy).toBeTruthy();

    // (b) …and the referenced element contains the title text (accessible name
    // = title, icon must contribute nothing).
    const heading = canvas.getByRole("heading", { name: "Duplicates" });
    await expect(heading.id).toBe(labelledBy);
    await expect(heading).toHaveTextContent("Duplicates");

    // (c) The icon wrapper is aria-hidden, so screen readers skip it.
    const iconEl = canvas.getByTestId("panel-icon");
    const iconWrapper = iconEl.closest("[aria-hidden='true']");
    await expect(iconWrapper).not.toBeNull();
  },
};
