import baseConfig from "@quick-jot/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
];
