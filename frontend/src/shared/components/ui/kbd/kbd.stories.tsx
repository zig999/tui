import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd } from "./kbd";

const meta = {
  title: "UI/Kbd",
  component: Kbd,
  parameters: { layout: "centered" },
  args: { children: "K" },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = { args: { size: "sm" } };

export const Shortcut: Story = {
  render: () => (
    <span className="inline-flex items-center gap-1">
      <Kbd>Ctrl</Kbd>
      <span aria-hidden="true">+</span>
      <Kbd>K</Kbd>
    </span>
  ),
};
