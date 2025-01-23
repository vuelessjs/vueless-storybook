import { create } from "@storybook/theming/create";
import { TAILWIND_COLORS } from "vueless/constants.js";

export default create({
  base: "dark",
  // Typography
  fontBase: '"Roboto", sans-serif',
  fontCode: "monospace",

  brandTitle: "Vueless UI",
  brandUrl: "https://vueless.com",
  brandImage:
    "https://raw.githubusercontent.com/vuelessjs/vueless-storybook/main/public/images/vueless-logo-dark.svg",
  brandTarget: "_blank",

  // Main colors
  colorPrimary: TAILWIND_COLORS.cool["200"],
  colorSecondary: TAILWIND_COLORS.cool["700"],

  // UI
  appBg: TAILWIND_COLORS.cool["900"],
  appPreviewBg: TAILWIND_COLORS.cool["900"],
  appBorderColor: TAILWIND_COLORS.cool["900"],
  appBorderRadius: 0,

  // Text colors
  textColor: TAILWIND_COLORS.cool["300"],
  textInverseColor: TAILWIND_COLORS.cool["800"],

  // Toolbar default and active colors
  barTextColor: TAILWIND_COLORS.cool["500"],
  barHoverColor: TAILWIND_COLORS.cool["400"],
  barSelectedColor: TAILWIND_COLORS.cool["300"],
  barBg: TAILWIND_COLORS.cool["950"],

  // Form colors
  inputBg: TAILWIND_COLORS.cool["950"],
  inputBorder: TAILWIND_COLORS.cool["600"],
  inputTextColor: TAILWIND_COLORS.cool["100"],
  inputBorderRadius: 4,

  buttonBg: TAILWIND_COLORS.cool["800"],
  buttonBorder: TAILWIND_COLORS.cool["800"],
  booleanBg: TAILWIND_COLORS.cool["900"],
  booleanSelectedBg: TAILWIND_COLORS.cool["800"],
});
