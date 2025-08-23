import { addons } from "storybook/manager-api";

/* Theme styles */
import "./themes/manager.css";
import themeDark from "./themes/themeDark.js";
import themeLight from "./themes/themeLight.js";

const prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");

function setSystemTheme(theme) {
  addons.setConfig({
    theme: theme ? themeDark : themeLight,
    panelPosition: "right",
  });
}

setSystemTheme(prefersColorSchemeDark.matches);

prefersColorSchemeDark.addEventListener("change", (event) => {
  setSystemTheme(event.matches);
});
