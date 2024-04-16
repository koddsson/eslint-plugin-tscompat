import { ESLintUtils } from "@typescript-eslint/utils";
import { getTypeName } from "@typescript-eslint/type-utils";
import bcd from "@mdn/browser-compat-data" with { type: "json" };
import browserslist from "browserslist";

// TODO: Normalize this all into a single browser name so we don't have to be converting all the
// dang time.
/** @typedef {import('./types.js').BrowsersListBrowserName} BrowsersListBrowserName */
/** @typedef {import('@mdn/browser-compat-data').BrowserName} MDNBrowserName */

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
);

/** @param {string} str */
const capitalize = (str) => `${str[0].toUpperCase()}${str.slice(1)}`;

/**
 * @param {import('@typescript-eslint/utils').ParserServicesWithTypeInformation} services
 * @param {import('@typescript-eslint/typescript-estree').TSESTree.Node} node

 * @returns {import('typescript').Type | import('typescript').UnionOrIntersectionType}
 */
function getConstrainedTypeAtLocation(services, node) {
  const nodeType = services.getTypeAtLocation(node);
  const constrained = services.program
    .getTypeChecker()
    .getBaseConstraintOfType(nodeType);

  return constrained ?? nodeType;
}

/**
 * @param {{support: Partial<Record<MDNBrowserName, {version_added: string}>>, browserTargets: Partial<Record<MDNBrowserName, number>>}} default
 *
 * @returns {Array<{name: MDNBrowserName, version: number, supportedSince: number}>}
 */
function getFailures({ support, browserTargets }) {
  /** @type {Array<{name: MDNBrowserName, version: number, supportedSince: number}>} */
  const supportFailures = [];
  for (const [name, version] of Object.entries(browserTargets)) {
    // @ts-expect-error
    let browserSupport = support[name];
    if (!browserSupport) continue;
    const supportedSince = Number.parseFloat(browserSupport?.version_added);
    if (version < supportedSince) {
      // @ts-expect-error
      supportFailures.push({ name, version, supportedSince });
    }
  }
  return supportFailures;
}

/**
 * @param {Partial<Record<BrowsersListBrowserName, number>>} browserslistData
 */
function browserslistToMdnNames(browserslistData) {
  /** @type {Partial<Record<BrowsersListBrowserName, MDNBrowserName>>} */
  const nameMap = {
    chrome: "chrome",
    and_chr: "chrome_android",
    edge: "edge",
    firefox: "firefox",
    and_ff: "firefox_android",
    android: "webview_android",
    ios_saf: "safari_ios",
    opera: "opera",
    safari: "safari",
    samsung: "samsunginternet_android",
  };
  for (const [name, value] of Object.entries(browserslistData)) {
    const newName = nameMap[name];
    if (newName === name) continue;
    browserslistData[newName] = value;
    delete browserslistData[name];
  }
  return browserslistData;
}

/**
 * @param {string[]} list
 *
 * @returns {Partial<Record<MDNBrowserName, number>>}
 */
function findBrowserTargets(list) {
  /** @type {Partial<Record<BrowsersListBrowserName, number>>} */
  const browsers = {};
  for (const item of list) {
    /** @type {[BrowsersListBrowserName, string]} */
    let [name, version] = item.split(" ");
    const parsedVersion = Number.parseFloat(version);
    if (browsers[name] == null || browsers[name] > parsedVersion) {
      browsers[name] = parsedVersion;
    }
  }
  return browserslistToMdnNames(browsers);
}

/**
 * @param {{typeName: string | undefined, calleeName: string | undefined}} default
 *
 * @returns {Partial<Record<MDNBrowserName, import('@mdn/browser-compat-data').SupportStatement>>}
 */
function findSupport({ typeName, calleeName }) {
  // TODO: I hate this
  if (typeName === "typeof globalThis") {
    typeName = calleeName;
    calleeName = undefined;
  }

  let support =
    // TODO
    bcd.javascript.builtins[typeName]?.[calleeName]?.__compat?.support ||
    // when `window.Map()`
    (calleeName && bcd.javascript.builtins[calleeName]?.__compat?.support) ||
    // when Map().size
    bcd.javascript.builtins[typeName]?.__compat?.support ||
    // When `window.fetch()`
    bcd.api[calleeName]?.__compat?.support ||
    // when Window
    bcd.api[typeName]?.[calleeName]?.__compat?.support ||
    // When `new ResizeObserver()`
    bcd.api[typeName]?.__compat?.support;

  if (typeName === "WebAssembly") {
    support = bcd.webassembly.api[`${calleeName}_static`]?.__compat?.support;
  }

  if (!support) return {};

  for (let [key, value] of Object.entries(support || {})) {
    if (Array.isArray(value)) {
      value = value.find((x) => !x.prefix);
    }
    value.version_added = value.version_added || Infinity;

    if (value.version_added !== Infinity) {
      support[key] = {
        // For _some_ reason the dataset has these unicode characters.
        version_added: value.version_added.replace("≤", ""),
      };
    }
  }

  return support;
}

/**
 * @param {Array<{name: MDNBrowserName, version: number}>} failures
 */
