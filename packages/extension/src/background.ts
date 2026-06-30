import { DebuggerBridge } from "./debugger.js";

const DEFAULT_WS_PORT = 9876;

let ws: WebSocket | null = null;
let bridge: DebuggerBridge | null = null;
let reconnectTimer: number | null = null;

async function getWsPort(): Promise<number> {
  const data = await chrome.storage.local.get("wsPort");
  return data.wsPort || DEFAULT_WS_PORT;
}

function getSecret(): Promise<string> {
  return chrome.storage.local.get("secret").then((d) => d.secret || "");
}

function connect() {
  if (ws && ws.readyState === WebSocket.OPEN) return;

  getWsPort().then((port) => {
    const url = `ws://127.0.0.1:${port}`;
    ws = new WebSocket(url);

    ws.onopen = async () => {
      console.log("[BrowserPilot] Connected to MCP server");
      bridge = new DebuggerBridge();
      await bridge.init();
      updateBadge("connected");
      broadcastStatus("connected");
    };

    ws.onmessage = async (event) => {
      let msg: any;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      try {
        if (!bridge) {
          ws?.send(
            JSON.stringify({
              id: msg.id,
              error: { code: -1, message: "Bridge not initialized" },
            })
          );
          return;
        }
        const result = await bridge.handleMessage(msg.method, msg.params || {});
        ws?.send(JSON.stringify({ id: msg.id, result }));
      } catch (err: any) {
        ws?.send(
          JSON.stringify({
            id: msg.id,
            error: { code: -1, message: err.message || String(err) },
          })
        );
      }
    };

    ws.onclose = () => {
      console.log("[BrowserPilot] Disconnected from MCP server");
      bridge?.dispose();
      bridge = null;
      ws = null;
      updateBadge("disconnected");
      broadcastStatus("disconnected");
      scheduleReconnect();
    };

    ws.onerror = (err) => {
      console.error("[BrowserPilot] WebSocket error:", err);
    };
  });
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, 3000);
}

function updateBadge(status: "connected" | "disconnected") {
  const color = status === "connected" ? "#4CAF50" : "#F44336";
  const text = status === "connected" ? "ON" : "OFF";
  chrome.action.setBadgeBackgroundColor({ color });
  chrome.action.setBadgeText({ text });
}

function broadcastStatus(status: string) {
  chrome.runtime
    .sendMessage({ type: "STATUS_UPDATE", status })
    .catch(() => {});
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ wsPort: DEFAULT_WS_PORT });
  connect();
});

chrome.runtime.onStartup.addListener(() => {
  connect();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_STATUS") {
    sendResponse({
      status: ws?.readyState === WebSocket.OPEN ? "connected" : "disconnected",
    });
  }
  if (msg.type === "RECONNECT") {
    ws?.close();
    connect();
    sendResponse({ ok: true });
  }
  if (msg.type === "SET_PORT") {
    chrome.storage.local.set({ wsPort: msg.port });
    ws?.close();
    connect();
    sendResponse({ ok: true });
  }
  return true;
});

connect();
