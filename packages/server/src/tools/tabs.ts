import { z } from "zod";
import type { Bridge } from "../bridge.js";

export function registerTabsTools(bridge: Bridge) {
  return {
    browser_list_tabs: {
      description: "列出所有打开的浏览器标签页。返回每个标签页的 ID、标题、URL 和是否活动状态。",
      schema: {},
      handler: () => bridge.send("browser_list_tabs"),
    },
    browser_switch_tab: {
      description: "切换到指定 ID 的标签页。",
      schema: {
        tab_id: z.number().describe("要切换到的标签页 ID"),
      },
      handler: (args: { tab_id: number }) => bridge.send("browser_switch_tab", args),
    },
    browser_new_tab: {
      description: "打开新标签页，可选导航到指定 URL。",
      schema: {
        url: z.string().optional().describe("要在新标签页中打开的 URL"),
      },
      handler: (args: { url?: string }) => bridge.send("browser_new_tab", args),
    },
    browser_close_tab: {
      description: "关闭标签页。不指定 tab_id 则关闭当前活动标签页。",
      schema: {
        tab_id: z.number().optional().describe("要关闭的标签页 ID，不填则关闭当前标签页"),
      },
      handler: (args: { tab_id?: number }) => bridge.send("browser_close_tab", args),
    },
  };
}
