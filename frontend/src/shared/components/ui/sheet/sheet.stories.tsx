import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { useState } from "react";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from "./sheet";

function SheetDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border border-border bg-transparent px-3 py-1.5 text-sm text-foreground uppercase tracking-wider hover:border-primary hover:text-primary"
      >
        Abrir painel
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Detalhes</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <p className="text-sm text-foreground">Conteúdo do painel lateral.</p>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
}

const meta = {
  title: "Overlays/Sheet",
  component: Sheet,
  parameters: { layout: "centered" },
  // Sheet's props are all required; the stories drive it via <SheetDemo />, so
  // these args are placeholders to satisfy the type.
  args: { open: false, onOpenChange: () => {}, children: null },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <SheetDemo />,
};

// The story doubles as a component test (ADR-001 + addon-vitest).
export const OpensOnTriggerClick: Story = {
  render: () => <SheetDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Abrir painel" }));
    const dialog = await within(document.body).findByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(within(dialog).getByText("Detalhes")).toBeInTheDocument();
  },
};
