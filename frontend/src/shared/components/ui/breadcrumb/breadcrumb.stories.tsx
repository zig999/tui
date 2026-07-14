import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumb } from "./breadcrumb";

const meta = {
  title: "UI/Breadcrumb",
  component: Breadcrumb,
  parameters: { layout: "centered" },
  args: {
    items: [
      { label: "Home", href: "#" },
      { label: "Projects", href: "#" },
      "Current page",
    ],
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleItem: Story = { args: { items: ["Home"] } };

export const NoLinks: Story = {
  args: { items: ["Home", "Projects", "Current page"] },
};
