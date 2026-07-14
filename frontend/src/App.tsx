import { Button } from "@/shared/components/ui/button";

/*
  Minimal app shell rendered as a terminal panel. The primary presentation/
  validation surface for this package is Storybook (ADR-001) — keep it thin.
*/
export function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 p-6">
      <div className="border border-border bg-surface">
        <header className="border-b border-border px-3 py-1 text-xs text-muted-foreground">
          user@ui-kit:~$ session
        </header>
        <div className="flex flex-col gap-3 p-4">
          <h1 className="text-lg font-semibold text-accent">UI Kit — TUI</h1>
          <p className="text-sm text-muted-foreground">
            Rode <span className="text-foreground">npm run storybook</span> para
            ver e testar os componentes.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-accent">●</span>
            <span className="text-muted-foreground">status:</span>
            <span className="text-foreground">ONLINE</span>
          </div>
          <div className="flex gap-2 pt-1">
            <Button>Começar</Button>
            <Button variant="outline">Cancelar</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
