import {fileURLToPath} from 'node:url';
import * as path from 'node:path';

import { RuleTester } from "@typescript-eslint/rule-tester";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tsconfigRootDir = path.join(__dirname, './fixture/');

export const ruleTester = new RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir,
    project: './tsconfig.json',
  },
});
