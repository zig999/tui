import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Link } from "./link";

const meta = {
  title: "Navigation/Link",
  component: Link,
  parameters: { layout: "centered" },
  args: { href: "#", children: "View details" },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const External: Story = {
  args: {
    href: "https://example.com",
    external: true,
    children: "External resource",
  },
};

export const FocusVisible: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "View details" });
    await userEvent.tab();
    await expect(link).toHaveFocus();
  },
};
