import type { Bridge } from "../bridge.js";

export function registerExtractionTools(bridge: Bridge) {
  return {
    browser_get_text: {
      description:
        "Get the text content of the page or a specific element. Returns visible text only.",
      inputSchema: {
        type: "object" as const,
        properties: {
          selector: {
            type: "string",
            description:
              "CSS selector. Omit to get the entire page text.",
          },
          tab_id: {
            type: "number",
            description: "Optional tab ID. Uses active tab if omitted.",
          },
        },
      },
      handler: (args: { selector?: string; tab_id?: number }) =>
        bridge.send("browser_get_text", args),
    },
    browser_get_html: {
      description:
        "Get the HTML content of the page or a specific element.",
      inputSchema: {
        type: "object" as const,
        properties: {
          selector: {
            type: "string",
            description:
              "CSS selector. Omit to get the entire page HTML.",
          },
          tab_id: {
            type: "number",
            description: "Optional tab ID. Uses active tab if omitted.",
          },
        },
      },
      handler: (args: { selector?: string; tab_id?: number }) =>
        bridge.send("browser_get_html", args),
    },
    browser_screenshot: {
      description:
        "Take a screenshot of the page or a specific element. Returns a base64-encoded image.",
      inputSchema: {
        type: "object" as const,
        properties: {
          selector: {
            type: "string",
            description:
              "CSS selector for element to screenshot. Omit for full viewport.",
          },
          format: {
            type: "string",
            enum: ["png", "jpeg"],
            description: "Image format (default: png)",
          },
          quality: {
            type: "number",
            description:
              "JPEG quality 1-100 (only for jpeg format, default: 80)",
          },
          tab_id: {
            type: "number",
            description: "Optional tab ID. Uses active tab if omitted.",
          },
        },
      },
      handler: (args: {
        selector?: string;
        format?: string;
        quality?: number;
        tab_id?: number;
      }) => bridge.send("browser_screenshot", args),
    },
    browser_get_url: {
      description: "Get the current URL of the active tab.",
      inputSchema: {
        type: "object" as const,
        properties: {
          tab_id: {
            type: "number",
            description: "Optional tab ID. Uses active tab if omitted.",
          },
        },
      },
      handler: (args: { tab_id?: number }) =>
        bridge.send("browser_get_url", args),
    },
    browser_get_title: {
      description: "Get the title of the current page.",
      inputSchema: {
        type: "object" as const,
        properties: {
          tab_id: {
            type: "number",
            description: "Optional tab ID. Uses active tab if omitted.",
          },
        },
      },
      handler: (args: { tab_id?: number }) =>
        bridge.send("browser_get_title", args),
    },
  };
}
