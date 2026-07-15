import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertTriangle, Copy, Files, HardDrive, Layers } from "lucide-react";
import { expect, within } from "storybook/test";
import { Panel } from "./panel";
import { Banner } from "@/shared/components/ui/banner";
import { StatPanel } from "@/shared/components/ui/stat-panel";
import { StatusBar } from "@/shared/components/ui/status-bar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

const meta = {
  title: "Layout/Panel",
  component: Panel,
  parameters: { layout: "centered" },
  args: {
    title: "Total Files",
    children: (
      <p className="text-sm text-foreground">
        Panel body content — framed by the notched-title TUI border.
      </p>
    ),
  },
  argTypes: {
    accent: {
      control: "select",
      options: ["default", "success", "info", "warning", "danger", "alt"],
    },
    titleLevel: { control: "select", options: [2, 3, 4] },
  },
  render: (args) => (
    <Panel {...args} className="w-72">
      {args.children}
    </Panel>
  ),
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Success: Story = { args: { accent: "success", title: "Backup OK" } };

export const Info: Story = { args: { accent: "info", title: "Storage" } };

export const Warning: Story = { args: { accent: "warning", title: "Quota" } };

export const Danger: Story = { args: { accent: "danger", title: "Errors" } };

export const Alt: Story = { args: { accent: "alt", title: "Media Types" } };

export const WithIcon: Story = {
  args: {
    title: "Duplicates",
    icon: <AlertTriangle className="inline size-4" />,
    accent: "warning",
  },
};

export const HeadingLevelTwo: Story = {
  args: { title: "System Status", titleLevel: 2 },
};

// The story doubles as a component test (ADR-001 + addon-vitest).
// Verifies the accessibility contract: aria-labelledby wiring resolves to the
// visible heading, and the optional icon never contributes to the a11y name.
export const AriaLabelledByWiring: Story = {
  args: {
    title: "Duplicates",
    icon: <AlertTriangle data-testid="panel-icon" className="inline size-4" />,
    accent: "warning",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // (a) The <section> has aria-labelledby pointing at a real element…
    const section = canvasElement.querySelector("section");
    await expect(section).not.toBeNull();
    const labelledBy = section?.getAttribute("aria-labelledby");
    await expect(labelledBy).toBeTruthy();

    // (b) …and the referenced element contains the title text (accessible name
    // = title, icon must contribute nothing).
    const heading = canvas.getByRole("heading", { name: "Duplicates" });
    await expect(heading.id).toBe(labelledBy);
    await expect(heading).toHaveTextContent("Duplicates");

    // (c) The icon wrapper is aria-hidden, so screen readers skip it.
    const iconEl = canvas.getByTestId("panel-icon");
    const iconWrapper = iconEl.closest("[aria-hidden='true']");
    await expect(iconWrapper).not.toBeNull();
  },
};

// ---------------------------------------------------------------------------
// Dashboard — VISUAL VAULT integration composition (TC-07).
// Mounts Banner + MenuBar (Tabs pipe strip) + a 2x2 StatPanel grid + a File
// Types placeholder Panel + StatusBar in the canonical VISUAL VAULT layout.
// Serves as the visual integration test for the complete dashboard shell.
// See docs/specs/decisions.md — ADR-2026-07-14-01/02/03.
// ---------------------------------------------------------------------------
export const Dashboard: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Banner
        title="VISUAL VAULT"
        subtitle="File organizer & duplicate finder"
        action={
          // ADR-2026-07-14-02: no Badge component — plain <span> pill only.
          <span className="inline-flex items-center border border-border px-2 py-0.5 text-xs text-accent">
            [Dashboard]
          </span>
        }
      />

      {/* MenuBar — ADR-2026-07-14-01: composed via Tabs, no dedicated MenuBar. */}
      <div className="px-4 pt-4">
        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">DASHBOARD</TabsTrigger>
            <span
              aria-hidden="true"
              className="select-none px-1 text-muted-foreground"
            >
              |
            </span>
            <TabsTrigger value="library">LIBRARY</TabsTrigger>
            <span
              aria-hidden="true"
              className="select-none px-1 text-muted-foreground"
            >
              |
            </span>
            <TabsTrigger value="settings">SETTINGS</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <main className="flex flex-1 flex-col gap-4 p-4">
        {/* 2x2 KPI grid. Accent mapping per spec §6 / TC-07 known_context. */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StatPanel
            title="Total Files"
            icon={<Files className="inline size-4" />}
            value={1234}
            caption="arquivos"
          />
          <StatPanel
            title="Total Size"
            icon={<HardDrive className="inline size-4" />}
            accent="info"
            value="1.5 GB"
            caption="in vault"
          />
          <StatPanel
            title="Duplicates"
            icon={<Copy className="inline size-4" />}
            accent="warning"
            value={42}
            caption="detected"
          />
          <StatPanel
            title="Media Types"
            icon={<Layers className="inline size-4" />}
            accent="alt"
            value="12"
            caption="unique"
          />
        </div>

        {/* ADR-2026-07-14-03: File Types chart is out of scope — placeholder Panel. */}
        <Panel title="File Types" />
      </main>

      <StatusBar left="Ready" right="12:34" />
    </div>
  ),
};
