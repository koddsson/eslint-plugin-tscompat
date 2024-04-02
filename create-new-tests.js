import tests from './eslint-plugin-compat-tests.js';

export const valid = tests.valid.map((test)=> {
  const {code, settings} = test;
  if (!code) {
    return {
      code: test.trim()
    }
  }

  const options = [{browserslist: settings?.browsers}];
  return {
    code: code.trim(), options,
  }
});

export const invalid = tests.invalid.map(({code, settings, errors})=> {
  const browserslist = settings?.browsers.map(x => {
    return x.replace('OperaMini all', 'chrome 23');
  });
  const options = [{browserslist}];
  return {
    code: code.trim(), errors, options,
  }
});

console.log(JSON.stringify(invalid, null, 2));
