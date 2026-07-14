import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, fn, within } from "storybook/test";
import { Textarea } from "./textarea";

const meta = {
  title: "Forms/Textarea",
  component: Textarea,
  parameters: { layout: "centered" },
  args: { placeholder: "digite algo...", onChange: fn() },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };

export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "valor inválido" },
};

// The story doubles as a component test (ADR-001 + addon-vitest).
export const TypesIntoTextarea: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");
    await userEvent.type(textarea, "hello");
    await expect(textarea).toHaveValue("hello");
    await expect(args.onChange).toHaveBeenCalled();
  },
};
