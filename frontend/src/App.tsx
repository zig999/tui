import { Button } from "@/shared/components/ui/button";

/*
  Minimal app shell. The primary presentation/validation surface for this package
  is Storybook (ADR-001), not this dev entry — keep it thin.
*/
export function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold text-foreground">UI Kit</h1>
      <p className="text-sm text-muted-foreground">
        Rode <code>npm run storybook</code> para ver e testar os componentes.
      </p>
      <Button>Começar</Button>
    </main>
  );
}
