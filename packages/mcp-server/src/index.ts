#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Bridge } from "./bridge.js";
import { registerNavigationTools } from "./tools/navigation.js";
import { registerInteractionTools } from "./tools/interaction.js";
import { registerExtractionTools } from "./tools/extraction.js";
import { registerTabsTools } from "./tools/tabs.js";
import { registerScriptTools } from "./tools/script.js";
import { registerNetworkTools } from "./tools/network.js";

const WS_PORT = parseInt(process.env.BROWSERPILOT_WS_PORT || "9876", 10);
const SECRET = process.env.BROWSERPILOT_SECRET || "";

const bridge = new Bridge(WS_PORT, SECRET);

const server = new McpServer({
  name: "browserpilot",
  version: "0.1.0",
});

interface ToolDef {
  description: string;
  schema: Record<string, any>;
  handler: (...args: any[]) => Promise<unknown>;
}

function registerToolGroup(tools: Record<string, ToolDef>) {
  for (const [name, tool] of Object.entries(tools)) {
    server.tool(
      name,
      tool.description,
      tool.schema,
      async (args: Record<string, unknown>) => {
        try {
          const result = await tool.handler(args);
          return {
            content: [
              {
                type: "text" as const,
                text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (err: any) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: ${err.message}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }
}

registerToolGroup(registerNavigationTools(bridge));
registerToolGroup(registerInteractionTools(bridge));
registerToolGroup(registerExtractionTools(bridge));
registerToolGroup(registerTabsTools(bridge));
registerToolGroup(registerScriptTools(bridge));
registerToolGroup(registerNetworkTools(bridge));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[BrowserPilot MCP] Server started on stdio");
}

main().catch((err) => {
  console.error("[BrowserPilot MCP] Fatal error:", err);
  process.exit(1);
});
