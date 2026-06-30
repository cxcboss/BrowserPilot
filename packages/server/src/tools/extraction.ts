import { z } from "zod";
import type { Bridge } from "../bridge.js";

const tabIdOptional = z.number().optional().describe("标签页 ID，不填则使用当前活动标签页");

export function registerExtractionTools(bridge: Bridge) {
  return {
    browser_get_text: {
      description: "获取页面或指定元素的文本内容。仅返回可见文本。",
      schema: {
        selector: z.string().optional().describe("CSS 选择器，不填则获取整个页面文本"),
        tab_id: tabIdOptional,
      },
      handler: (args: { selector?: string; tab_id?: number }) =>
        bridge.send("browser_get_text", args),
    },
    browser_get_html: {
      description: "获取页面或指定元素的 HTML 内容。",
      schema: {
        selector: z.string().optional().describe("CSS 选择器，不填则获取整个页面 HTML"),
        tab_id: tabIdOptional,
      },
      handler: (args: { selector?: string; tab_id?: number }) =>
        bridge.send("browser_get_html", args),
    },
    browser_screenshot: {
      description: "对页面或指定元素截图。返回 base64 编码的图片。",
      schema: {
        selector: z.string().optional().describe("要截图元素的 CSS 选择器，不填则截取整个视口"),
        format: z.enum(["png", "jpeg"]).optional().describe("图片格式（默认 png）"),
        quality: z.number().optional().describe("JPEG 质量 1-100（仅 jpeg 格式，默认 80）"),
        tab_id: tabIdOptional,
      },
      handler: (args: { selector?: string; format?: string; quality?: number; tab_id?: number }) =>
        bridge.send("browser_screenshot", args),
    },
    browser_get_url: {
      description: "获取当前标签页的 URL。",
      schema: { tab_id: tabIdOptional },
      handler: (args: { tab_id?: number }) => bridge.send("browser_get_url", args),
    },
    browser_get_title: {
      description: "获取当前页面的标题。",
      schema: { tab_id: tabIdOptional },
      handler: (args: { tab_id?: number }) => bridge.send("browser_get_title", args),
    },
  };
}
