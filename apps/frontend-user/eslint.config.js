import js from "@eslint/js";
import { fileURLToPath } from "node:url";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import { includeIgnoreFile } from "@eslint/compat";

const gitignores = [".gitignore", "../../.gitignore"];

export default defineConfig([
  ...gitignores.map((path) =>
    includeIgnoreFile(fileURLToPath(new URL(path, import.meta.url))),
  ),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
]);
