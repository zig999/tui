import type { RequestHandler } from "msw";

// Single shared handler set reused across Vitest, Storybook, dev, and Playwright.
// Add per-feature handlers here; override per-test and call resetHandlers() in afterEach
// so overrides don't leak.
export const handlers: RequestHandler[] = [];
