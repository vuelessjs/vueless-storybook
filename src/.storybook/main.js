import { resolve } from "node:path";

/** @type { import('@storybook/vue3-vite').StorybookConfig } */
export default {
  stories: [
    "../node_modules/vueless/**/stories.{js,jsx,ts,tsx}",
    "../node_modules/vueless/**/docs.mdx",
    /* Define a path to your own component stories. */
    // "../src/**/stories.{js,jsx,ts,tsx}",
    // "../src/**/docs.mdx",
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-links",
    resolve(__dirname, "./addons/storybook-dark-mode/preset/manager.tsx"),
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/vue3-vite",
    options: {
      builder: {
        viteConfigPath: ".storybook/vite.config.js",
      },
    },
  },
  env: (config) => ({
    ...config,
    BASE_URL: "/",
  }),
};
