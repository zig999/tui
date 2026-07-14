import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./table";

const meta = {
  title: "Data Display/Table",
  component: Table,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const processes = [
  { id: "PID-001", name: "core-router", status: "online", uptime: "42d 03h" },
  { id: "PID-014", name: "auth-worker", status: "online", uptime: "12d 19h" },
  { id: "PID-027", name: "batch-cron", status: "offline", uptime: "—" },
];

export const Default: Story = {
  render: () => (
    <Table className="w-[480px]">
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Processo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Uptime</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {processes.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-mono">{row.id}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell
              className={row.status === "online" ? "text-success" : "text-muted-foreground"}
            >
              {row.status}
            </TableCell>
            <TableCell className="text-right">{row.uptime}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
