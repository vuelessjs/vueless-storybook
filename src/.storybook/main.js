/** @type { import('@storybook/vue3-vite').StorybookConfig } */
import { defineConfigWithVueless } from "vueless/utils/node/storybook.js";

export default defineConfigWithVueless({
  stories: [
    /* Define a path to your own component stories. */
    // "../src/**/stories.{js,jsx,ts,tsx}",
    // "../src/**/docs.mdx",
  ],
});
