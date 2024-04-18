import browserslist from "browserslist";

import { ruleTester } from "./test-helper.js";
import { tscompat } from "../lib/rules/tsompat.js";

ruleTester.run("tscompat", tscompat, {
  valid: [
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
      code: "new IntersectionObserver(() => {}, {});",
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
      code: "if (fetch) {\n          fetch()\n        }",
      options: [
        {
          browserslist: ["ExplorerMobile 10"],
        },
      ],
    },
    {
      code: "if (Array.prototype.flat) {\n          new Array.flat()\n        }",
      options: [
        {
          browserslist: ["ExplorerMobile 10"],
        },
      ],
    },
    {
      code: "if (fetch && otherConditions) {\n          fetch()\n        }",
      options: [
        {
          browserslist: ["ExplorerMobile 10"],
        },
      ],
    },
    {
      code: "if (window.fetch) {\n          fetch()\n        }",
      options: [
        {
          browserslist: ["ExplorerMobile 10"],
        },
      ],
    },
    {
      code: "if ('fetch' in window) {\n          fetch()\n        }",
      options: [
        {
          browserslist: ["ExplorerMobile 10"],
        },
      ],
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
          browserslist: ["Chrome 27"],
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
      code: "const s = new Set(); s.intersection();",
      options: [
        {
          browserslist: ["chrome 121"],
        },
      ],
      errors: [
        { message: "Set.intersection() is not supported in Chrome 121" },
      ],
    },
    {
      code: `const a = [1,2,3]; a.at(1);`,
      options: [{ browserslist: ["chrome >= 70", "firefox >= 80"] }],
      errors: [
        { message: "Array.at() is not supported in Firefox 80, Chrome 70" },
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
          message:
            "Promise.allSettled() is not supported in Safari 12, Chrome 72",
        },
      ],
    },
    {
      code: "new ServiceWorker()",
      options: [{ browserslist: ["chrome 31"] }],
      errors: [
        {
          message: "ServiceWorker is not supported in Chrome 31",
          type: "NewExpression",
        },
      ],
    },
    {
      code: "new IntersectionObserver(() => {}, {});",
      options: [{ browserslist: ["chrome 49"] }],
      errors: [
        {
          message: "IntersectionObserver is not supported in Chrome 49",
          type: "NewExpression",
        },
      ],
    },
    {
      code: "window?.fetch?.('example.com')",
      errors: [
        {
          message: "window.fetch() is not supported in Chrome 39",
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
          message:
            "Navigator.hardwareConcurrency() is not supported in Chrome 4",
        },
        {
          message: "Navigator.serviceWorker() is not supported in Chrome 4",
        },
        {
          message: "SharedWorker is not supported in Chrome 4",
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
          message: "CustomEvent is not supported in Chrome 4",
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
          message: "Array.from() is not supported in Chrome 44",
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
          message:
            "Promise.allSettled() is not supported in Safari 12, Chrome 72",
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
          message: "Location.origin() is not supported in Chrome 7",
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
          message: "Set is not supported in Chrome 37",
          type: "NewExpression",
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
          message: "Set is not supported in Chrome 37",
          type: "NewExpression",
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
          message: "TypedArray is not supported in Chrome 6",
          type: "NewExpression",
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
          message: "Int8Array is not supported in Chrome 6",
          type: "NewExpression",
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
          message: "AnimationEvent is not supported in Chrome 40",
          type: "NewExpression",
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
          message: "Object.values() is not supported in Safari 9",
          type: "MemberExpression",
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
          message: "ServiceWorker is not supported in Chrome 31",
          type: "NewExpression",
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
          message: "IntersectionObserver is not supported in Chrome 49",
          type: "NewExpression",
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
          message:
            "WebAssembly.compile() is not supported in Samsung 4, Safari iOS 10.3, Safari 10.1, Opera 12.1, Edge 14, Chrome 23",
          type: "MemberExpression",
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
          message: "PaymentRequest is not supported in Chrome 57",
          type: "NewExpression",
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
          message: "Navigator.serviceWorker() is not supported in Safari 10.1",
          type: "MemberExpression",
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
          message: "Document.fonts() is not supported in Chrome 34",
          type: "MemberExpression",
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
          message: "Map.size() is not supported in Chrome 37",
          type: "MemberExpression",
        },
        {
          message: "Map is not supported in Chrome 37",
          type: "NewExpression",
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
          message: "Map.size() is not supported in Chrome 37",
          type: "MemberExpression",
        },
        {
          message: "window.Map() is not supported in Chrome 37",
          type: "MemberExpression",
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
          message: "window.Map() is not supported in Chrome 37",
          type: "MemberExpression",
        },
        {
          message: "Map.size() is not supported in Chrome 37",
          type: "MemberExpression",
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
          message: "window.Map() is not supported in Chrome 37",
          type: "MemberExpression",
        },
        {
          message: "Map.size() is not supported in Chrome 37",
          type: "MemberExpression",
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
          message: "Array.flat() is not supported in Chrome 68",
          type: "MemberExpression",
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
          message: "Array.flat() is not supported in Chrome 68",
          type: "MemberExpression",
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
          message: "Array.flat() is not supported in Chrome 68",
          type: "MemberExpression",
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
          message: "globalThis.fetch() is not supported in Chrome 39",
          type: "MemberExpression",
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
          message: "fetch() is not supported in Chrome 39",
          type: "CallExpression",
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
          message: "Promise.resolve() is not supported in Chrome 31",
          type: "MemberExpression",
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
          message: "Promise.all() is not supported in Chrome 31",
          type: "MemberExpression",
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
          message: "Promise.race() is not supported in Chrome 31",
          type: "MemberExpression",
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
          message: "Promise.reject() is not supported in Chrome 31",
          type: "MemberExpression",
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
          message: "URL is not supported in Safari 6, Firefox 18, Chrome 31",
          type: "NewExpression",
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
          message:
            "URLSearchParams is not supported in Safari 10, Firefox 28, Chrome 48",
          type: "NewExpression",
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
          message: "Performance.now() is not supported in Chrome 19",
          type: "MemberExpression",
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
          message: "ResizeObserver is not supported in Safari 12, Chrome 39",
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
          message: "String.at() is not supported in Safari 12, Chrome 39",
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
          message: "String.at() is not supported in Safari 12, Chrome 39",
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
          message: "Array.at() is not supported in Safari 12, Chrome 39",
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
          message: "Array.at() is not supported in Safari 12, Chrome 39",
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
          message:
            "Object.entries() is not supported in Android 4, Safari iOS 7",
        },
        {
          message:
            "Object.values() is not supported in Android 4, Safari iOS 7",
        },
      ],
      options: [
        {
          browserslist: ["Android >= 4", "iOS >= 7"],
        },
      ],
    },
    {
      code: "window.requestIdleCallback(() => {})",
      errors: [
        {
          message: "window.requestIdleCallback() is not supported in Safari 12",
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
          message:
            "window.requestAnimationFrame() is not supported in Chrome 23",
        },
      ],
      options: [
        {
          browserslist: ["chrome 23"],
        },
      ],
    },
  ],
});
