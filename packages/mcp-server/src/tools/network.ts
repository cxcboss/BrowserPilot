import type { Bridge } from "../bridge.js";

export function registerNetworkTools(bridge: Bridge) {
  return {
    browser_get_cookies: {
      description:
        "Get all cookies for the current page's domain.",
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
        bridge.send("browser_get_cookies", args),
    },
  };
}
