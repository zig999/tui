import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, fn, within } from "storybook/test";
import { Switch } from "./switch";
import type { SwitchProps } from "./switch.types";

const meta = {
  title: "Forms/Switch",
  component: Switch,
  parameters: { layout: "centered" },
  args: { checked: false, onChange: fn(), label: "Notificações" },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = { args: { checked: true } };

export const Disabled: Story = { args: { disabled: true } };

export const Invalid: Story = { args: { "aria-invalid": true } };

function ControlledSwitch(args: SwitchProps) {
  const [checked, setChecked] = useState(args.checked);
  return (
    <Switch
      {...args}
      checked={checked}
      onChange={(next) => {
        args.onChange(next);
        setChecked(next);
      }}
    />
  );
}

// The story doubles as a component test (ADR-001 + addon-vitest).
export const TogglesOnClick: Story = {
  render: (args) => <ControlledSwitch {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch");
    await userEvent.click(toggle);
    await expect(args.onChange).toHaveBeenCalledWith(true);
    await expect(toggle).toHaveAttribute("aria-checked", "true");
  },
};
