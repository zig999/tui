import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, fn, within } from "storybook/test";
import { Card } from "./card";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: { layout: "centered" },
  args: {
    children: "Card body content.",
  },
  argTypes: {
    tone: { control: "select", options: ["default", "elevated", "data", "warning", "danger"] },
    padding: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Elevated: Story = { args: { tone: "elevated" } };

export const Data: Story = { args: { tone: "data" } };

export const Warning: Story = { args: { tone: "warning" } };

export const Danger: Story = { args: { tone: "danger" } };

export const WithHeaderAndFooter: Story = {
  args: {
    headerTitle: "Session Log",
    footer: <span className="text-xs text-muted-foreground">Updated 2min ago</span>,
  },
};

// The story doubles as a component test (ADR-001 + addon-vitest).
export const Interactive: Story = {
  args: { onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("button");
    await userEvent.click(card);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
