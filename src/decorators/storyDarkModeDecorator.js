import { DecoratorHelpers } from "@storybook/addon-themes";
import { makeDecorator } from "storybook/preview-api";
import { setTheme } from "vueless";

/* Cache preview color mode. */
let previewColorMode = "";

/* Set Storybook color mode when system color mode changed. */
const prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");

prefersColorSchemeDark.addEventListener("change", (event) => {
  const systemColorMode = event.matches ? "dark" : "light";

  setTheme({ colorMode: previewColorMode || systemColorMode });
});

/* Define color mode decorator. */
export const storyDarkModeDecorator = makeDecorator({
  name: "storyDarkModeDecorator",
  wrapper: (storyFn, context) => {
    const sbAddonThemesConfig = localStorage.getItem("sb-addon-themes-3") || "{}";
    const storybookColorMode = JSON.parse(sbAddonThemesConfig).current || "light";
    const systemColorMode = prefersColorSchemeDark.matches ? "dark" : "light";

    // this fixing first load
    document.body.classList.add(storybookColorMode);

    // TODO: Temporary disables
    // this fixing white blink issue
    // if (window.location.toString().includes("viewMode=docs")) {
    //   document.documentElement.classList.add(storybookColorMode);
    //
    //   setTimeout(() => {
    //     document.documentElement.classList.remove("light", "dark");
    //   }, 4000);
    // }

    DecoratorHelpers.initializeThemeState(["light", "dark"], storybookColorMode || systemColorMode);

    previewColorMode = DecoratorHelpers.pluckThemeFromContext(context);

    setTheme({ colorMode: previewColorMode || systemColorMode });

    return {
      components: { storyFn },
      setup: () => ({ theme: previewColorMode }),
      template: `<story />`,
    };
  },
});
