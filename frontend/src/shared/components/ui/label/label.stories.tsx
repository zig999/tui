import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./label";

const meta = {
  title: "Forms/Label",
  component: Label,
  parameters: { layout: "centered" },
  args: { children: "Email address" },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AssociatedWithInput: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1">
      <Label {...args} htmlFor="email" />
      <input
        id="email"
        className="border border-border bg-transparent px-2 py-1 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  ),
};

// Peer must precede the label in the DOM for peer-disabled: to apply (CSS sibling combinator).
export const Disabled: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1">
      <input
        id="email-disabled"
        disabled
        className="peer border border-border bg-transparent px-2 py-1 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      />
      <Label {...args} htmlFor="email-disabled" />
    </div>
  ),
};
