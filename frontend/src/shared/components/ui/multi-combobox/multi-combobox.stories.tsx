import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, fn, within } from "storybook/test";
import { MultiCombobox } from "./multi-combobox";
import type { MultiComboboxOption } from "./multi-combobox.types";

const options: MultiComboboxOption[] = [
  { value: "js", label: "JavaScript" },
  { value: "ts", label: "TypeScript" },
  { value: "py", label: "Python" },
  { value: "go", label: "Go" },
  { value: "rs", label: "Rust" },
];

// MultiCombobox is controlled (`value`/`onChange`) — this wrapper holds the
// selection in local state so stories/play functions see real UI updates,
// while still forwarding every change to the `onChange` arg (the `fn()` spy).
function ControlledMultiCombobox(props: ComponentProps<typeof MultiCombobox>) {
  const [value, setValue] = useState(props.value);
  return (
    <MultiCombobox
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange(next);
      }}
    />
  );
}

const meta = {
  title: "UI/MultiCombobox",
  component: MultiCombobox,
  parameters: { layout: "centered" },
  args: {
    label: "Linguagens",
    options,
    value: [],
    onChange: fn(),
    placeholder: "Buscar linguagem...",
  },
  render: (args) => <ControlledMultiCombobox {...args} />,
} satisfies Meta<typeof MultiCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: { value: ["ts", "go"] },
};

export const Loading: Story = {
  args: { loading: true },
};

export const WithError: Story = {
  args: { error: "Selecione ao menos uma linguagem" },
};

export const Disabled: Story = {
  args: { disabled: true, value: ["ts"] },
};

// The story doubles as a component test (ADR-001 + addon-vitest): opens the
// dropdown, filters by typing, and selects two options via the mouse.
export const SelectTwoOptions: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");

    await userEvent.type(input, "Script");
    await expect(canvas.getByText("JavaScript")).toBeInTheDocument();
    await expect(canvas.getByText("TypeScript")).toBeInTheDocument();

    await userEvent.click(canvas.getByText("JavaScript"));
    await expect(args.onChange).toHaveBeenLastCalledWith(["js"]);

    await userEvent.type(input, "Type");
    await userEvent.click(canvas.getByText("TypeScript"));
    await expect(args.onChange).toHaveBeenLastCalledWith(["js", "ts"]);

    await expect(args.onChange).toHaveBeenCalledTimes(2);
  },
};
