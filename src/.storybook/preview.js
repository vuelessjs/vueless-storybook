import { setup } from "@storybook/vue3";

import themeLight from "./themes/themeLight.js";
import themeDark from "./themes/themeDark.js";
import themeLightDocs from "./themes/themeLightDocs.js";
import { storyDarkModeDecorator } from "./decorators/storyDarkModeDecorator.js";
import { vue3SourceDecorator } from "./decorators/vue3SourceDecorator.js";
import { DARK_MODE_SELECTOR, LIGHT_MODE_SELECTOR } from "vueless/constants.js";

/* Tailwind styles */
import "./index.css";

/* Vue plugins */
import { createVueless } from "vueless";
import { createRouter, createWebHistory } from "vue-router";

/* Setup storybook */
setup((app, storyContext) => {
  const vueless = createVueless();
  const router = createRouter({ history: createWebHistory(), routes: [] });

  app.config.idPrefix = storyContext.id;

  if (!app._context.config.globalProperties.$route) {
    app.use(router);
    app.use(vueless);
  }
});

/* Set storybook decorators */
export const decorators = [
  vue3SourceDecorator,
  storyDarkModeDecorator(DARK_MODE_SELECTOR, LIGHT_MODE_SELECTOR),
];

/* Set storybook parameters */
export const parameters = {
  layout: "fullscreen",
  backgrounds: { disable: true },
  docs: {
    theme: themeLightDocs,
    source: { language: "html" },
  },
  darkMode: {
    light: themeLight,
    dark: themeDark,
    classTarget: "body",
    stylePreview: true,
  },
  options: {
    storySort: (a, b) => {
      const idA = a.id.split("--")[0];
      const idB = b.id.split("--")[0];

      return idA.localeCompare(idB, undefined, { numeric: true });
    },
  },
};
