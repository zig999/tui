import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, fn, within } from "storybook/test";
import { Checkbox } from "./checkbox";
import type { CheckboxProps } from "./checkbox.types";

const meta = {
  title: "Forms/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  args: { checked: false, onChange: fn(), children: "Aceito os termos" },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { checked: true } };

export const Indeterminate: Story = { args: { checked: "indeterminate" } };

export const Disabled: Story = { args: { disabled: true } };

export const Invalid: Story = { args: { "aria-invalid": true } };

// Controlled wrapper so the play function can observe a real toggle.
function ControlledCheckbox(args: CheckboxProps) {
  const [checked, setChecked] = useState(args.checked);
  return (
    <Checkbox
      {...args}
      checked={checked}
      onChange={(e) => {
        args.onChange(e);
        setChecked(e.target.checked);
      }}
    />
  );
}

// The story doubles as a component test (ADR-001 + addon-vitest).
export const TogglesOnClick: Story = {
  render: (args) => <ControlledCheckbox {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");
    await userEvent.click(checkbox);
    await expect(args.onChange).toHaveBeenCalledOnce();
    await expect(checkbox).toBeChecked();
  },
};
