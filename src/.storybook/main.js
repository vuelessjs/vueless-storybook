/** @type { import('@storybook/vue3-vite').StorybookConfig } */
export default {
  stories: [
    "../node_modules/vueless/**/*stories.@(js|jsx|ts|tsx)",
    "../node_modules/vueless/**/*.@(mdx)",
    "../src/**/*stories.@(js|jsx|ts|tsx)",
    "../src/**/*.@(mdx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-dark-mode",
    // "@storybook/addon-themes", TODO: uncomment when dark mode will be implemented to the components.
  ],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
  docs: {
    autodocs: true,
  },
  env: (config) => ({
    ...config,
    BASE_URL: "/",
  }),
};
