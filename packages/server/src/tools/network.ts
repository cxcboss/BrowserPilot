import { z } from "zod";
import type { Bridge } from "../bridge.js";

const tabIdOptional = z.number().optional().describe("标签页 ID，不填则使用当前活动标签页");

export function registerNetworkTools(bridge: Bridge) {
  return {
    browser_get_cookies: {
      description: "获取当前页面域名的所有 cookies。",
      schema: { tab_id: tabIdOptional },
      handler: (args: { tab_id?: number }) => bridge.send("browser_get_cookies", args),
    },
  };
}
