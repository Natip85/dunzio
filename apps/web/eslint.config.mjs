import baseConfig, { restrictEnvAccess } from "@quick-jot/eslint-config/base";
import nextjsConfig from "@quick-jot/eslint-config/nextjs";
import reactConfig from "@quick-jot/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
