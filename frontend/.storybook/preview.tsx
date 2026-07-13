import type { Preview } from "@storybook/react-vite";
import "../src/theme.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    a11y: {
      // 'todo' surfaces violations without failing; flip to 'error' to gate.
      test: "todo",
    },
  },
};

export default preview;
