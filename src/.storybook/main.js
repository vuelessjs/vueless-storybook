/** @type { import('@storybook/vue3-vite').StorybookConfig } */
export default {
  stories: [
    "../node_modules/vueless/**/stories.@(js|jsx|ts|tsx)",
    "../node_modules/vueless/**/docs.@(mdx)",
    /* Define a path to your own component stories. */
    // "../.vueless/**/stories.@(js|jsx|ts|tsx)",
    // "../.vueless/**/docs.@(mdx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-dark-mode",
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
