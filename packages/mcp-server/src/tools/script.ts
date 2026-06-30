import type { Bridge } from "../bridge.js";

export function registerScriptTools(bridge: Bridge) {
  return {
    browser_evaluate: {
      description:
        "Execute a JavaScript expression in the page context and return the result. Use this for advanced page interactions, reading computed styles, extracting complex data, or calling page APIs.",
      inputSchema: {
        type: "object" as const,
        properties: {
          expression: {
            type: "string",
            description:
              "JavaScript expression to evaluate. Must return a value (use an IIFE for statements). Example: 'document.querySelectorAll(\"a\").length'",
          },
          tab_id: {
            type: "number",
            description: "Optional tab ID. Uses active tab if omitted.",
          },
        },
        required: ["expression"],
      },
      handler: (args: { expression: string; tab_id?: number }) =>
        bridge.send("browser_evaluate", args),
    },
  };
}
