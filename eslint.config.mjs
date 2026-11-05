
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Ignore legacy vanilla JavaScript and Node.js test files.
  // These will continue to be tested separately with node --test.
  {
    ignores: [
      "script.js",
      "validation.js",
      "tests/**",
      "index.html",
      "styles.css",
    ],
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
