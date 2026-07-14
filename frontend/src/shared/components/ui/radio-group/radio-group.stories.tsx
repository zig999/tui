import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, fn, within } from "storybook/test";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import type { RadioGroupProps } from "./radio-group.types";

const meta = {
  title: "Forms/RadioGroup",
  component: RadioGroup,
  parameters: { layout: "centered" },
  args: { name: "plan", value: "free", onValueChange: fn() },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="free">Free</RadioGroupItem>
      <RadioGroupItem value="pro">Pro</RadioGroupItem>
      <RadioGroupItem value="enterprise" disabled>
        Enterprise
      </RadioGroupItem>
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ProSelected: Story = { args: { value: "pro" } };

export const Invalid: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="free" aria-invalid>
        Free
      </RadioGroupItem>
      <RadioGroupItem value="pro">Pro</RadioGroupItem>
    </RadioGroup>
  ),
};

function ControlledRadioGroup(args: RadioGroupProps) {
  const [value, setValue] = useState(args.value);
  return (
    <RadioGroup
      {...args}
      value={value}
      onValueChange={(next) => {
        args.onValueChange(next);
        setValue(next);
      }}
    >
      <RadioGroupItem value="free">Free</RadioGroupItem>
      <RadioGroupItem value="pro">Pro</RadioGroupItem>
    </RadioGroup>
  );
}

// The story doubles as a component test (ADR-001 + addon-vitest).
export const SelectsOnClick: Story = {
  render: (args) => <ControlledRadioGroup {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const pro = canvas.getByRole("radio", { name: "Pro" });
    await userEvent.click(pro);
    await expect(args.onValueChange).toHaveBeenCalledWith("pro");
    await expect(pro).toBeChecked();
  },
};
