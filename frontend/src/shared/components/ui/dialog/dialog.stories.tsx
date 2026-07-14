import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger className="border border-border bg-transparent px-3 py-1.5 text-sm text-foreground uppercase tracking-wider hover:border-primary hover:text-primary">
        Abrir
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar ação</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Esta ação não pode ser desfeita. Deseja continuar?
        </DialogDescription>
        <DialogFooter>
          <DialogClose className="border border-border px-3 py-1.5 text-sm text-foreground uppercase tracking-wider hover:border-primary hover:text-primary">
            Cancelar
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const Default: Story = {
  render: () => <DialogDemo />,
};

// The story doubles as a component test (ADR-001 + addon-vitest).
export const OpensOnTriggerClick: Story = {
  render: () => <DialogDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Abrir" }));
    const dialog = await within(document.body).findByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      within(dialog).getByText("Confirmar ação"),
    ).toBeInTheDocument();
  },
};
