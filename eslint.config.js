import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
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
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
  {
    ignores: ["eslint.config.js", ".github/"],
  },
);
