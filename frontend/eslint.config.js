import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import tseslint from "typescript-eslint";

export default tseslint.config([
  {
    ignores: [
      "dist",
      "storybook-static",
      "public/mockServiceWorker.js",
      "!.storybook",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Never `any` — use `unknown` and narrow (anti-patterns).
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    // shadcn/ui primitives co-locate their cva() variants in the component file
    // (Component Contract). Fast-refresh granularity is irrelevant for library
    // primitives validated via Storybook — relax the rule here only.
    files: ["src/shared/components/ui/**/*.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  ...storybook.configs["flat/recommended"],
]);
