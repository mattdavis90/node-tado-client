/** @type { import("eslint").Linter.Config } */
module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  rules: {
    // Fix the stupid "_" is not used; I know, that's
    // why I put an underscore there!!!
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    // Sadly we have a LOT of these due to the nature
    // of the reverse engineering. Warnings are still
    // nice though to track the volume of stuff we don't
    // understand
    "@typescript-eslint/no-explicit-any": "warn",
  },
  env: {
    es2017: true,
    node: true,
  },
};
