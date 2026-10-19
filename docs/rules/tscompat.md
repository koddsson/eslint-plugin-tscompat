# Lint for browser compatability (`tscompat/tscompat`)

This rule enables linting your code for browser compatibility.

## Polyfills

If you polyfill an API, list it in the shared `polyfills` setting (the same setting [eslint-plugin-compat](https://github.com/amilajack/eslint-plugin-compat) uses) and it won't be reported:

```js
export default [
  {
    settings: {
      polyfills: ["fetch", "Promise.allSettled", "Array.prototype.at", "IntersectionObserver"],
    },
  },
];
```

An entry can name a global (`fetch`, `IntersectionObserver`), a static or instance member (`Promise.allSettled`, `Array.prototype.at`), or a whole object (`Promise` covers every `Promise` API).
