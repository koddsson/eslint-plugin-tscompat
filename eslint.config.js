import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPlugin from "eslint-plugin-eslint-plugin";
import { importX } from "eslint-plugin-import-x";

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
    ...eslintPlugin.configs["all-type-checked"],
  },
  {
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
  {
    files: ["index.js", "lib/**"],
    plugins: { "import-x": importX },
    rules: {
      "import-x/no-extraneous-dependencies": [
        "error",
        { devDependencies: false, peerDependencies: true, optionalDependencies: false },
      ],
    },
  },
  {
    ignores: ["eslint.config.js", ".github/"],
  },
);
