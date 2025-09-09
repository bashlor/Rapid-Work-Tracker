import js from "@eslint/js";
import perfectionist from 'eslint-plugin-perfectionist'
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: ["dist/**/*", "build/**/*", "node_modules/**/*", "**/*.d.ts"]
  },
  { 
    extends: ["js/recommended"], 
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], 
    languageOptions: { globals: globals.browser }, 
    plugins: { js } 
  },
  ...tseslint.configs.recommended,
  perfectionist.configs['recommended-natural']
]);
