import { setup } from "@storybook/vue3";
import { DARK_MODE_SELECTOR } from "vueless/constants.js";
import { withThemeByClassName } from '@storybook/addon-themes';

import { backgrounds, docs, layout } from "./configs/main.config.js";
import { vue3SourceDecorator } from "./decorators/vue3SourceDecorator.js";

// Vue plugins
import { createVueless } from "vueless";
import { createRouter, createWebHistory } from "vue-router";

// Tailwind styles
import "./index.pcss";

// Create storybook app instance
const storybookApp = (app) => {
  const vueless = createVueless();
  const router = createRouter({ history: createWebHistory(), routes: [] });

  if (!app._context.config.globalProperties.$route) {
    app.use(router);
    app.use(vueless);
  }
};

// Setup storybook
setup(storybookApp);

// Set storybook config
export default {
  decorators: [
    vue3SourceDecorator,
    withThemeByClassName({
      themes: { light: "", dark: DARK_MODE_SELECTOR },
      defaultTheme: "dark",
    }),
  ],
  parameters: {
    layout,
    docs,
    backgrounds,
    options: {
      storySort: (a, b) => {
        const idA = a.id.split("--")[0];
        const idB = b.id.split("--")[0];

        return idA.localeCompare(idB, undefined, { numeric: true });
      },
    },
  },
};
