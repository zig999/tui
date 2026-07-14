import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "./progress";

const meta = {
  title: "Feedback/Progress",
  component: Progress,
  parameters: { layout: "centered" },
  args: {
    value: 40,
  },
  argTypes: {
    tone: { control: "select", options: ["default", "success", "warning", "destructive"] },
  },
  render: (args) => (
    <div className="w-64">
      <Progress {...args} />
    </div>
  ),
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { value: 0 } };

export const Full: Story = { args: { value: 100 } };

export const Success: Story = { args: { value: 100, tone: "success" } };

export const Warning: Story = { args: { value: 70, tone: "warning" } };

export const Destructive: Story = { args: { value: 25, tone: "destructive" } };

export const WithLabelAndValue: Story = {
  args: { label: "Uploading…", showValue: true, value: 62 },
};
