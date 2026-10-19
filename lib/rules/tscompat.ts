import { ESLintUtils } from "@typescript-eslint/utils";
import { getTypeName } from "@typescript-eslint/type-utils";
import bcd from "@mdn/browser-compat-data" with { type: "json" };
import browserslist from "browserslist";

import typescript from "typescript";
const { SymbolFlags } = typescript; // Import CJS module in ESM

// TODO: Normalize this all into a single browser name so we don't have to be converting all the
// dang time.
import type {
  BrowserName as MDNBrowserName,
  SimpleSupportStatement,
  SupportStatement,
} from "@mdn/browser-compat-data";
import type { BrowsersListBrowserName } from "../../types.js";

import type { ParserServicesWithTypeInformation } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/typescript-estree";
import type {
  Symbol as TSSymbol,
  Type,
  UnionOrIntersectionType,
  TypeChecker,
} from "typescript";
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
    const browserSupport = support[name as MDNBrowserName];
    if (browserSupport === undefined) continue;

    // If MDN indicates that the feature is not supported at all, then fail.
    if (!browserSupport.version_added) {
      supportFailures.push({
        name: name as MDNBrowserName,
        version,
        supportedSince: Infinity,
      });
      continue;
    }

    // Otherwise, attempt to parse the version at which support was added.
    const supportedSince = browserSupport.version_added === true ? 0 : Number.parseFloat(browserSupport.version_added);
    if (!Number.isNaN(supportedSince) && version < supportedSince) {
      supportFailures.push({
        name: name as MDNBrowserName,
        version,
        supportedSince,
      });
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
}): Partial<Record<MDNBrowserName, SimpleSupportStatement>> {
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

  // First check built-in types (e.g., Set, Array)
  if (["Set", "Array", "Map"].includes(typeName) && calleeName) {
    support =
      bcd.javascript.builtins[typeName]?.[calleeName]?.__compat?.support;

    if (!support) {
      support =
        bcd.javascript.builtins[typeName]?.prototype?.[calleeName]?.__compat
          ?.support;
    }
  }

  if (!support) return {};

  const normalized: Partial<Record<MDNBrowserName, SimpleSupportStatement>> =
    {};
  for (const [browser, statement] of Object.entries(support) as Array<
    [MDNBrowserName, SupportStatement]
  >) {
    const statements = Array.isArray(statement) ? statement : [statement];
    // Prefixed, flagged and preview-only support isn't available to users of a released browser.
    const usable = statements.find(
      (s) => !s.prefix && !s.flags && s.version_added !== "preview",
    );
    normalized[browser] = {
      version_added: usable?.version_added
        ? // For _some_ reason the dataset has these unicode characters.
          usable.version_added.replace("≤", "")
        : false,
    };
  }

  return normalized;
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

const replaceNameRegex = /<.*>/gmu;
function convertToMDNName(checker: TypeChecker, type: Type): string {
  if (checker.isArrayType(type)) {
    return "Array";
  }

  const typeName = getTypeName(checker, type)
    .replace(replaceNameRegex, "")
    .replace("Constructor", "")
    .replace("typeof ", "");

  // Safely check for base types
  const symbol = type.getSymbol();
  if (symbol) {
    // Only check classes/interfaces
    if (symbol.getFlags() & (SymbolFlags.Class | SymbolFlags.Interface)) {
      // @ts-expect-error TS(2345): we check if its an interface above
      const baseTypes = checker.getBaseTypes(type);
      if (baseTypes) {
        for (const baseType of baseTypes) {
          const baseTypeName = convertToMDNName(checker, baseType);
          if (
            ["Set", "Array", "Map", "WeakMap", "WeakSet"].includes(baseTypeName)
          ) {
            return baseTypeName;
          }
        }
      }
    }
  }

  if (typeName === "string") return "String";
  if (typeName.endsWith("[]")) return "Array";
  return typeName;
}

function getType(
  checker: TypeChecker,
  services: ParserServicesWithTypeInformation,
  node: TSESTree.Node,
): Type {
  let type = getConstrainedTypeAtLocation(services, node);
  // If this is a union type we gotta handle that specfically

  // If this is a union type we gotta handle that specifically
  // TODO: Handle this better actually
  if (type.isUnionOrIntersection()) {
    for (const subtype of type.types) {
      const subtypeName = convertToMDNName(checker, subtype);
      if (["Set", "Array", "Map"].includes(subtypeName)) {
        return subtype;
      }
    }
  }

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

type GuardNode =
  | TSESTree.Identifier
  | TSESTree.MemberExpression
  | TSESTree.BinaryExpression;

function getGuardName(node: TSESTree.MemberExpression): string | undefined {
  if (!node.computed && node.property.type === AST_NODE_TYPES.Identifier) {
    return node.property.name;
  }
  if (
    node.property.type === AST_NODE_TYPES.Literal &&
    typeof node.property.value === "string"
  ) {
    return node.property.value;
  }
  return undefined;
}

function collectGuards(
  test: TSESTree.Node,
  guards: GuardNode[] = [],
): GuardNode[] {
  switch (test.type) {
    case AST_NODE_TYPES.Identifier:
    case AST_NODE_TYPES.MemberExpression:
      guards.push(test);
      return guards;
    case AST_NODE_TYPES.ChainExpression:
      return collectGuards(test.expression, guards);
    case AST_NODE_TYPES.LogicalExpression:
      if (test.operator === "&&") {
        collectGuards(test.left, guards);
        collectGuards(test.right, guards);
      }
      return guards;
    case AST_NODE_TYPES.UnaryExpression:
      if (
        test.operator === "!" &&
        test.argument.type === AST_NODE_TYPES.UnaryExpression &&
        test.argument.operator === "!"
      ) {
        collectGuards(test.argument.argument, guards);
      }
      return guards;
    case AST_NODE_TYPES.BinaryExpression: {
      if (
        test.operator === "in" &&
        test.left.type === AST_NODE_TYPES.Literal &&
        typeof test.left.value === "string"
      ) {
        guards.push(test);
        return guards;
      }
      const typeofCheck = getTypeofCheck(test);
      if (typeofCheck?.assertsDefined) {
        collectGuards(typeofCheck.argument, guards);
      }
      return guards;
    }
    default:
      return guards;
  }
}

function collectNegatedGuards(
  test: TSESTree.Node,
  guards: GuardNode[] = [],
): GuardNode[] {
  switch (test.type) {
    case AST_NODE_TYPES.UnaryExpression:
      if (test.operator === "!") collectGuards(test.argument, guards);
      return guards;
    case AST_NODE_TYPES.LogicalExpression:
      if (test.operator === "||") {
        collectNegatedGuards(test.left, guards);
        collectNegatedGuards(test.right, guards);
      }
      return guards;
    case AST_NODE_TYPES.BinaryExpression: {
      const typeofCheck = getTypeofCheck(test);
      if (typeofCheck && !typeofCheck.assertsDefined) {
        collectGuards(typeofCheck.argument, guards);
      }
      return guards;
    }
    default:
      return guards;
  }
}

function getTypeofCheck(
  test: TSESTree.BinaryExpression,
): { argument: TSESTree.Expression; assertsDefined: boolean } | undefined {
  const [typeofSide, literalSide] =
    test.left.type === AST_NODE_TYPES.UnaryExpression
      ? [test.left, test.right]
      : [test.right, test.left];
  if (
    typeofSide.type !== AST_NODE_TYPES.UnaryExpression ||
    typeofSide.operator !== "typeof" ||
    literalSide.type !== AST_NODE_TYPES.Literal
  ) {
    return undefined;
  }
  const isEquality = test.operator === "===" || test.operator === "==";
  const isInequality = test.operator === "!==" || test.operator === "!=";
  if (!isEquality && !isInequality) return undefined;

  if (literalSide.value === "undefined") {
    return { argument: typeofSide.argument, assertsDefined: isInequality };
  }
  if (literalSide.value === "function" || literalSide.value === "object") {
    return { argument: typeofSide.argument, assertsDefined: isEquality };
  }
  return undefined;
}

function isGuardExpression(test: TSESTree.Node, node: TSESTree.Node): boolean {
  return [...collectGuards(test), ...collectNegatedGuards(test)].includes(
    node as GuardNode,
  );
}

function alwaysExits(statement: TSESTree.Statement): boolean {
  switch (statement.type) {
    case AST_NODE_TYPES.ReturnStatement:
    case AST_NODE_TYPES.ThrowStatement:
    case AST_NODE_TYPES.BreakStatement:
    case AST_NODE_TYPES.ContinueStatement:
      return true;
    case AST_NODE_TYPES.BlockStatement:
      return statement.body.some(alwaysExits);
    default:
      return false;
  }
}

function getPrecedingStatements(
  parent: TSESTree.Node,
  child: TSESTree.Node,
): TSESTree.Node[] {
  let body: TSESTree.Node[];
  if (
    parent.type === AST_NODE_TYPES.BlockStatement ||
    parent.type === AST_NODE_TYPES.Program ||
    parent.type === AST_NODE_TYPES.StaticBlock
  ) {
    body = parent.body;
  } else if (parent.type === AST_NODE_TYPES.SwitchCase) {
    body = parent.consequent;
  } else {
    return [];
  }
  const index = body.indexOf(child);
  return index === -1 ? [] : body.slice(0, index);
}

function createGuardDetector(
  services: ParserServicesWithTypeInformation,
  checker: TypeChecker,
) {
  let globals: Map<string, TSSymbol> | undefined;

  function getGlobal(node: TSESTree.Node, name: string): TSSymbol | undefined {
    if (!globals) {
      const sourceFile = services.esTreeNodeToTSNodeMap.get(node).getSourceFile();
      globals = new Map(
        checker
          .getSymbolsInScope(sourceFile, SymbolFlags.Value)
          .map((symbol) => [symbol.name, symbol]),
      );
    }
    return globals.get(name);
  }

  function isGlobalObject(node: TSESTree.Node): boolean {
    const type = services.getTypeAtLocation(node);
    const types = type.isIntersection() ? type.types : [type];
    return types.some((t) =>
      ["Window", "typeof globalThis"].includes(getTypeName(checker, t)),
    );
  }

  function getPropertySymbol(
    object: TSESTree.Node,
    name: string,
  ): TSSymbol | undefined {
    // `window.fetch` is declared on `WindowOrWorkerGlobalScope` but is the same feature as the global `fetch`.
    if (isGlobalObject(object)) {
      const global = getGlobal(object, name);
      if (global) return global;
    }
    return checker.getPropertyOfType(services.getTypeAtLocation(object), name);
  }

  function getFeatureSymbol(node: TSESTree.Node): TSSymbol | undefined {
    if (node.type === AST_NODE_TYPES.Identifier) {
      const symbol = services.getSymbolAtLocation(node);
      return symbol && symbol.flags & SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol;
    }
    if (node.type === AST_NODE_TYPES.MemberExpression) {
      const name = getGuardName(node);
      return name ? getPropertySymbol(node.object, name) : undefined;
    }
    if (
      node.type === AST_NODE_TYPES.BinaryExpression &&
      node.left.type === AST_NODE_TYPES.Literal &&
      typeof node.left.value === "string"
    ) {
      return getPropertySymbol(node.right, node.left.value);
    }
    return undefined;
  }

  // Members of generic types (e.g. `Array<number>.flat`) resolve to distinct instantiated symbols, so compare declarations.
  function isSameFeature(a: TSSymbol, b: TSSymbol): boolean {
    if (a === b) return true;
    const declarations = new Set(b.getDeclarations());
    return (a.getDeclarations() ?? []).some((d) => declarations.has(d));
  }

  return function isFeatureGuarded(
    node: TSESTree.Node,
    feature: TSESTree.Node,
  ): boolean {
    let featureSymbol: TSSymbol | undefined | null = null;
    let child: TSESTree.Node = node;
    for (
      let parent = node.parent;
      parent;
      child = parent, parent = parent.parent
    ) {
      const guards: GuardNode[] = [];
      if (
        parent.type === AST_NODE_TYPES.IfStatement ||
        parent.type === AST_NODE_TYPES.ConditionalExpression
      ) {
        if (child === parent.test) {
          if (isGuardExpression(parent.test, node)) return true;
        } else if (child === parent.consequent) {
          collectGuards(parent.test, guards);
        } else {
          collectNegatedGuards(parent.test, guards);
        }
      } else if (
        parent.type === AST_NODE_TYPES.LogicalExpression &&
        (parent.operator === "&&" || parent.operator === "||")
      ) {
        if (child === parent.left) {
          if (isGuardExpression(parent.left, node)) return true;
        } else if (parent.operator === "&&") {
          collectGuards(parent.left, guards);
        } else {
          collectNegatedGuards(parent.left, guards);
        }
      } else {
        for (const statement of getPrecedingStatements(parent, child)) {
          if (
            statement.type === AST_NODE_TYPES.IfStatement &&
            alwaysExits(statement.consequent)
          ) {
            collectNegatedGuards(statement.test, guards);
          }
        }
      }

      if (guards.length === 0) continue;
      if (featureSymbol === null) featureSymbol = getFeatureSymbol(feature);
      if (!featureSymbol) return false;
      for (const guard of guards) {
        const guardSymbol = getFeatureSymbol(guard);
        if (guardSymbol && isSameFeature(featureSymbol, guardSymbol)) {
          return true;
        }
      }
    }
    return false;
  };
}

const globalObjectTypeNames = new Set([
  "Window",
  "globalThis",
  "typeof globalThis",
]);

function getPolyfills(settings: Record<string, unknown>): Set<string> {
  const { polyfills } = settings;
  return new Set(
    Array.isArray(polyfills)
      ? polyfills.filter((p): p is string => typeof p === "string")
      : [],
  );
}

function isPolyfilled(
  polyfills: Set<string>,
  typeName: string,
  calleeName?: string,
): boolean {
  if (polyfills.size === 0) return false;
  if (!calleeName) return polyfills.has(typeName);
  if (globalObjectTypeNames.has(typeName)) {
    return (
      polyfills.has(calleeName) ||
      polyfills.has(`${formatTypeName(typeName)}.${calleeName}`)
    );
  }
  return (
    polyfills.has(typeName) ||
    polyfills.has(`${typeName}.${calleeName}`) ||
    polyfills.has(`${typeName}.prototype.${calleeName}`)
  );
}

export const tscompat = createRule({
  create(context) {
    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();
    const isFeatureGuarded = createGuardDetector(services, checker);
    const polyfills = getPolyfills(context.settings);

    // @ts-expect-error TODO
    const options = context.options[0];

    // @ts-expect-error TODO
    // eslint-disable-next-line
    const browsers = browserslist(options?.browserslist);

    return {
      MemberExpression(node: TSESTree.MemberExpression) {
        // Check for computed properties using Symbol
        if (node.computed) {
          let symbolName: string | null = null;
          if (
            node.property.type === AST_NODE_TYPES.MemberExpression &&
            !node.property.computed &&
            node.property.object.type === AST_NODE_TYPES.Identifier &&
            node.property.object.name === "Symbol" &&
            node.property.property.type === AST_NODE_TYPES.Identifier
          ) {
            symbolName = node.property.property.name;
          }

          if (!symbolName) {
            return;
          }

          // Step 2: Get Type Checker
          const tsNode = services.esTreeNodeToTSNodeMap.get(
            node.object
          );

          // Step 3: Resolve Type of Base Object
          const tsType = checker.getTypeAtLocation(tsNode);
          let baseTypeName: string | null = null;

          if (tsType) {
            // Get the Fully Qualified Type Name
            const symbol = tsType.getSymbol();
            if (symbol) {
              baseTypeName = checker.getFullyQualifiedName(symbol);
            } else {
              baseTypeName = checker.typeToString(tsType);
            }
          }

          if (!baseTypeName || isPolyfilled(polyfills, baseTypeName)) {
            return;
          }

          // Step 4: Check Symbol Support in Context of Resolved Type
          const support = findSupport({
            typeName: baseTypeName,
            calleeName: symbolName,
          });
          const failures = getFailures({
            support,
            browserTargets: findBrowserTargets(browsers),
          });

          if (failures.length) {
            context.report({
              data: {
                typeName: `${baseTypeName}[Symbol.${symbolName}]`,
                browsers: formatBrowserList(failures),
              },
              messageId: "incompatable",
              node,
            });
          }
          return;
        }

        // Skip check for array index access (e.g., arr[0])
        if (node.property.type !== AST_NODE_TYPES.Identifier) return;

        if (isFeatureGuarded(node, node)) return;

        const tsProp = services.esTreeNodeToTSNodeMap.get(node.property);
        const propertySymbol = checker.getSymbolAtLocation(tsProp);
        if (propertySymbol) {
          const declarations = propertySymbol.getDeclarations();
          if (declarations?.length) {
            // Determine if all declarations come from a lib file (built-in)
            const isBuiltin = declarations.every((decl) => {
              const fileName = decl.getSourceFile().fileName;
              // Adjust the check as needed to match the paths of your TS lib files
              return (
                fileName.includes("typescript/lib") ||
                // this is needed so that e.g. `Array#at` is checked correctly
                fileName.includes("@types/node/globals.d.ts") ||
                // @types/node >=25 moved web globals (e.g. fetch) here
                fileName.includes("@types/node/web-globals/")
              );
            });
            if (!isBuiltin) {
              // If at least one declaration is not from a lib file, it's a custom method.
              // Skip the compatibility check.
              return;
            }
          }
        }

        const checkType = (type: Type) => {
          const typeName = convertToMDNName(checker, type);

          if (!typeName || typeName === "{}") return;

          // @ts-expect-error It's possible for the property of the member expression to not have a
          // name. We should test for this. TODO
          const calleeName = node.property.name;
          if (isPolyfilled(polyfills, typeName, calleeName)) return;

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
          if (symbol && symbol.getFlags() & (SymbolFlags.Class | SymbolFlags.Interface)) {
            const baseTypes = checker.getBaseTypes(type);
            if (baseTypes) {
              baseTypes.forEach((baseType) => checkType(baseType))
            }
          }
        };
        const type = getType(checker, services, node.object);
        checkType(type);
      },
      NewExpression(node: TSESTree.NewExpression) {
        // If we are doing `window.Map()`, then let `MemberExpression` handle this.
        // eslint-disable-next-line
        if (node.callee.type === AST_NODE_TYPES.MemberExpression) return;

        const type = getType(checker, services, node);
        let typeName = convertToMDNName(checker, type);
        // @ts-expect-error TODO `name` can be undefined
        typeName = typeName === "any" ? node.callee.name : typeName;

        if (!typeName) return;
        if (isFeatureGuarded(node, node.callee)) return;
        if (isPolyfilled(polyfills, typeName)) return;

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
      CallExpression(node: TSESTree.CallExpression) {
        // @ts-expect-error TODO `name` can be undefined
        const typeName: string = node.callee.name;

        if (!typeName) return;
        if (isFeatureGuarded(node, node.callee)) return;
        if (isPolyfilled(polyfills, typeName)) return;

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
      items: [
        {
          type: "object",
          properties: {
            browserslist: {
              type: "array",
            },
          },
          additionalProperties: false,
        },
      ],
    },
    defaultOptions: [{ browserslist: [">0.3%", "not dead"] }],
    messages: {
      incompatable: "{{typeName}} is not supported in {{browsers}}",
    },
  },
  name: "tscompat",
  defaultOptions: [],
});
