import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Tooltip, TooltipProvider } from "./tooltip";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={0}>
        <Story />
      </TooltipProvider>
    ),
  ],
  args: {
    content: "Tooltip content",
    children: (
      <button className="border border-border bg-transparent px-3 py-1.5 text-sm uppercase tracking-wider text-foreground hover:border-primary hover:text-primary">
        Hover me
      </button>
    ),
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Top: Story = { args: { side: "top" } };

export const Bottom: Story = { args: { side: "bottom" } };

export const Left: Story = { args: { side: "left" } };

export const Disabled: Story = { args: { disabled: true } };

// The story doubles as a component test (ADR-001 + addon-vitest).
export const ShowsOnHover: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: "Hover me" }));
    // Radix renders the visible content plus an sr-only duplicate (role=tooltip),
    // so scope the query to the visible content element to avoid a double match.
    const tooltip = await within(document.body).findByText("Tooltip content", {
      selector: "[data-slot='tooltip-content']",
    });
    await expect(tooltip).toBeVisible();
  },
};
