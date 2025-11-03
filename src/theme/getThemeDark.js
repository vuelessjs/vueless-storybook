import { create } from "storybook/theming";

export function getThemeDark(theme) {
  return create({
    base: "dark",

    /* Fonts */
    fontBase: theme.fontBase,
    fontCode: theme.fontCode,

    /* Brand block */
    brandTitle: theme.brandTitle,
    brandUrl: theme.brandUrl,
    brandImage: theme.brandImageDark,
    brandTarget: theme.brandTarget,

    /* Main colors */
    colorPrimary: theme.colors.gray[200],
    colorSecondary: theme.colors.gray[700],

    /* UI */
    appBg: theme.colors.gray[900],
    appPreviewBg: theme.colors.gray[900],
    appBorderColor: theme.colors.gray[900],
    appBorderRadius: 0,

    /* Text colors */
    textColor: theme.colors.gray[300],
    textInverseColor: theme.colors.gray[800],

    /* Toolbar default and active colors */
    barTextColor: theme.colors.gray[500],
    barHoverColor: theme.colors.gray[400],
    barSelectedColor: theme.colors.gray[300],
    barBg: theme.colors.gray[950],

    /* Form colors */
    inputBg: theme.colors.gray[950],
    inputBorder: theme.colors.gray[600],
    inputTextColor: theme.colors.gray[100],
    inputBorderRadius: theme.rounded.sm,
    buttonBg: theme.colors.gray[800],
    buttonBorder: theme.colors.gray[800],
    booleanBg: theme.colors.gray[900],
    booleanSelectedBg: theme.colors.gray[800],
  });
}
