import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { PersonPicker } from "./person-picker";
import type { PersonPickerOption } from "./person-picker.types";

const people: PersonPickerOption[] = [
  { id: "1", name: "Ada Lovelace" },
  { id: "2", name: "Grace Hopper" },
  { id: "3", name: "Alan Turing", avatarUrl: "https://i.pravatar.cc/40?img=3" },
];

const meta = {
  title: "UI/PersonPicker",
  component: PersonPicker,
  parameters: { layout: "centered" },
  args: {
    people,
    value: null,
    onChange: fn(),
  },
} satisfies Meta<typeof PersonPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: { value: "2" },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /selecionar pessoa/i }));
    await expect(canvas.getByText("Carregando...")).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: "1" },
};

// The story doubles as a component test (ADR-001 + addon-vitest).
export const SelectsPersonOnClick: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /selecionar pessoa/i }));
    const option = await canvas.findByRole("option", { name: /grace hopper/i });
    await userEvent.click(option);
    await expect(args.onChange).toHaveBeenCalledWith("2");
  },
};
