import { ESLintUtils } from "@typescript-eslint/utils";
import { getTypeName } from "@typescript-eslint/type-utils";
import bcd from "@mdn/browser-compat-data" with { type: "json" };
import browserslist from "browserslist";
// import { SymbolFlags } from "typescript";

// TODO: Normalize this all into a single browser name so we don't have to be converting all the
// dang time.
import type {
  BrowserName as MDNBrowserName,
  SimpleSupportStatement,
} from "@mdn/browser-compat-data";
import type { BrowsersListBrowserName } from "../../types.js";

import type { ParserServicesWithTypeInformation } from "@typescript-eslint/utils";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { Type, UnionOrIntersectionType, TypeChecker } from "typescript";
import type { SimpleSupportStatement } from "@mdn/browser-compat-data";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
);

function getConstrainedTypeAtLocation(
  services: ParserServicesWithTypeInformation,
  node: TSESTree.Node,
): Type | UnionOrIntersectionType {
  const nodeType = services.getTypeAtLocation(node);
  const constrained = services.program
    .getTypeChecker()
    .getBaseConstraintOfType(nodeType);

  return constrained ?? nodeType;
}

function getFailures({
  support,
  browserTargets,
}: {
  support: Record<MDNBrowserName, SimpleSupportStatement>;
  browserTargets: Partial<Record<MDNBrowserName, number>>;
}): Array<{ name: MDNBrowserName; version: number; supportedSince: number }> {
  const supportFailures: Array<{
    name: MDNBrowserName;
    version: number;
    supportedSince: number;
  }> = [];
  for (const [name, version] of Object.entries(browserTargets)) {
    const browserSupport = support[name];
    if (!browserSupport) continue;
    // eslint-disable-next-line
    const supportedSince = Number.parseFloat(browserSupport?.version_added);
    if (version < supportedSince) {
      supportFailures.push({ name, version, supportedSince });
    }
  }
  return supportFailures;
}

function browserslistToMdnNames(
  browserslistData: Partial<Record<BrowsersListBrowserName, number>>,
): Partial<Record<MDNBrowserName, number>> {
  const nameMap: Partial<Record<BrowsersListBrowserName, MDNBrowserName>> = {
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
    // @ts-expect-error TODO
    const newName = nameMap[name];
    if (newName === name) continue;
    // @ts-expect-error TODO
    // eslint-disable-next-line
    browserslistData[newName] = value;
    // @ts-expect-error TODO
    delete browserslistData[name];
  }
  return browserslistData;
}

function findBrowserTargets(
  list: string[],
): Partial<Record<MDNBrowserName, number>> {
  const browsers: Partial<Record<BrowsersListBrowserName, number>> = {};
  for (const item of list) {
    const [name, version] = item.split(" ") as [
      BrowsersListBrowserName,
      string,
    ];
    const parsedVersion = Number.parseFloat(version);
    if (browsers[name] == null || browsers[name] > parsedVersion) {
      browsers[name] = parsedVersion;
    }
  }
  return browserslistToMdnNames(browsers);
}

function findSupport({
  typeName,
  calleeName,
}: {
  typeName: string | undefined;
  calleeName: string | undefined;
}): Partial<
  Record<MDNBrowserName, import("@mdn/browser-compat-data").SupportStatement>
> {
  // TODO: I hate this
  if (typeName === "typeof globalThis") {
    typeName = calleeName;
    calleeName = undefined;
  }

  /** @type {Partial<Record<MDNBrowserName, import('@mdn/browser-compat-data').SupportStatement>> | undefined} */
  let support =
    // TODO
    (typeName &&
      calleeName &&
      bcd.javascript.builtins[typeName]?.[calleeName]?.__compat?.support) ||
    // when `window.Map()`
    (calleeName && bcd.javascript.builtins[calleeName]?.__compat?.support) ||
    // when Map().size
    (typeName && bcd.javascript.builtins[typeName]?.__compat?.support) ||
    // When `window.fetch()`
    (calleeName && bcd.api[calleeName]?.__compat?.support) ||
    // when Window
    (typeName &&
      calleeName &&
      bcd.api[typeName]?.[calleeName]?.__compat?.support) ||
    // When `new ResizeObserver()`
    (typeName && bcd.api[typeName]?.__compat?.support);

  if (typeName === "WebAssembly") {
    support = bcd.webassembly.api[`${calleeName}_static`]?.__compat?.support;
  }

  if (!support) return {};

  // eslint-disable-next-line prefer-const
  for (let [key, value] of Object.entries(support || {})) {
    if (Array.isArray(value)) {
      // @ts-expect-error TODO
      value = value.find((x) => !x.prefix);
    }
    // @ts-expect-error TODO
    value.version_added = value.version_added || Infinity;

    // @ts-expect-error TODO
    if (value.version_added !== Infinity) {
      // @ts-expect-error TODO
      support[key] = {
        // For _some_ reason the dataset has these unicode characters.
        // @ts-expect-error TODO
        // eslint-disable-next-line
        version_added: value.version_added.replace("≤", ""),
      };
    }
  }

  return support;
}

function formatBrowserList(
  failures: Array<{ name: MDNBrowserName; version: number }>,
): unknown {
  const mdnNamesToHuman: Partial<Record<MDNBrowserName, string>> = {
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

function convertToMDNName(
  checker: TypeChecker,
  type: Type,
): string | undefined {
  const typeName = getTypeName(checker, type)
    .replace(/<.*>/gm, "")
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

function getType(
  checker: TypeChecker,
  services: ParserServicesWithTypeInformation,
  node: TSESTree.Node,
): Type {
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

function formatTypeName(typeName: string): string {
  const specialTypes: Record<string, string> = {
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

    // @ts-expect-error TODO
    const options = context.options[0];

    // @ts-expect-error TODO
    // eslint-disable-next-line
    const browsers = browserslist(options?.browserslist);

    return {
      MemberExpression(node) {
        const checkType = (type) => {
          const typeName = convertToMDNName(checker, type);

          if (!typeName || typeName === "{}") return;

          // @ts-expect-error It's possible for the property of the member expression to not have a
          // name. We should test for this. TODO
          const calleeName = node.property.name;

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

          if (Object.keys(support).length > 0) {
            // Only check most recently overridden definition
            return
          }

          const symbol = type.getSymbol()
          if (symbol && symbol.getFlags() & (32 | 64 /* SymbolFlags.Class | SymbolFlags.Interface */)) {
            const baseTypes =  checker.getBaseTypes(type);
            if (baseTypes) {
              baseTypes.forEach((baseType) => checkType(baseType))
            }
          }
        };
        const type = getType(checker, services, node.object);
        checkType(type);
      },
      NewExpression(node) {
        // If we are doing `window.Map()`, then let `MemberExpression` handle this.
        // eslint-disable-next-line
        if (node.callee.type === "MemberExpression") return;

        const type = getType(checker, services, node);
        let typeName = convertToMDNName(checker, type);
        // @ts-expect-error TODO
        typeName = typeName === "any" ? node.callee.name : typeName;

        if (!typeName) return;

        const support = findSupport({ typeName, calleeName: undefined });
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
        const typeName: string = node.callee.name;

        if (!typeName) return;

        const support = findSupport({ typeName, calleeName: undefined });
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
      url: "https://github.com/koddsson/eslint-config-tscompat",
      recommended: true,
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
