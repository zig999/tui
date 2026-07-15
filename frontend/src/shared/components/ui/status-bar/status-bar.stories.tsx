import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { StatusBar } from "./status-bar";

// Story canvas frame: min-h-24 flex flex-col justify-end pushes the bar to
// the visual bottom of the canvas — mirrors real usage as a page footer strip.
const FRAME_CLASS = "min-h-24 flex flex-col justify-end w-full";

const meta = {
  title: "Layout/StatusBar",
  component: StatusBar,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className={FRAME_CLASS}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// All three slots populated — validates the three-region layout and the
// default role="status" + aria-label="Status bar" (spec §8 "Default render").
export const Default: Story = {
  args: {
    left: "Ready",
    center: "/home/user",
    right: "12:34",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Default role and aria-label are applied and expose the landmark.
    const bar = canvas.getByRole("status", { name: "Status bar" });
    await expect(bar).toBeInTheDocument();
    await expect(canvas.getByText("Ready")).toBeInTheDocument();
    await expect(canvas.getByText("/home/user")).toBeInTheDocument();
    await expect(canvas.getByText("12:34")).toBeInTheDocument();
  },
};

// left + right only, no center — validates that "right" stays pinned to the
// right edge (spec §8 "Empty slot preserves layout"). If the empty center
// region were removed, "12:34" would visually collapse toward the middle.
export const EmptyCenter: Story = {
  args: {
    left: "Idle",
    right: "12:34",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("status");
    // The bar always renders three flex-1 regions — the empty middle keeps
    // "12:34" anchored to the right edge instead of drifting to the center.
    await expect(bar.children).toHaveLength(3);
    const [leftRegion, centerRegion, rightRegion] = Array.from(bar.children);
    await expect(leftRegion).toHaveTextContent("Idle");
    await expect(centerRegion.textContent).toBe("");
    await expect(rightRegion).toHaveTextContent("12:34");
  },
};

// role="contentinfo" + custom ariaLabel — validates the landmark override
// (spec §8 "Role override — contentinfo").
export const ContentInfoRole: Story = {
  args: {
    role: "contentinfo",
    ariaLabel: "Application footer",
    left: "v1.0.0",
    right: "Connected",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("contentinfo", { name: "Application footer" });
    await expect(bar).toBeInTheDocument();
  },
};

// role="none" — root <div> carries no ARIA role; assistive tech does not
// expose the bar as a landmark or live region (spec §8 "Decorative role").
export const DecorativeRole: Story = {
  args: {
    role: "none",
    left: "Version 1.0.0",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // No landmark / no live region — the "status" role is absent.
    await expect(canvas.queryByRole("status")).toBeNull();
    await expect(canvas.queryByRole("contentinfo")).toBeNull();
    // Visual content still renders — the bar is just not announced.
    const visible = canvas.getByText("Version 1.0.0");
    await expect(visible).toBeInTheDocument();
    // The root div itself must not carry a role attribute.
    const root = visible.closest("div.flex.w-full");
    await expect(root).not.toBeNull();
    await expect(root).not.toHaveAttribute("role");
  },
};