function formatBrowserList(failures) {
  /** @type {Partial<Record<MDNBrowserName, string>>} */
  const mdnNamesToHuman = {
    chrome: "Chrome",
    chrome_android: "Chrome Android",
    edge: "Edge",
    firefox: "Firefox",
    firefox_android: "Firefox Android",
    webview_android: "Android",
    safari_ios: "Safari iOS",
    opera: "Opera",
    safari: "Safari",
    samsunginternet_android: "Samsung",
  };

  return failures
    .sort((a, b) => b.name.localeCompare(a.name))
    .map((x) => `${mdnNamesToHuman[x.name]} ${x.version}`)
    .join(", ");
}

/**
 * @param {import('typescript').TypeChecker} checker
 * @param {import('typescript').Type} type
 *
 * @returns {string | undefined}
 */
function convertToMDNName(checker, type) {
  const typeName = getTypeName(checker, type)
    .replace(/\<.*\>/gm, "")
    .replace("Constructor", "")
    .replace("typeof ", "");

  if (typeName === "string") {
    return "String";
  }

  if (typeName.endsWith("[]")) {
    return "Array";
  }

  return typeName;
}

/**
 * @param {import('typescript').TypeChecker} checker
 * @param {import('@typescript-eslint/utils').ParserServicesWithTypeInformation} services
 * @param {import('@typescript-eslint/typescript-estree').TSESTree.Node} node
 *
 * @returns {import('typescript').Type}
 */
function getType(checker, services, node) {
  let type = getConstrainedTypeAtLocation(services, node);
  // If this is a union type we gotta handle that specfically
  // TODO: Handle this better actually

  if ("types" in type) {
    const found = type.types
      .map((type) => {
        return { typeName: getTypeName(checker, type), type };
      })
      .find(({ typeName }) => typeName === "Window");

    if (!found) {
      return checker.getAnyType();
    }
    // @ts-expect-error todo
    type = type.types
      .map((type) => {
        return { typeName: getTypeName(checker, type), type };
      })
      .find(({ typeName }) => typeName === "Window").type;
  }
  return type;
}

/**
 * @param {string} typeName
 * @returns {string}
 */
function formatTypeName(typeName) {
  /** @type {Record<string, string>} */
  const specialTypes = {
    Window: "window",
    "typeof globalThis": "globalThis",
  };

  if (typeName in specialTypes) {
    return specialTypes[typeName];
  }

  return typeName;
}

export const tscompat = createRule({
  create(context) {
    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();

    const options = context.options[0];
    const browsers = browserslist(options?.browserslist);

    return {
      MemberExpression(node) {
        const type = getType(checker, services, node.object);
        const typeName = convertToMDNName(checker, type);

        // @ts-expect-error It's possible for the property of the member expression to not have a
        // name. We should test for this. TODO
        const calleeName = node.property.name;

        /** @type {Record<string, {version_added: string}>} */
        const support = findSupport({ typeName, calleeName });
        const browserTargets = findBrowserTargets(browsers);
        const failures = getFailures({ support, browserTargets });

        if (failures.length) {
          const humanReadableBrowsers = formatBrowserList(failures);

          context.report({
            data: {
              typeName: `${formatTypeName(typeName)}.${calleeName}()`,
              browsers: humanReadableBrowsers,
            },
            messageId: "incompatable",
            node,
          });
        }
      },
      NewExpression(node) {
        // If we are doing `window.Map()`, then let `MemberExpression` handle this.
        if (node.callee.type === "MemberExpression") return;

        const type = getType(checker, services, node);
        let typeName = convertToMDNName(checker, type);
        typeName = typeName === "any" ? node.callee.name : typeName;

        /** @type {Record<string, {version_added: string}>} */
        const support = findSupport({ typeName });
        const browserTargets = findBrowserTargets(browsers);
        const failures = getFailures({ support, browserTargets });

        if (failures.length) {
          const humanReadableBrowsers = formatBrowserList(failures);

          context.report({
            data: {
              typeName: formatTypeName(typeName),
              browsers: humanReadableBrowsers,
            },
            messageId: "incompatable",
            node,
          });
        }
      },
      CallExpression(node) {
        /** @type {string} */
        const typeName = node.callee.name;

        if (!typeName) return;

        /** @type {Record<string, {version_added: string}>} */
        const support = findSupport({ typeName });
        const browserTargets = findBrowserTargets(browsers);
        const failures = getFailures({ support, browserTargets });

        if (failures.length) {
          const humanReadableBrowsers = formatBrowserList(failures);

          context.report({
            data: {
              typeName: `${formatTypeName(typeName)}()`,
              browsers: humanReadableBrowsers,
            },
            messageId: "incompatable",
            node,
          });
        }
      },
    };
  },
  meta: {
    type: "problem",
    docs: {
      description: "enforce cross-browser compatability in codebase",
      url: "notsure",
    },
    schema: {
      type: "array",
      minItems: 1,
      items: [
        {
          type: "object",
          properties: {
            browserslist: {
              type: "array",
            },
          },
          required: ["browserslist"],
          additionalProperties: false,
        },
      ],
    },
    messages: {
      incompatable: "{{typeName}} is not supported in {{browsers}}",
    },
  },
  name: "tscompat",
  defaultOptions: [],
});
