import { ESLintUtils } from "@typescript-eslint/utils";
import bcd from "@mdn/browser-compat-data" with { type: "json" };
import browserslist from "browserslist";
import ts from "typescript";
import * as tsutils from "ts-api-utils";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
);

const capitalize = (str) => `${str[0].toUpperCase()}${str.slice(1)}`;

function getConstrainedTypeAtLocation(services, node) {
  const nodeType = services.getTypeAtLocation(node);
  const constrained = services.program
    .getTypeChecker()
    .getBaseConstraintOfType(nodeType);

  return constrained ?? nodeType;
}

function isSupported({ support, browserTargets }) {
  const supportFailures = [];
  for (const [name, version] of Object.entries(browserTargets)) {
    let browserSupport = support[name];
    if (!browserSupport) continue;
    if (Array.isArray(browserSupport)) {
      browserSupport = browserSupport.find((x) => !x.prefix);
    }
    const supportedSince =
      Number.parseFloat(browserSupport?.version_added) || Infinity;
    if (version < supportedSince) {
      supportFailures.push({ name, version, supportedSince });
    }
  }
  return supportFailures;
}

function browserslistToMdnNames(browserslistData) {
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

function findBrowserTargets(list) {
  const browsers = {};
  for (const item of list) {
    let [name, version] = item.split(" ");
    version = Number.parseFloat(version);
    if (browsers[name] == null || browsers[name] > version) {
      browsers[name] = version;
    }
  }
  return browserslistToMdnNames(browsers);
}

function findSupport({ typeName, calleeName }) {
  let support;

  if (typeName === 'window') {
    support = bcd.api['EventTarget']?.[calleeName]?.__compat?.support || 
      bcd.api[calleeName]?.__compat?.support || 
      bcd.javascript.builtins[calleeName]?.__compat?.support;
  }

  support = 
    support ||
    bcd[typeName.toLowerCase()]?.api[`${calleeName}_static`]?.__compat?.support ||
    bcd.api[capitalize(typeName)]?.[calleeName]?.__compat?.support;

  if (!support) {
    support = bcd.javascript.builtins[typeName][calleeName].__compat.support;
  }

  return support;
}

export const tscompat = createRule({
  create(context) {
    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();

    const options = context.options[0];
    const browsers = browserslist(options?.browserslist);

    return {
      MemberExpression(node) {
        let failingSupport = [];
        let typeName;

        // Extract type from `NewExpression`.
        if (node.object.type === 'NewExpression') {
          typeName = node.object.callee.name || node.object.callee.property.name
        } else {
          const type = getConstrainedTypeAtLocation(services, node.object);
          const [tsType] = Object.entries(ts.TypeFlags).find(
            ([key, value]) => value === type.flags,
          );

          typeName =
            type.symbol?.escapedName ||
            node.object.name ||
            tsType.replace("Literal", "");
        }

        const calleeName = node.property.name;

        typeName = typeName.replace('Constructor', "");

        const support =
          typeName === "globalThis"
            ? bcd.api[calleeName]?.__compat?.support
            : findSupport({ typeName, calleeName });
  
        const browserTargets = findBrowserTargets(browsers);
        failingSupport = isSupported({ support, browserTargets });
        
        if (failingSupport.length) {
          const humanReadableBrowsers = failingSupport
            .sort((a, b) => b.name.localeCompare(a.name))
            .map((x) => `${mdnNamesToHuman[x.name]} ${x.version}`)
            .join(", ");

          context.report({
            message: `${typeName}.${calleeName}() is not supported in ${humanReadableBrowsers}`,
            node,
          });
        }
      },
      NewExpression(node) {
        const type = getConstrainedTypeAtLocation(services, node);
        const typeName = type.symbol?.escapedName || node.callee.name;

        const support = bcd.api[typeName]?.__compat.support || bcd.javascript.builtins[typeName].__compat.support;
        const browserTargets = findBrowserTargets(browsers);
        const failingSupport = isSupported({ support, browserTargets });

        if (failingSupport.length) {
          const browsers = failingSupport
            .sort((a, b) => b.name.localeCompare(a.name))
            .map((x) => `${capitalize(x.name)} ${x.version}`)
            .join(", ");
          context.report({
            message: `${typeName} is not supported in ${browsers}`,
            node,
          });
        }
      },
      CallExpression(node) {
        let failingSupport = [];
        // TODO: This should probably be a member expression?
        if (!node.callee.object) {
          const typeName = node.callee.name;
          const support = bcd.api[typeName]?.__compat?.support;

          const browserTargets = findBrowserTargets(browsers);
          failingSupport = isSupported({ support, browserTargets });

          const humanReadableBrowsers = failingSupport
            .sort((a, b) => b.name.localeCompare(a.name))
            .map((x) => `${mdnNamesToHuman[x.name]} ${x.version}`)
            .join(", ");

          context.report({
            message: `${typeName}() is not supported in ${humanReadableBrowsers}`,
            node,
          });
        }
      },
    };
  },
  meta: {
    docs: {
      description: "Lint codebase for cross-browser compatability.",
    },
    type: "suggestion",
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
  },
  name: "tscompat",
  defaultOptions: [],
});
