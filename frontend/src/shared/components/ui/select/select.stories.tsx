import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, fn, within } from "storybook/test";
import { Select } from "./select";
import type { SelectOption } from "./select.types";

const options: SelectOption[] = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "degraded", label: "Degraded", disabled: true },
];

const meta = {
  title: "Forms/Select",
  component: Select,
  parameters: { layout: "centered" },
  args: {
    value: null,
    onChange: fn(),
    options,
    "aria-label": "Status",
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelection: Story = { args: { value: "online" } };

export const Disabled: Story = { args: { disabled: true } };

// The story doubles as a component test (ADR-001 + addon-vitest).
export const OpensAndSelectsOption: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    await userEvent.click(trigger);
    const option = await canvas.findByRole("option", { name: "Offline" });
    await userEvent.click(option);

    await expect(args.onChange).toHaveBeenCalledWith("offline");
  },
};
