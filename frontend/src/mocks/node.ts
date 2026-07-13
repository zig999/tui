import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Node server — used by Vitest (non-browser unit tests).
export const server = setupServer(...handlers);
