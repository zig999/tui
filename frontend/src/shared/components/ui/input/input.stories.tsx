import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, fn, within } from "storybook/test";
import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: { layout: "centered" },
  args: { placeholder: "digite algo...", onChange: fn() },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };

export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "valor inválido" },
};

// The story doubles as a component test (ADR-001 + addon-vitest).
export const TypesIntoInput: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await userEvent.type(input, "hello");
    await expect(input).toHaveValue("hello");
    await expect(args.onChange).toHaveBeenCalled();
  },
};
