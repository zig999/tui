import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, fn, within } from "storybook/test";
import { DatePicker } from "./date-picker";

const meta = {
  title: "Forms/DatePicker",
  component: DatePicker,
  parameters: { layout: "centered" },
  args: {
    value: null,
    onChange: fn(),
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };

// A preselected value, controlled from the story's args.
export const Controlled: Story = {
  args: {
    value: new Date(2026, 6, 10),
  },
  // The story doubles as a component test (ADR-001 + addon-vitest): open the
  // popover, click a day cell, and assert the onChange callback fired.
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    await userEvent.click(await canvas.findByRole("button", { name: "20" }));
    await expect(args.onChange).toHaveBeenCalled();
  },
};
