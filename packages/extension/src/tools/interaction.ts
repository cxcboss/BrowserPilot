import type { DebuggerBridge } from "../debugger.js";

export async function handleInteraction(
  bridge: DebuggerBridge,
  tabId: number,
  params: Record<string, unknown>
): Promise<unknown> {
  const method = params._method as string;

  switch (method) {
    case "browser_click": {
      const selector = params.selector as string;
      if (!selector) throw new Error("selector is required");
      const result = await bridge.sendCommand(tabId, "Runtime.evaluate", {
        expression: `(function() {
          const el = document.querySelector(${JSON.stringify(selector)});
          if (!el) return { error: "Element not found: ${selector}" };
          el.scrollIntoView({ block: "center" });
          const rect = el.getBoundingClientRect();
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        })()`,
        returnByValue: true,
      });
      const pos = (result as any).result?.value;
      if (pos?.error) throw new Error(pos.error);
      await bridge.sendCommand(tabId, "Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: pos.x,
        y: pos.y,
        button: "left",
        clickCount: 1,
      });
      await bridge.sendCommand(tabId, "Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: pos.x,
        y: pos.y,
        button: "left",
        clickCount: 1,
      });
      return { success: true };
    }

    case "browser_type": {
      const selector = params.selector as string;
      const text = params.text as string;
      if (!selector || text === undefined) throw new Error("selector and text are required");

      await bridge.sendCommand(tabId, "Runtime.evaluate", {
        expression: `(function() {
          const el = document.querySelector(${JSON.stringify(selector)});
          if (!el) throw new Error("Element not found: ${selector}");
          el.focus();
          el.value = "";
          el.dispatchEvent(new Event("input", { bubbles: true }));
        })()`,
      });

      for (const char of text) {
        await bridge.sendCommand(tabId, "Input.dispatchKeyEvent", {
          type: "keyDown",
          text: char,
        });
        await bridge.sendCommand(tabId, "Input.dispatchKeyEvent", {
          type: "keyUp",
          text: char,
        });
      }

      return { success: true };
    }

    case "browser_fill": {
      const selector = params.selector as string;
      const value = params.value as string;
      if (!selector || value === undefined) throw new Error("selector and value are required");
      await bridge.sendCommand(tabId, "Runtime.evaluate", {
        expression: `(function() {
          const el = document.querySelector(${JSON.stringify(selector)});
          if (!el) throw new Error("Element not found: ${selector}");
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, "value"
          )?.set || Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype, "value"
          )?.set;
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(el, ${JSON.stringify(value)});
          } else {
            el.value = ${JSON.stringify(value)};
          }
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        })()`,
      });
      return { success: true };
    }

    case "browser_scroll": {
      const direction = params.direction as string;
      const amount = (params.amount as number) || 500;
      let x = 0, y = 0;
      switch (direction) {
        case "up": y = -amount; break;
        case "down": y = amount; break;
        case "left": x = -amount; break;
        case "right": x = amount; break;
        default: throw new Error(`Invalid direction: ${direction}`);
      }
      await bridge.sendCommand(tabId, "Input.dispatchMouseEvent", {
        type: "mouseWheel",
        x: 400,
        y: 300,
        deltaX: x,
        deltaY: y,
      });
      return { success: true };
    }

    case "browser_hover": {
      const selector = params.selector as string;
      if (!selector) throw new Error("selector is required");
      const result = await bridge.sendCommand(tabId, "Runtime.evaluate", {
        expression: `(function() {
          const el = document.querySelector(${JSON.stringify(selector)});
          if (!el) return { error: "Element not found: ${selector}" };
          el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
          el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
          const rect = el.getBoundingClientRect();
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        })()`,
        returnByValue: true,
      });
      const pos = (result as any).result?.value;
      if (pos?.error) throw new Error(pos.error);
      await bridge.sendCommand(tabId, "Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: pos.x,
        y: pos.y,
      });
      return { success: true };
    }

    case "browser_select": {
      const selector = params.selector as string;
      const value = params.value as string;
      if (!selector || !value) throw new Error("selector and value are required");
      await bridge.sendCommand(tabId, "Runtime.evaluate", {
        expression: `(function() {
          const el = document.querySelector(${JSON.stringify(selector)});
          if (!el || el.tagName !== "SELECT") throw new Error("Select element not found: ${JSON.stringify(selector)}");
          el.value = ${JSON.stringify(value)};
          el.dispatchEvent(new Event("change", { bubbles: true }));
        })()`,
      });
      return { success: true };
    }

    default:
      throw new Error(`Unknown interaction method: ${method}`);
  }
}
