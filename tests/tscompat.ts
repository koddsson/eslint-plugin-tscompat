import browserslist from "browserslist";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ruleTester } from "./test-helper.js";
import { tscompat } from "../lib/rules/tscompat.js";

ruleTester.run("tscompat", tscompat, {
  valid: [
    {
      code: "Promise.allSettled()",
      options: [{ browserslist: ["chrome 72"] }],
      settings: { polyfills: ["Promise.allSettled"] },
    },
    {
      code: "Promise.allSettled()",
      options: [{ browserslist: ["chrome 72"] }],
      settings: { polyfills: ["Promise"] },
    },
    {
      code: "fetch('example.com')",
      options: [{ browserslist: ["chrome 39"] }],
      settings: { polyfills: ["fetch"] },
    },
    {
      code: "window.fetch('example.com')",
      options: [{ browserslist: ["chrome 39"] }],
      settings: { polyfills: ["fetch"] },
    },
    {
      code: "window.fetch('example.com')",
      options: [{ browserslist: ["chrome 39"] }],
      settings: { polyfills: ["window.fetch"] },
    },
    {
      code: "[1, 2, 3].at(1)",
      options: [{ browserslist: ["chrome 70"] }],
      settings: { polyfills: ["Array.prototype.at"] },
    },
    {
      code: "new IntersectionObserver(() => {}, {})",
      options: [{ browserslist: ["chrome 49"] }],
      settings: { polyfills: ["IntersectionObserver"] },
    },
    {
      code: "const s = new Set(); s.intersection();",
      options: [
        {
          browserslist: ["chrome 122"],
        },
      ],
    },
    {
      code: `const a = [1,2,3]; a.at(1);`,
      options: [{ browserslist: ["chrome >= 123"] }],
    },
    {
      code: "Promise.allSettled()",
      options: [{ browserslist: browserslist.defaults }],
    },
    {
      code: "new ServiceWorker()",
      options: [{ browserslist: browserslist.defaults }],
    },
    {
      code: "new IntersectionObserver(() => {}, {})",
      options: [{ browserslist: browserslist.defaults }],
    },
    {
      code: "Array.from()",
      options: [
        {
          browserslist: ["ExplorerMobile 10"],
        },
      ],
    },
    {
      code: "if (fetch) {\n          fetch('example.com')\n        }",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "if (Array.prototype.flat) {\n          [[1]].flat()\n        }",
      options: [{ browserslist: ["chrome 60"] }],
    },
    {
      code: "declare const otherConditions: boolean;\nif (fetch && otherConditions) {\n          fetch('example.com')\n        }",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "if (window.fetch) {\n          fetch('example.com')\n        }",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "if (window.fetch) {\n          window.fetch('example.com')\n        }",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "if ('fetch' in window) {\n          fetch('example.com')\n        }",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "if (typeof fetch !== 'undefined') {\n          fetch('example.com')\n        }",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "if (typeof window.fetch === 'function') {\n          window.fetch('example.com')\n        }",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "if (window?.fetch) {\n          window?.fetch?.('example.com')\n        }",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "window.fetch && window.fetch('example.com')",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "const p = window.fetch ? window.fetch('example.com') : null",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "if (window.IntersectionObserver) {\n          new IntersectionObserver(() => {}, {})\n        }",
      options: [{ browserslist: ["chrome 49"] }],
    },
    {
      code: "if (Array.prototype.at) {\n          [1, 2, 3].at(1)\n        }",
      options: [{ browserslist: ["chrome 70"] }],
    },
    {
      code: "const a: number[] = [];\nif (a.at) {\n          [1, 2, 3].at(1)\n        }",
      options: [{ browserslist: ["chrome 70"] }],
    },
    {
      code: "if (globalThis.fetch) {\n          self.fetch('example.com')\n        }",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "function f() {\n  if (!fetch) return;\n  fetch('example.com');\n}",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "function f() {\n  if (!window.fetch) return;\n  window.fetch('example.com');\n}",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "function f() {\n  if (typeof fetch === 'undefined') {\n    throw new Error('no fetch');\n  }\n  fetch('example.com');\n}",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "function f() {\n  if (!('fetch' in window) || !window.IntersectionObserver) return;\n  fetch('example.com');\n  new IntersectionObserver(() => {}, {});\n}",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "for (const url of ['example.com']) {\n  if (!fetch) continue;\n  fetch(url);\n}",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "function f() {\n  if (!fetch) return;\n  if (Math.random() > 0.5) {\n    fetch('example.com');\n  }\n}",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "if (!fetch) {} else {\n  fetch('example.com');\n}",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "!window.fetch || window.fetch('example.com')",
      options: [{ browserslist: ["chrome 39"] }],
    },
    {
      code: "window",
      options: [
        {
          browserslist: ["ExplorerMobile 10"],
        },
      ],
    },
    {
      code: "document.fonts()",
      options: [
        {
          browserslist: ["edge 79"],
        },
      ],
    },
    {
      code: "Promise.resolve()",
      options: [
        {
          browserslist: ["node 10"],
        },
      ],
    },
    {
      code: "document.documentElement()",
      options: [
        {
          browserslist: ["Safari 11", "Opera 57", "Edge 17"],
        },
      ],
    },
    {
      code: "document.getElementsByTagName()",
      options: [
        {
          browserslist: ["Safari 11", "Opera 57", "Edge 17"],
        },
      ],
    },
    {
      code: 'Promise.resolve("foo")',
      options: [
        {
          browserslist: ["ie 8"],
        },
      ],
    },
    {
      code: "history.back()",
      options: [
        {
          browserslist: ["Safari 11", "Opera 57", "Edge 17"],
        },
      ],
    },
    {
      code: "document.querySelector()",
      options: [
        {
          browserslist: ["Safari 11", "Opera 57", "Edge 17"],
        },
      ],
    },
    {
      code: "new ServiceWorker()",
      options: [
        {
          browserslist: ["chrome 57", "firefox 50"],
        },
      ],
    },
    {
      code: "document.currentScript()",
      options: [
        {
          browserslist: ["chrome 57", "firefox 50", "safari 10", "edge 14"],
        },
      ],
    },
    {
      code: "document.querySelector()",
      options: [
        {
          browserslist: ["ChromeAndroid 80"],
        },
      ],
    },
    {
      code: "document.hasFocus()",
      options: [
        {
          browserslist: ["Chrome 34"],
        },
      ],
    },
    {
      code: "new URL()",
      options: [
        {
          browserslist: ["ChromeAndroid 78", "ios 11"],
        },
      ],
    },
    {
      code: "document.currentScript('some')",
      options: [
        {
          browserslist: ["chrome 57", "firefox 50", "safari 10", "edge 14"],
        },
      ],
    },
    {
      code: "WebAssembly.compile()",
      options: [
        {
          browserslist: ["chrome 57"],
        },
      ],
    },
    {
      code: "new IntersectionObserver(() => {}, {});",
      options: [
        {
          browserslist: ["chrome 58"],
        },
      ],
    },
    {
      code: "new URL('http://example')",
      options: [
        {
          browserslist: ["chrome 32", "safari 7.1", "firefox 26"],
        },
      ],
    },
    {
      code: "new URLSearchParams()",
      options: [
        {
          browserslist: ["chrome 49", "safari 10.1", "firefox 44"],
        },
      ],
    },
  ],
  invalid: [
    {
      code: "Promise.allSettled()",
      options: [{ browserslist: ["chrome 72"] }],
      settings: { polyfills: ["Promise.all"] },
      errors: [{ messageId: "incompatable",
          data: { typeName: "Promise.allSettled()", browsers: "Chrome 72" } }],
    },
    {
      code: "[1, 2, 3].at(1)",
      options: [{ browserslist: ["chrome 70"] }],
      settings: { polyfills: ["String.prototype.at"] },
      errors: [{ messageId: "incompatable",
          data: { typeName: "Array.at()", browsers: "Chrome 70" } }],
    },
    {
      code: "fetch('example.com')",
      options: [{ browserslist: ["chrome 39"] }],
      settings: { polyfills: ["IntersectionObserver"] },
      errors: [{ messageId: "incompatable",
          data: { typeName: "fetch()", browsers: "Chrome 39" } }],
    },
    {
      code: "if (!fetch) {\n          fetch('example.com')\n        }",
      options: [{ browserslist: ["chrome 39"] }],
      errors: [{ messageId: "incompatable",
          data: { typeName: "fetch()", browsers: "Chrome 39" } }],
    },
    {
      code: "if (window.fetch) {} else {\n          fetch('example.com')\n        }",
      options: [{ browserslist: ["chrome 39"] }],
      errors: [{ messageId: "incompatable",
          data: { typeName: "fetch()", browsers: "Chrome 39" } }],
    },
    {
      code: "declare const otherConditions: boolean;\nif (fetch || otherConditions) {\n          fetch('example.com')\n        }",
      options: [{ browserslist: ["chrome 39"] }],
      errors: [{ messageId: "incompatable",
          data: { typeName: "fetch()", browsers: "Chrome 39" } }],
    },
    {
      code: "if (window.IntersectionObserver) {\n          fetch('example.com')\n        }",
      options: [{ browserslist: ["chrome 39"] }],
      errors: [{ messageId: "incompatable",
          data: { typeName: "fetch()", browsers: "Chrome 39" } }],
    },
    {
      code: "declare const client: { fetch?: (url: string) => void };\nif (client.fetch) {\n          fetch('example.com')\n        }",
      options: [{ browserslist: ["chrome 39"] }],
      errors: [{ messageId: "incompatable",
          data: { typeName: "fetch()", browsers: "Chrome 39" } }],
    },
    {
      code: "declare const client: { fetch?: (url: string) => void };\nif ('fetch' in client) {\n          fetch('example.com')\n        }",
      options: [{ browserslist: ["chrome 39"] }],
      errors: [{ messageId: "incompatable",
          data: { typeName: "fetch()", browsers: "Chrome 39" } }],
    },
    {
      code: "declare const foo: { at?: () => void };\nif (foo.at) {\n          [1, 2, 3].at(1)\n        }",
      options: [{ browserslist: ["chrome 70"] }],
      errors: [{ messageId: "incompatable",
          data: { typeName: "Array.at()", browsers: "Chrome 70" } }],
    },
    {
      code: "if (String.prototype.at) {\n          [1, 2, 3].at(1)\n        }",
      options: [{ browserslist: ["chrome 70"] }],
      errors: [{ messageId: "incompatable",
          data: { typeName: "Array.at()", browsers: "Chrome 70" } }],
    },
    {
      code: "function f() {\n  if (!fetch) {\n    console.log('no fetch');\n  }\n  fetch('example.com');\n}",
      options: [{ browserslist: ["chrome 39"] }],
      errors: [{ messageId: "incompatable",
          data: { typeName: "fetch()", browsers: "Chrome 39" } }],
    },
    {
      code: "function f(x: boolean) {\n  if (!fetch) {\n    if (x) return;\n  }\n  fetch('example.com');\n}",
      options: [{ browserslist: ["chrome 39"] }],
      errors: [{ messageId: "incompatable",
          data: { typeName: "fetch()", browsers: "Chrome 39" } }],
    },
    {
      code: "function f() {\n  if (fetch) return;\n  fetch('example.com');\n}",
      options: [{ browserslist: ["chrome 39"] }],
      errors: [{ messageId: "incompatable",
          data: { typeName: "fetch()", browsers: "Chrome 39" } }],
    },
    {
      code: "function f() {\n  fetch('example.com');\n  if (!fetch) return;\n}",
      options: [{ browserslist: ["chrome 39"] }],
      errors: [{ messageId: "incompatable",
          data: { typeName: "fetch()", browsers: "Chrome 39" } }],
    },
    {
      code: "declare const otherConditions: boolean;\nfunction f() {\n  if (!fetch && otherConditions) return;\n  fetch('example.com');\n}",
      options: [{ browserslist: ["chrome 39"] }],
      errors: [{ messageId: "incompatable",
          data: { typeName: "fetch()", browsers: "Chrome 39" } }],
    },
    {
      code: "declare const client: { fetch?: (url: string) => void };\nfunction f() {\n  if (!client.fetch) return;\n  fetch('example.com');\n}",
      options: [{ browserslist: ["chrome 39"] }],
      errors: [{ messageId: "incompatable",
          data: { typeName: "fetch()", browsers: "Chrome 39" } }],
    },
    {
      code: "fetch && console.log('has fetch') || fetch('example.com')",
      options: [{ browserslist: ["chrome 39"] }],
      errors: [{ messageId: "incompatable",
          data: { typeName: "fetch()", browsers: "Chrome 39" } }],
    },
    {
      code: "const s = new Set(); s.intersection();",
      options: [
        {
          browserslist: ["chrome 121"],
        },
      ],
      errors: [
        { messageId: "incompatable",
          data: { typeName: "Set.intersection()", browsers: "Chrome 121" } },
      ],
    },
    {
      code: `const a = [1,2,3]; a.at(1);`,
      options: [{ browserslist: ["chrome >= 70", "firefox >= 80"] }],
      errors: [
        { messageId: "incompatable",
          data: { typeName: "Array.at()", browsers: "Firefox 80, Chrome 70" } },
      ],
    },
    {
      code: "Promise.allSettled()",
      options: [
        {
          browserslist: [
            "chrome >= 72",
            "firefox >= 72",
            "safari >= 12",
            "edge >= 79",
          ],
        },
      ],
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Promise.allSettled()", browsers: "Safari 12, Chrome 72" },
        },
      ],
    },
    {
      code: "new ServiceWorker();",
      options: [{ browserslist: ["chrome 31"] }],
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "ServiceWorker", browsers: "Chrome 31" },
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
    },
    {
      code: "new IntersectionObserver(() => {}, {})",
      options: [{ browserslist: ["chrome 49"] }],
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "IntersectionObserver", browsers: "Chrome 49" },
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
    },
    {
      code: "window?.fetch?.('example.com')",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "window.fetch()", browsers: "Chrome 39" },
        },
      ],
      options: [
        {
          browserslist: ["chrome 39"],
        },
      ],
    },
    {
      code: "navigator.hardwareConcurrency;\n        navigator.serviceWorker;\n        new SharedWorker();",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Navigator.hardwareConcurrency()", browsers: "Chrome 4" },
        },
        {
          messageId: "incompatable",
          data: { typeName: "Navigator.serviceWorker()", browsers: "Chrome 4" },
        },
        {
          messageId: "incompatable",
          data: { typeName: "SharedWorker", browsers: "Chrome 4" },
        },
      ],
      options: [
        {
          browserslist: ["chrome 4"],
        },
      ],
    },
    {
      code: '// it should throw an error here, but it doesn\'t\n        const event = new CustomEvent("cat", {\n          detail: {\n            hazcheeseburger: true\n          }\n        });\n        window.dispatchEvent(event);',
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "CustomEvent", browsers: "Chrome 4" },
        },
      ],
      options: [
        {
          browserslist: ["chrome 4"],
        },
      ],
    },
    {
      code: "Array.from()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Array.from()", browsers: "Chrome 44" },
        },
      ],
      options: [
        {
          browserslist: ["chrome 44"],
        },
      ],
    },
    {
      code: "Promise.allSettled()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Promise.allSettled()", browsers: "Safari 12, Chrome 72" },
        },
      ],
      options: [
        {
          browserslist: [
            "Chrome >= 72",
            "Firefox >= 72",
            "Safari >= 12",
            "Edge >= 79",
          ],
        },
      ],
    },
    {
      code: "location.origin",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Location.origin()", browsers: "Chrome 7" },
        },
      ],
      options: [
        {
          browserslist: ["chrome 7"],
        },
      ],
    },
    {
      code: "import { Map } from 'immutable';\n          new Set()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Set", browsers: "Chrome 37" },
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
      options: [
        {
          browserslist: ["Chrome 37"],
        },
      ],
    },
    {
      code: "new Set()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Set", browsers: "Chrome 37" },
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 37"],
        },
      ],
    },
    {
      code: "new TypedArray()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "TypedArray", browsers: "Chrome 6" },
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 6"],
        },
      ],
    },
    {
      code: "new Int8Array()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Int8Array", browsers: "Chrome 6" },
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 6"],
        },
      ],
    },
    {
      code: "new AnimationEvent",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "AnimationEvent", browsers: "Chrome 40" },
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 40"],
        },
      ],
    },
    {
      code: "Object.values({})",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Object.values()", browsers: "Safari 9" },
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      options: [
        {
          browserslist: ["safari 9"],
        },
      ],
    },
    {
      code: "new ServiceWorker()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "ServiceWorker", browsers: "Chrome 31" },
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 31"],
        },
      ],
    },
    {
      code: "new IntersectionObserver(() => {}, {});",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "IntersectionObserver", browsers: "Chrome 49" },
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 49"],
        },
      ],
    },
    {
      code: "WebAssembly.compile()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "WebAssembly.compile()", browsers: "Samsung 4, Safari iOS 10.3, Safari 10.1, Opera 12.1, Edge 14, Chrome 23" },
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      options: [
        {
          browserslist: [
            "Samsung 4",
            "Safari 10.1",
            "Opera 12.1",
            "chrome 23",
            "iOS 10.3",
            "ExplorerMobile 10",
            "chrome 31",
            "Edge 14",
            "Blackberry 7",
            "Baidu 7.12",
            "UCAndroid 11.8",
            "QQAndroid 1.2",
          ],
        },
      ],
    },
    {
      code: "new PaymentRequest(methodData, details, options)",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "PaymentRequest", browsers: "Chrome 57" },
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 57"],
        },
      ],
    },
    {
      code: "navigator.serviceWorker",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Navigator.serviceWorker()", browsers: "Safari 10.1" },
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      options: [
        {
          browserslist: ["safari 10.1"],
        },
      ],
    },
    {
      code: "window.document.fonts()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Document.fonts()", browsers: "Chrome 34" },
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 34"],
        },
      ],
    },
    {
      code: "new Map().size",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Map.size()", browsers: "Chrome 37" },
          type: AST_NODE_TYPES.MemberExpression,
        },
        {
          messageId: "incompatable",
          data: { typeName: "Map", browsers: "Chrome 37" },
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
      options: [
        {
          browserslist: ["Chrome 37"],
        },
      ],
    },
    {
      code: "new window.Map().size",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Map.size()", browsers: "Chrome 37" },
          type: AST_NODE_TYPES.MemberExpression,
        },
        {
          messageId: "incompatable",
          data: { typeName: "window.Map()", browsers: "Chrome 37" },
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 37"],
        },
      ],
    },
    {
      code: "const m = new window.Map(); m.size",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "window.Map()", browsers: "Chrome 37" },
          type: AST_NODE_TYPES.MemberExpression,
        },
        {
          messageId: "incompatable",
          data: { typeName: "Map.size()", browsers: "Chrome 37" },
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 37"],
        },
      ],
    },
    {
      code: "const m = new window.Map(); m.size()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "window.Map()", browsers: "Chrome 37" },
          type: AST_NODE_TYPES.MemberExpression,
        },
        {
          messageId: "incompatable",
          data: { typeName: "Map.size()", browsers: "Chrome 37" },
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 37"],
        },
      ],
    },
    {
      code: "new Array().flat",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Array.flat()", browsers: "Chrome 68" },
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 68"],
        },
      ],
    },
    {
      code: "const a = new Array(); a.flat",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Array.flat()", browsers: "Chrome 68" },
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 68"],
        },
      ],
    },
    {
      code: "const a = new Array(); a.flat()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Array.flat()", browsers: "Chrome 68" },
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 68"],
        },
      ],
    },
    {
      code: "globalThis.fetch()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "globalThis.fetch()", browsers: "Chrome 39" },
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      options: [
        {
          browserslist: ["Chrome 39"],
        },
      ],
    },
    {
      code: "fetch()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "fetch()", browsers: "Chrome 39" },
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 39"],
        },
      ],
    },
    {
      code: "Promise.resolve()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Promise.resolve()", browsers: "Chrome 31" },
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 31"],
        },
      ],
    },
    {
      code: "Promise.all()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Promise.all()", browsers: "Chrome 31" },
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 31"],
        },
      ],
    },
    {
      code: "Promise.race()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Promise.race()", browsers: "Chrome 31" },
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 31"],
        },
      ],
    },
    {
      code: "Promise.reject()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Promise.reject()", browsers: "Chrome 31" },
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 31"],
        },
      ],
    },
    {
      code: "new URL('http://example')",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "URL", browsers: "Safari 6, Firefox 18, Chrome 31" },
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 31", "safari 6", "firefox 18"],
        },
      ],
    },
    {
      code: "new URLSearchParams()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "URLSearchParams", browsers: "Safari 10, Firefox 28, Chrome 48" },
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 48", "safari 10", "firefox 28"],
        },
      ],
    },
    {
      code: "performance.now()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Performance.now()", browsers: "Chrome 19" },
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
      options: [
        {
          browserslist: ["chrome 19"],
        },
      ],
    },
    {
      code: "new ResizeObserver()",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "ResizeObserver", browsers: "Safari 12, Chrome 39" },
        },
      ],
      options: [
        {
          browserslist: ["Chrome 39", "safari 12"],
        },
      ],
    },
    {
      code: "'foo'.at(5)",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "String.at()", browsers: "Safari 12, Chrome 39" },
        },
      ],
      options: [
        {
          browserslist: ["Chrome 39", "safari 12"],
        },
      ],
    },
    {
      code: "const a = 'foo'; a.at(5)",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "String.at()", browsers: "Safari 12, Chrome 39" },
        },
      ],
      options: [
        {
          browserslist: ["Chrome 39", "safari 12"],
        },
      ],
    },
    {
      code: "const a = []; a.at(5)",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Array.at()", browsers: "Safari 12, Chrome 39" },
        },
      ],
      options: [
        {
          browserslist: ["Chrome 39", "safari 12"],
        },
      ],
    },
    {
      code: "[].at(5)",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Array.at()", browsers: "Safari 12, Chrome 39" },
        },
      ],
      options: [
        {
          browserslist: ["Chrome 39", "safari 12"],
        },
      ],
    },
    {
      code: "Object.entries({}), Object.values({})",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "Object.entries()", browsers: "Android 4, Safari iOS 7" },
        },
        {
          messageId: "incompatable",
          data: { typeName: "Object.values()", browsers: "Android 4, Safari iOS 7" },
        },
      ],
      options: [
        {
          browserslist: ["Android >= 4", "iOS >= 7"],
        },
      ],
    },
    {
      code: "new PaymentRequest([], { total: { label: 'Total', amount: { currency: 'USD', value: '1' } } })",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "PaymentRequest", browsers: "Firefox 130" },
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
      options: [{ browserslist: ["firefox 130"] }],
    },
    {
      code: "window.requestIdleCallback(() => {})",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "window.requestIdleCallback()", browsers: "Safari 12" },
        },
      ],
      options: [
        {
          browserslist: ["safari 12"],
        },
      ],
    },
    {
      code: "window.requestAnimationFrame(() => {})",
      errors: [
        {
          messageId: "incompatable",
          data: { typeName: "window.requestAnimationFrame()", browsers: "Chrome 23" },
        },
      ],
      options: [
        {
          browserslist: ["chrome 23"],
        },
      ],
    },
    {
      // s.values() is a IterableIterator which extends Iterator and map() is from Iterator.
      code: "const s = [0, 1, 2]; s.values().map((x) => x);",
      options: [
        {
          browserslist: ["chrome 121"],
        },
      ],
      errors: [{ messageId: "incompatable",
          data: { typeName: "Iterator.map()", browsers: "Chrome 121" } }],
    },
  ],
});
