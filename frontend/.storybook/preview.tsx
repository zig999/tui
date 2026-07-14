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
  // so components are previewed in their real TUI context.
  decorators: [
    (Story) => (
      <div className="bg-background p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
};

export default preview;
