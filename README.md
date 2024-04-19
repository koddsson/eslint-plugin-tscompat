# `eslint-plugin-tscompat`

> A type-aware browser compatability ESLint rule

## Install

Assuming you already have ESLint installed, run:

```sh
npm install eslint-plugin-tscompat --save-dev
```

## Usage

Then extend the recommended eslint config:

```js
import tscompat from "@koddsson/eslint-plugin-tscompat";
import parser from "@typescript-eslint/parser";

export default [
  {
    plugins: {
      tscompat,
    },
    rules: {
      "tscompat/tscompat": [
        "error",
        { browserslist: [">0.3%", "last 2 versions", "not dead"] },
      ],
    },
    languageOptions: {
      parser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
    },
  },
];
```
