import { create } from "storybook/theming/create";
import type { ThemeVars } from "storybook/theming";
import { theme } from "./theme";

export const themeLightPreview: ThemeVars = create({
  base: "light",

  /* Fonts */
  fontBase: theme.fontBase,
  fontCode: theme.fontCode,

  /* Main colors */
  colorPrimary: theme.colors.gray[900],
  colorSecondary: theme.colors.gray[500],

  /* UI */
  appBg: theme.colors.gray[100],
  appPreviewBg: theme.colors.gray[50],
  appBorderColor: theme.colors.gray[200],
  appContentBg: theme.colors.gray[50],
  appBorderRadius: theme.rounded.lg,

  /* Text colors */
  textColor: theme.colors.gray[900],
  textInverseColor: theme.colors.gray[50],

  /* Toolbar default and active colors */
  barTextColor: theme.colors.gray[500],
  barHoverColor: theme.colors.gray[600],
  barSelectedColor: theme.colors.gray[700],
  barBg: theme.colors.white,

  /* Form colors */
  inputBg: theme.colors.white,
  inputBorder: theme.colors.gray[300],
  inputTextColor: theme.colors.gray[900],
  inputBorderRadius: theme.rounded.sm,
  buttonBg: theme.colors.gray[100],
  buttonBorder: theme.colors.gray[200],
  booleanBg: theme.colors.gray[50],
  booleanSelectedBg: theme.colors.gray[200],
});
