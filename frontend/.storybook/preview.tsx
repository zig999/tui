import type { Preview } from "@storybook/react-vite";
import "../src/theme.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    backgrounds: { disable: true },
    a11y: {
      // 'todo' surfaces violations without failing; flip to 'error' to gate.
      test: "todo",
    },
  },
  // Render every story on the terminal background with the phosphor foreground,
  // so components are previewed in their real TUI context. The decorator also
  // applies the toolbar-selected color theme to the canvas root (on the fly).
  decorators: [
    (Story, context) => {
      document.documentElement.dataset.theme = String(context.globals.theme);
      return (
        <div className="bg-background p-6 text-foreground">
          <Story />
        </div>
      );
    },
  ],
};

// Global color-theme switcher in the Storybook toolbar. "phosphor" is the
// default and falls through to the @theme defaults (no override block).
export const globalTypes = {
  theme: {
    description: "Tema de cores",
    defaultValue: "phosphor",
    toolbar: {
      title: "Tema",
      icon: "paintbrush",
      items: [
        { value: "phosphor", title: "Phosphor (verde)" },
        { value: "default", title: "Default (Terminal.css)" },
      ],
      dynamicTitle: true,
    },
  },
};

export default preview;
