import { ESLintUtils } from "@typescript-eslint/utils";
import { getTypeName } from "@typescript-eslint/type-utils";
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

function getFailures({ support, browserTargets }) {
  const supportFailures = [];
  for (const [name, version] of Object.entries(browserTargets)) {
    let browserSupport = support[name];
    if (!browserSupport) continue;
    const supportedSince = Number.parseFloat(browserSupport?.version_added);
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

  if (typeName === "window") {
    support =
      bcd.api["EventTarget"]?.[calleeName]?.__compat?.support ||
      bcd.api[calleeName]?.__compat?.support ||
      bcd.javascript.builtins[calleeName]?.__compat?.support;
  }

  support =
    support ||
    bcd[typeName.toLowerCase()]?.api[`${calleeName}_static`]?.__compat
      ?.support ||
    bcd.api[capitalize(typeName)]?.[calleeName]?.__compat?.support;

  if (!support) {
    console.log({ typeName, calleeName });
    support = bcd.javascript.builtins[typeName][calleeName].__compat.support;
  }

  for (let [key, value] of Object.entries(support)) {
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

function formatBrowserList() {

  return failures
            .sort((a, b) => b.name.localeCompare(a.name))
            .map((x) => `${mdnNamesToHuman[x.name]} ${x.version}`)
            .join(", ");
}

export const tscompat = createRule({
  create(context) {
    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();

    const options = context.options[0];
    const browsers = browserslist(options?.browserslist);

    return {
      MemberExpression(node) {
        let typeName = getTypeName(
          checker,
          getConstrainedTypeAtLocation(services, node.object),
        )
          .replace("Constructor", "")
          .replace("<unknown>", "");

        console.log(Object.keys(getConstrainedTypeAtLocation(services, node.object)));
        console.log(getTypeName(checker, getConstrainedTypeAtLocation(services, node.object).types[0]));
        console.log(typeName)


        const browserTargets = findBrowserTargets(browsers);
        const failures = getFailures({ support, browserTargets });

        if (failures.length) {
          const humanReadableBrowsers = formatBrowserList(failures);

          context.report({
            message: `${typeName}.${calleeName}() is not supported in ${humanReadableBrowsers}`,
            node,
          });
        }
      },
      NewExpression(node) { },
      CallExpression(node) { },
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
