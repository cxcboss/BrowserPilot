#!/usr/bin/env node

import express from "express";
import { randomUUID } from "crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Bridge } from "./bridge.js";
import { registerNavigationTools } from "./tools/navigation.js";
import { registerInteractionTools } from "./tools/interaction.js";
import { registerExtractionTools } from "./tools/extraction.js";
import { registerTabsTools } from "./tools/tabs.js";
import { registerScriptTools } from "./tools/script.js";
import { registerNetworkTools } from "./tools/network.js";

const HTTP_PORT = parseInt(process.env.BROWSERPILOT_HTTP_PORT || "9876", 10);
const WS_PORT = parseInt(process.env.BROWSERPILOT_WS_PORT || "9877", 10);

// WebSocket bridge for Chrome Extension
const bridge = new Bridge(WS_PORT);

// MCP Server
const mcpServer = new McpServer({
  name: "browserpilot",
  version: "0.2.0",
});

// Register all tools
interface ToolDef {
  description: string;
  schema: Record<string, any>;
  handler: (...args: any[]) => Promise<unknown>;
}

function registerToolGroup(tools: Record<string, ToolDef>) {
  for (const [name, tool] of Object.entries(tools)) {
    mcpServer.tool(
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

// Express app for Streamable HTTP transport
const app = express();
app.use(express.json());

const transports: Record<string, StreamableHTTPServerTransport> = {};

app.all("/mcp", async (req, res) => {
  try {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (sessionId && transports[sessionId]) {
      // Existing session — route to its transport
      await transports[sessionId].handleRequest(req, res, req.body);
    } else if (req.method === "POST") {
      // New session — create transport and connect
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          transports[id] = transport;
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };

      await mcpServer.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err: any) {
    console.error("[BrowserPilot] HTTP error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    extension: bridge.isConnected() ? "connected" : "disconnected",
  });
});

app.listen(HTTP_PORT, "127.0.0.1", () => {
  console.log(`[BrowserPilot] HTTP server listening on http://127.0.0.1:${HTTP_PORT}/mcp`);
  console.log(`[BrowserPilot] WebSocket server listening on ws://127.0.0.1:${WS_PORT}`);
  console.log(`[BrowserPilot] Health check: http://127.0.0.1:${HTTP_PORT}/health`);
  console.log(`[BrowserPilot] MiMoCode config: "type": "remote", "url": "http://127.0.0.1:${HTTP_PORT}/mcp"`);
});
