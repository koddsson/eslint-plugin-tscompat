import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import * as path from "node:path";

import { RuleTester } from "@typescript-eslint/rule-tester";

RuleTester.afterAll = after;
RuleTester.describe = (text, fn) => void describe(text, fn);
RuleTester.it = (text, fn) => void it(text, fn);
RuleTester.itOnly = (text, fn) => void it.only(text, fn);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tsconfigRootDir = path.join(__dirname, "./fixture/");

export const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      tsconfigRootDir,
      project: "./tsconfig.json",
    },
  },
});
