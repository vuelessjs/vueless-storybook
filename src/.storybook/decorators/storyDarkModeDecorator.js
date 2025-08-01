import { DecoratorHelpers } from "@storybook/addon-themes";
import { setTheme } from "vueless";
import { COLOR_MODE_KEY } from "vueless/constants.js";

const { initializeThemeState, pluckThemeFromContext } = DecoratorHelpers;

const prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");

prefersColorSchemeDark.addEventListener("change", (event) => {
  setTheme({ colorMode: event.matches ? "dark" : "light" });
});

export const storyDarkModeDecorator = () => {
  /* Set theme className to html tag before initialization (fix white blink issue). */
  const sbAddonThemesConfig = localStorage.getItem("sb-addon-themes-3") || "{}";
  const storybookTheme = JSON.parse(sbAddonThemesConfig).current || "light";

  // this fixing first load
  document.body.classList.add(storybookTheme);

  // this fixing white blink issue
  if (window.location.toString().includes("viewMode=docs")) {
    document.documentElement.classList.add(storybookTheme);

    setTimeout(() => {
      document.documentElement.classList.remove("light", "dark");
    }, 4000);
  }

  /* Initialize theme state. */
  const colorMode = prefersColorSchemeDark.matches ? "dark" : "light";
  const cachedColorMode = localStorage.getItem(COLOR_MODE_KEY) || colorMode;

  initializeThemeState(["light", "dark"], cachedColorMode);

  return (story, context) => {
    const theme = pluckThemeFromContext(context);

    setTheme({ colorMode: theme });

    return {
      components: { story },
      setup() {
        return { theme };
      },
      template: `<story />`,
    };
  };
};
