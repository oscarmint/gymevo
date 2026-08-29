import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Kit canónico del SO: se copia tal cual a components/landing/, no se
    // lintea aquí (mismo criterio que tsconfig.json).
    "plantillas-codigo/**",
    "docs/**",
  ]),
]);

export default eslintConfig;
