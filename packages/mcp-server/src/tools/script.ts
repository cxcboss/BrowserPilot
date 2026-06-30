import { z } from "zod";
import type { Bridge } from "../bridge.js";

const tabIdOptional = z.number().optional().describe("标签页 ID，不填则使用当前活动标签页");

export function registerScriptTools(bridge: Bridge) {
  return {
    browser_evaluate: {
      description: "在页面上下文中执行 JavaScript 表达式并返回结果。可用于高级页面交互、读取计算样式、提取复杂数据或调用页面 API。",
      schema: {
        expression: z.string().describe("要执行的 JavaScript 表达式。必须返回值（语句请用 IIFE 包裹）。例：document.querySelectorAll('a').length"),
        tab_id: tabIdOptional,
      },
      handler: (args: { expression: string; tab_id?: number }) =>
        bridge.send("browser_evaluate", args),
    },
  };
}
