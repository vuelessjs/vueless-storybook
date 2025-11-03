import { create } from "@storybook/theming";

export function getThemeLight(theme) {
  return create({
    base: "light",

    /* Fonts */
    fontBase: theme.fontBase,
    fontCode: theme.fontCode,

    /* Brand block */
    brandTitle: theme.brandTitle,
    brandUrl: theme.brandUrl,
    brandImage: theme.brandImageLight,
    brandTarget: theme.brandTarget,

    /* Main colors */
    colorPrimary: theme.colors.gray[900],
    colorSecondary: theme.colors.gray[500],

    /* UI */
    appBg: theme.colors.white,
    appPreviewBg: theme.colors.gray[50],
    appBorderColor: theme.colors.gray[300],
    appBorderRadius: 0,

    /* Text colors */
    textColor: theme.colors.gray[900],
    textInverseColor: theme.colors.gray[900],

    /* Toolbar default and active colors */
    barTextColor: theme.colors.gray[500],
    barHoverColor: theme.colors.gray[600],
    barSelectedColor: theme.colors.gray[700],
    barBg: theme.colors.gray[50],

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
}
