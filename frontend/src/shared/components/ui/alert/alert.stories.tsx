import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Alert } from "./alert";

const meta = {
  title: "Feedback/Alert",
  component: Alert,
  parameters: { layout: "centered" },
  args: {
    title: "Heads up",
    children: "This is an informational message.",
  },
  argTypes: {
    variant: { control: "select", options: ["info", "success", "warning", "destructive"] },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};

export const Success: Story = {
  args: { variant: "success", title: "Saved", children: "Changes were saved successfully." },
};

export const Warning: Story = {
  args: { variant: "warning", title: "Careful", children: "This action can't be undone." },
};

export const Destructive: Story = {
  args: { variant: "destructive", title: "Error", children: "Something went wrong." },
};

export const WithoutTitle: Story = {
  args: { title: undefined, children: "Body-only alert, no title line." },
};

// The story doubles as a component test (ADR-001 + addon-vitest).
export const Dismissible: Story = {
  args: { dismissible: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Heads up")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Fechar aviso" }));
    await expect(canvas.queryByText("Heads up")).not.toBeInTheDocument();
  },
};
