import type { Meta, StoryObj } from "@storybook/react-vite";
import { Empty } from "./empty";

const meta = {
  title: "Feedback/Empty",
  component: Empty,
  parameters: { layout: "centered" },
  args: {
    title: "No results",
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: { description: "Try adjusting your filters or search terms." },
};

export const WithAction: Story = {
  args: {
    description: "Create your first entry to get started.",
    action: (
      <button className="border border-primary bg-primary px-3 py-1 text-xs uppercase tracking-wider text-primary-foreground">
        New Entry
      </button>
    ),
  },
};

export const Small: Story = { args: { size: "sm" } };

export const Large: Story = { args: { size: "lg" } };

export const Borderless: Story = { args: { bordered: false } };
