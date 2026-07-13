import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// Browser worker — used by Storybook and the dev server.
export const worker = setupWorker(...handlers);
