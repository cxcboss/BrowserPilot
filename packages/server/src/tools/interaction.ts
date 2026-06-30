import { z } from "zod";
import type { Bridge } from "../bridge.js";

const tabIdOptional = z.number().optional().describe("标签页 ID，不填则使用当前活动标签页");

export function registerInteractionTools(bridge: Bridge) {
  return {
    browser_click: {
      description: "点击页面上由 CSS 选择器指定的元素。",
      schema: {
        selector: z.string().describe("要点击元素的 CSS 选择器"),
        tab_id: tabIdOptional,
      },
      handler: (args: { selector: string; tab_id?: number }) =>
        bridge.send("browser_click", args),
    },
    browser_type: {
      description: "在输入框中逐字符输入文字。会先聚焦元素，清除已有文本，然后逐个输入字符。",
      schema: {
        selector: z.string().describe("输入框的 CSS 选择器"),
        text: z.string().describe("要输入的文字"),
        tab_id: tabIdOptional,
      },
      handler: (args: { selector: string; text: string; tab_id?: number }) =>
        bridge.send("browser_type", args),
    },
    browser_fill: {
      description: "直接设置表单字段的值（不触发键盘事件）。适用于对键盘输入响应不佳的表单字段。",
      schema: {
        selector: z.string().describe("表单字段的 CSS 选择器"),
        value: z.string().describe("要设置的值"),
        tab_id: tabIdOptional,
      },
      handler: (args: { selector: string; value: string; tab_id?: number }) =>
        bridge.send("browser_fill", args),
    },
    browser_scroll: {
      description: "按指定方向滚动页面。",
      schema: {
        direction: z.enum(["up", "down", "left", "right"]).describe("滚动方向"),
        amount: z.number().optional().describe("滚动像素数（默认 500）"),
        tab_id: tabIdOptional,
      },
      handler: (args: { direction: string; amount?: number; tab_id?: number }) =>
        bridge.send("browser_scroll", args),
    },
    browser_hover: {
      description: "将鼠标悬停在页面元素上。",
      schema: {
        selector: z.string().describe("要悬停元素的 CSS 选择器"),
        tab_id: tabIdOptional,
      },
      handler: (args: { selector: string; tab_id?: number }) =>
        bridge.send("browser_hover", args),
    },
    browser_select: {
      description: "从下拉选择框中选择一个选项。",
      schema: {
        selector: z.string().describe("select 元素的 CSS 选择器"),
        value: z.string().describe("要选择的选项值"),
        tab_id: tabIdOptional,
      },
      handler: (args: { selector: string; value: string; tab_id?: number }) =>
        bridge.send("browser_select", args),
    },
  };
}
