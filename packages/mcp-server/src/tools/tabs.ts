import type { Bridge } from "../bridge.js";

export function registerTabsTools(bridge: Bridge) {
  return {
    browser_list_tabs: {
      description:
        "List all open browser tabs. Returns tab ID, title, URL, and active status for each.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
      handler: () => bridge.send("browser_list_tabs"),
    },
    browser_switch_tab: {
      description: "Switch to a specific tab by its ID.",
      inputSchema: {
        type: "object" as const,
        properties: {
          tab_id: {
            type: "number",
            description: "The tab ID to switch to",
          },
        },
        required: ["tab_id"],
      },
      handler: (args: { tab_id: number }) =>
        bridge.send("browser_switch_tab", args),
    },
    browser_new_tab: {
      description: "Open a new tab. Optionally navigate to a URL.",
      inputSchema: {
        type: "object" as const,
        properties: {
          url: {
            type: "string",
            description: "URL to open in the new tab",
          },
        },
      },
      handler: (args: { url?: string }) => bridge.send("browser_new_tab", args),
    },
    browser_close_tab: {
      description:
        "Close a tab. Closes the active tab if no tab_id is specified.",
      inputSchema: {
        type: "object" as const,
        properties: {
          tab_id: {
            type: "number",
            description: "Tab ID to close. Omit to close the active tab.",
          },
        },
      },
      handler: (args: { tab_id?: number }) =>
        bridge.send("browser_close_tab", args),
    },
  };
}
