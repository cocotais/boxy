module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["plugin:prettier/recommended"],
  overrides: [],
  parserOptions: { parser: "@babel/eslint-parser", ecmaVersion: "latest", sourceType: "module" },
  plugins: ["simple-import-sort"],
  rules: { "simple-import-sort/imports": "error", "simple-import-sort/exports": "error" },
};
