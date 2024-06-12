import { setup } from "@storybook/vue3";

import { backgrounds, docs, layout } from "./configs/main.config";
import { vue3SourceDecorator } from "./decorators/vue3SourceDecorator";

// Vue plugins
import { createVueless } from "vueless";
import { createRouter, createWebHistory } from "vue-router";

// Tailwind styles
import "./index.pcss";

// Create vueless instance
const vueless = createVueless();

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/" }],
});

// Create storybook app instance
const storybookApp = (app) => {
  app.use(router);
  app.use(vueless);
};

// Setup storybook
setup(storybookApp);

// Set storybook config
export default {
  decorators: [vue3SourceDecorator],
  parameters: {
    layout,
    docs,
    backgrounds,
    options: {
      storySort: (a, b) => {
        if (!a.type === "docs") return;

        const idA = a.id.split("--")[0];
        const idB = b.id.split("--")[0];

        return idA.localeCompare(idB, undefined, { numeric: true });
      },
    },
  },
};
