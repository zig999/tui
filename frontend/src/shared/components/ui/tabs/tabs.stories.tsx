import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "UI/Tabs",
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
