import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import jsdoc from "eslint-plugin-jsdoc";
import eslintPlugin from "eslint-plugin-eslint-plugin";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ...eslintPlugin.configs["flat/all-type-checked"],
  },
  {
    ...jsdoc.configs["flat/recommended"],
  },
  {
    ignores: ["eslint.config.js"],
  },
);
