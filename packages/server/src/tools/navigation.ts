import { z } from "zod";
import type { Bridge } from "../bridge.js";

const tabIdOptional = z.number().optional().describe("标签页 ID，不填则使用当前活动标签页");

export function registerNavigationTools(bridge: Bridge) {
  return {
    browser_navigate: {
      description: "导航到指定 URL，在当前标签页或指定标签页中打开。",
      schema: { url: z.string().describe("要导航到的 URL"), tab_id: tabIdOptional },
      handler: (args: { url: string; tab_id?: number }) =>
        bridge.send("browser_navigate", args),
    },
    browser_back: {
      description: "浏览器后退。",
      schema: { tab_id: tabIdOptional },
      handler: (args: { tab_id?: number }) => bridge.send("browser_back", args),
    },
    browser_forward: {
      description: "浏览器前进。",
      schema: { tab_id: tabIdOptional },
      handler: (args: { tab_id?: number }) => bridge.send("browser_forward", args),
    },
    browser_reload: {
      description: "刷新当前页面。",
      schema: {
        ignore_cache: z.boolean().optional().describe("是否跳过缓存刷新"),
        tab_id: tabIdOptional,
      },
      handler: (args: { ignore_cache?: boolean; tab_id?: number }) =>
        bridge.send("browser_reload", args),
    },
  };
}
