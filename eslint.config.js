import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

import {rule} from './rule.js';

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
    files: ["*.ts"],
    plugins: {
      'my-rule': {
        rules: {
          'no-loop-over-enum': rule
        }
      },
    },
    rules: {
      'my-rule/no-loop-over-enum': "error"
    }
  },
  {
    ignores: ["eslint.config.js", "rule.js"],
  }
);
