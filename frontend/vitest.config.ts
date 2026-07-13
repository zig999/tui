import { defineConfig, mergeConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";
import viteConfig from "./vite.config";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// Two projects:
//  - "unit"      → plain jsdom-free node/browser-agnostic unit tests (*.test.ts)
//  - "storybook" → every .stories.tsx run as a browser component test (addon-vitest,
//                  Playwright/Chromium). This is the canonical component-test surface (ADR-001).
//
// GOTCHA #1: vitest is pinned to v4 with a vite override because of addon-vitest browser
// mode. Do not bump vitest/vite without revalidating browser mode end-to-end.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: "unit",
            include: ["src/**/*.{test,spec}.{ts,tsx}"],
            environment: "node",
          },
        },
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: path.join(dirname, ".storybook"),
            }),
          ],
          test: {
            name: "storybook",
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: [{ browser: "chromium" }],
            },
            setupFiles: [".storybook/vitest.setup.ts"],
          },
        },
      ],
    },
  }),
);
