import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import * as path from "node:path";

import { RuleTester } from "@typescript-eslint/rule-tester";

RuleTester.afterAll = after;
// eslint-disable-next-line @typescript-eslint/no-misused-promises
RuleTester.describe = describe;
// eslint-disable-next-line @typescript-eslint/no-misused-promises
RuleTester.it = it;
// eslint-disable-next-line @typescript-eslint/no-misused-promises
RuleTester.itOnly = it.only;

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
