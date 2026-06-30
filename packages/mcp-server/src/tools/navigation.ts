import { z } from "zod";
import type { Bridge } from "../bridge.js";

export function registerNavigationTools(bridge: Bridge) {
  return {
    browser_navigate: {
      description:
        "Navigate the browser to a URL. Opens the URL in the active tab or a specified tab.",
      inputSchema: {
        type: "object" as const,
        properties: {
          url: { type: "string", description: "The URL to navigate to" },
          tab_id: {
            type: "number",
            description: "Optional tab ID. Uses active tab if omitted.",
          },
        },
        required: ["url"],
      },
      handler: (args: { url: string; tab_id?: number }) =>
        bridge.send("browser_navigate", args),
    },
    browser_back: {
      description: "Navigate back in browser history.",
      inputSchema: {
        type: "object" as const,
        properties: {
          tab_id: {
            type: "number",
            description: "Optional tab ID. Uses active tab if omitted.",
          },
        },
      },
      handler: (args: { tab_id?: number }) => bridge.send("browser_back", args),
    },
    browser_forward: {
      description: "Navigate forward in browser history.",
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
        bridge.send("browser_forward", args),
    },
    browser_reload: {
      description: "Reload the current page.",
      inputSchema: {
        type: "object" as const,
        properties: {
          ignore_cache: {
            type: "boolean",
            description: "If true, bypass cache when reloading.",
          },
          tab_id: {
            type: "number",
            description: "Optional tab ID. Uses active tab if omitted.",
          },
        },
      },
      handler: (args: { ignore_cache?: boolean; tab_id?: number }) =>
        bridge.send("browser_reload", args),
    },
  };
}
