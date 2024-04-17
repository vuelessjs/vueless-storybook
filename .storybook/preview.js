import { setup } from "@storybook/vue3";
import { backgrounds, docs, layout } from "./configs/main.config";
import { vue3SourceDecorator } from "./decorators/vue3SourceDecorator";

// Vue plugins
import { createStore } from "vuex"; // TODO: remove it later
import { createRouter, createWebHistory } from "vue-router";
import NotifyServiceDefault from "vueless/ui.notify/services"; // TODO: move to UI components

// Tailwind styles
import "./index.pcss";

// Common stores TODO: move to UI components
import loader from "vueless/ui.loader-rendering/store";
import loaderTop from "vueless/ui.loader-top/store";
import breakpoint from "vueless/ui.viewport/store";

// Create store instance
const store = createStore({
  modules: { loader, loaderTop, breakpoint },
});

// Create router instance
const router = createRouter({
  history: createWebHistory("/"),
  routes: [{ path: "/:pathMatch(.*)*", component: () => import("vueless/ui.container-page") }],
});

// Create storybook app instance
const storybookApp = (app) => {
  app.use(store);
  app.use(router);
  app.use(new NotifyServiceDefault().notifyInstance);
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
      storySort: (a, b) => (a.id === b.id ? 0 : a.name === "Docs" && a.id.localeCompare(b.id, undefined, { numeric: true })),
    },
  },
};
