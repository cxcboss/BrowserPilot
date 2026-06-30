import { WebSocketServer, WebSocket } from "ws";

export interface BridgeMessage {
  id: string;
  method: string;
  params: Record<string, unknown>;
}

export interface BridgeResponse {
  id: string;
  result?: unknown;
  error?: { code: number; message: string };
}

export class Bridge {
  private wss: WebSocketServer;
  private client: WebSocket | null = null;
  private pending = new Map<
    string,
    { resolve: (v: unknown) => void; reject: (e: Error) => void }
  >();
  private secret: string;

  constructor(port: number, secret: string) {
    this.secret = secret;
    this.wss = new WebSocketServer({ port, host: "127.0.0.1" });

    this.wss.on("connection", (ws, req) => {
      const ip = req.socket.remoteAddress;
      if (ip && !ip.includes("127.0.0.1") && !ip.includes("::1")) {
        ws.close(4001, "Only localhost connections allowed");
        return;
      }

      this.client = ws;
      console.error(`[Bridge] Extension connected from ${ip}`);

      ws.on("message", (data) => {
        try {
          const msg = JSON.parse(data.toString()) as BridgeResponse;
          const p = this.pending.get(msg.id);
          if (p) {
            this.pending.delete(msg.id);
            if (msg.error) {
              p.reject(new Error(msg.error.message));
            } else {
              p.resolve(msg.result);
            }
          }
        } catch {}
      });

      ws.on("close", () => {
        console.error("[Bridge] Extension disconnected");
        this.client = null;
      });
    });

    console.error(`[Bridge] WebSocket server listening on 127.0.0.1:${port}`);
  }

  isConnected(): boolean {
    return this.client?.readyState === WebSocket.OPEN;
  }

  send(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    if (!this.client || this.client.readyState !== WebSocket.OPEN) {
      return Promise.reject(
        new Error("Chrome Extension not connected. Make sure the extension is loaded and enabled.")
      );
    }

    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const msg: BridgeMessage = { id, method, params };

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.client!.send(JSON.stringify(msg));

      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`Timeout waiting for extension response to ${method}`));
        }
      }, 30_000);
    });
  }

  close() {
    for (const p of this.pending.values()) {
      p.reject(new Error("Bridge closed"));
    }
    this.pending.clear();
    this.client?.close();
    this.wss.close();
  }
}
