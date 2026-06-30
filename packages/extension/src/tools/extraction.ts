import type { DebuggerBridge } from "../debugger.js";

export async function handleExtraction(
  bridge: DebuggerBridge,
  tabId: number,
  params: Record<string, unknown>
): Promise<unknown> {
  const method = params._method as string;

  switch (method) {
    case "browser_get_text": {
      const selector = params.selector as string | undefined;
      const expression = selector
        ? `document.querySelector(${JSON.stringify(selector)})?.innerText || ""`
        : `document.body?.innerText || ""`;
      const result = await bridge.sendCommand(tabId, "Runtime.evaluate", {
        expression,
        returnByValue: true,
      });
      return (result as any).result?.value || "";
    }

    case "browser_get_html": {
      const selector = params.selector as string | undefined;
      const expression = selector
        ? `document.querySelector(${JSON.stringify(selector)})?.outerHTML || ""`
        : `document.documentElement.outerHTML`;
      const result = await bridge.sendCommand(tabId, "Runtime.evaluate", {
        expression,
        returnByValue: true,
      });
      return (result as any).result?.value || "";
    }

    case "browser_screenshot": {
      const format = (params.format as string) || "png";
      const quality = params.quality as number | undefined;
      const selector = params.selector as string | undefined;

      if (selector) {
        const posResult = await bridge.sendCommand(tabId, "Runtime.evaluate", {
          expression: `(function() {
            const el = document.querySelector(${JSON.stringify(selector)});
            if (!el) return { error: "Element not found" };
            const rect = el.getBoundingClientRect();
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
          })()`,
          returnByValue: true,
        });
        const pos = (posResult as any).result?.value;
        if (pos?.error) throw new Error(pos.error);

        const clip = {
          x: Math.max(0, pos.x),
          y: Math.max(0, pos.y),
          width: Math.min(pos.width, 16384),
          height: Math.min(pos.height, 16384),
          scale: 1,
        };
        const captureParams: Record<string, unknown> = {
          format,
          clip,
          captureBeyondViewport: true,
        };
        if (format === "jpeg" && quality) captureParams.quality = quality;
        const result = await bridge.sendCommand(
          tabId,
          "Page.captureScreenshot",
          captureParams
        );
        return { data: (result as any).data, format };
      }

      const captureParams: Record<string, unknown> = { format };
      if (format === "jpeg" && quality) captureParams.quality = quality;
      const result = await bridge.sendCommand(
        tabId,
        "Page.captureScreenshot",
        captureParams
      );
      return { data: (result as any).data, format };
    }

    case "browser_get_url": {
      const tab = await chrome.tabs.get(tabId);
      return tab.url || "";
    }

    case "browser_get_title": {
      const tab = await chrome.tabs.get(tabId);
      return tab.title || "";
    }

    default:
      throw new Error(`Unknown extraction method: ${method}`);
  }
}
