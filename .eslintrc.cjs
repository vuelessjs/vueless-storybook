module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2020: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    "no-console": "warn",
    "no-debugger": "warn",
    "arrow-parens": ["error", "always"],
    curly: ["error", "multi-line"],
    "padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
      { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
      { blankLine: "always", prev: "directive", next: "*" },
      { blankLine: "any", prev: "directive", next: "directive" },
      { blankLine: "always", prev: "block-like", next: "*" },
      { blankLine: "always", prev: "*", next: "block-like" },
      { blankLine: "always", prev: "*", next: "return" },
    ],
    "prettier/prettier": ["warn", { printWidth: 100, tabWidth: 2 }],
  },
  parserOptions: {
    module: "esnext",
    sourceType: "module",
    ecmaVersion: "latest",
  },
};
