import tests from "./eslint-plugin-compat-tests.js";

export const valid = tests.valid.map((test) => {
  if (typeof test === "string") {
    return {
      code: test.trim(),
    };
  }
  const { code, settings } = test;
  const options = [{ browserslist: settings?.browsers }];
  return {
    code: code.trim(),
    options,
  };
});

export const invalid = tests.invalid.map(({ code, settings, errors }) => {
  const browserslist = settings?.browsers.map((x) => {
    return x.replace("OperaMini all", "chrome 23");
  });
  const options = [{ browserslist }];
  return {
    code: code.trim(),
    errors,
    options,
  };
});

// eslint-disable-next-line no-console
console.log(JSON.stringify(valid, null, 2));
