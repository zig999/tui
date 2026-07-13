import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/shared/lib/query-client";
import { App } from "@/App";
import "@/theme.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Single Toaster at the app root — never multiple instances. */}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </StrictMode>,
);
