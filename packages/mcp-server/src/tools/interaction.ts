import type { Bridge } from "../bridge.js";

export function registerInteractionTools(bridge: Bridge) {
  return {
    browser_click: {
      description:
        "Click an element on the page identified by a CSS selector.",
      inputSchema: {
        type: "object" as const,
        properties: {
          selector: {
            type: "string",
            description: "CSS selector for the element to click",
          },
          tab_id: {
            type: "number",
            description: "Optional tab ID. Uses active tab if omitted.",
          },
        },
        required: ["selector"],
      },
      handler: (args: { selector: string; tab_id?: number }) =>
        bridge.send("browser_click", args),
    },
    browser_type: {
      description:
        "Type text into an input field. Focuses the element first, clears existing text, then types the new text character by character.",
      inputSchema: {
        type: "object" as const,
        properties: {
          selector: {
            type: "string",
            description: "CSS selector for the input element",
          },
          text: { type: "string", description: "Text to type" },
          tab_id: {
            type: "number",
            description: "Optional tab ID. Uses active tab if omitted.",
          },
        },
        required: ["selector", "text"],
      },
      handler: (args: { selector: string; text: string; tab_id?: number }) =>
        bridge.send("browser_type", args),
    },
    browser_fill: {
      description:
        "Fill a form field by setting its value directly (no keyboard events). Useful for form fields that don't respond well to typing.",
      inputSchema: {
        type: "object" as const,
        properties: {
          selector: {
            type: "string",
            description: "CSS selector for the form field",
          },
          value: { type: "string", description: "Value to set" },
          tab_id: {
            type: "number",
            description: "Optional tab ID. Uses active tab if omitted.",
          },
        },
        required: ["selector", "value"],
      },
      handler: (args: { selector: string; value: string; tab_id?: number }) =>
        bridge.send("browser_fill", args),
    },
    browser_scroll: {
      description: "Scroll the page in a given direction.",
      inputSchema: {
        type: "object" as const,
        properties: {
          direction: {
            type: "string",
            enum: ["up", "down", "left", "right"],
            description: "Direction to scroll",
          },
          amount: {
            type: "number",
            description: "Scroll amount in pixels (default: 500)",
          },
          tab_id: {
            type: "number",
            description: "Optional tab ID. Uses active tab if omitted.",
          },
        },
        required: ["direction"],
      },
      handler: (args: {
        direction: string;
        amount?: number;
        tab_id?: number;
      }) => bridge.send("browser_scroll", args),
    },
    browser_hover: {
      description: "Hover over an element on the page.",
      inputSchema: {
        type: "object" as const,
        properties: {
          selector: {
            type: "string",
            description: "CSS selector for the element to hover over",
          },
          tab_id: {
            type: "number",
            description: "Optional tab ID. Uses active tab if omitted.",
          },
        },
        required: ["selector"],
      },
      handler: (args: { selector: string; tab_id?: number }) =>
        bridge.send("browser_hover", args),
    },
    browser_select: {
      description: "Select an option from a dropdown/select element.",
      inputSchema: {
        type: "object" as const,
        properties: {
          selector: {
            type: "string",
            description: "CSS selector for the select element",
          },
          value: {
            type: "string",
            description: "Value of the option to select",
          },
          tab_id: {
            type: "number",
            description: "Optional tab ID. Uses active tab if omitted.",
          },
        },
        required: ["selector", "value"],
      },
      handler: (args: { selector: string; value: string; tab_id?: number }) =>
        bridge.send("browser_select", args),
    },
  };
}
