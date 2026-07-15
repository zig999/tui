import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  parameters: { layout: "centered" },
  args: { defaultValue: "profile" },
  render: (args) => (
    <Tabs {...args} className="w-80">
      <TabsList>
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="activity" count={3}>
          Atividade
        </TabsTrigger>
        <TabsTrigger value="settings">Config</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <p className="text-sm text-foreground">Conteúdo do perfil.</p>
      </TabsContent>
      <TabsContent value="activity">
        <p className="text-sm text-foreground">Conteúdo de atividade.</p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-foreground">Conteúdo de configurações.</p>
      </TabsContent>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// The story doubles as a component test (ADR-001 + addon-vitest).
export const SwitchesTabOnClick: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const profileTab = canvas.getByRole("tab", { name: /perfil/i });
    const activityTab = canvas.getByRole("tab", { name: /atividade/i });

    await expect(profileTab).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByText("Conteúdo do perfil.")).toBeInTheDocument();

    await userEvent.click(activityTab);

    await expect(activityTab).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByText("Conteúdo de atividade.")).toBeInTheDocument();
  },
};

// MenuBar composition: pipe-separated TUI menu strip (A | B | C).
// See docs/specs/front/components/menubar.component.spec.md §6, §8.
export const MenuBarStyle: Story = {
  args: { defaultValue: "dashboard" },
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="dashboard">DASHBOARD</TabsTrigger>
        <span
          aria-hidden="true"
          className="select-none text-muted-foreground px-1"
        >
          |
        </span>
        <TabsTrigger value="library">LIBRARY</TabsTrigger>
        <span
          aria-hidden="true"
          className="select-none text-muted-foreground px-1"
        >
          |
        </span>
        <TabsTrigger value="settings">SETTINGS</TabsTrigger>
      </TabsList>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // (a) render: tablist contains exactly three role="tab" nodes
    const tablist = canvas.getByRole("tablist");
    const tabs = canvas.queryAllByRole("tab");
    await expect(tabs).toHaveLength(3);

    // (b) aria: each pipe span is aria-hidden="true" and excluded from a11y tree.
    // Scope to direct children of tablist to avoid picking up the ▸ marker span
    // that lives inside the active trigger button.
    const pipes = tablist.querySelectorAll(":scope > span[aria-hidden]");
    await expect(pipes).toHaveLength(2);
    pipes.forEach((pipe) => {
      expect(pipe).toHaveAttribute("aria-hidden", "true");
      expect(pipe.textContent).toBe("|");
    });

    // (c) selection: DASHBOARD is initially active
    const dashboardTab = canvas.getByRole("tab", { name: /dashboard/i });
    const libraryTab = canvas.getByRole("tab", { name: /library/i });
    const settingsTab = canvas.getByRole("tab", { name: /settings/i });

    await expect(dashboardTab).toHaveAttribute("aria-selected", "true");
    await expect(dashboardTab).toHaveAttribute("tabindex", "0");
    await expect(libraryTab).toHaveAttribute("aria-selected", "false");
    await expect(libraryTab).toHaveAttribute("tabindex", "-1");
    await expect(settingsTab).toHaveAttribute("tabindex", "-1");

    // (d) click flow: switching to LIBRARY updates aria-selected
    await userEvent.click(libraryTab);

    await expect(libraryTab).toHaveAttribute("aria-selected", "true");
    await expect(dashboardTab).toHaveAttribute("aria-selected", "false");
  },
};
