import { handleNavigation } from "./tools/navigation.js";
import { handleInteraction } from "./tools/interaction.js";
import { handleExtraction } from "./tools/extraction.js";
import { handleTabs } from "./tools/tabs.js";
import { handleScript } from "./tools/script.js";
import { handleNetwork } from "./tools/network.js";

export type CDPCommand = {
  domain: string;
  method: string;
  params?: Record<string, unknown>;
};

export class DebuggerBridge {
  private attachedTabs = new Set<number>();

  async init() {}

  dispose() {
    for (const tabId of this.attachedTabs) {
      chrome.debugger.detach({ tabId }).catch(() => {});
    }
    this.attachedTabs.clear();
  }

  async attach(tabId: number): Promise<void> {
    if (this.attachedTabs.has(tabId)) return;
    try {
      await chrome.debugger.attach({ tabId }, "1.3");
      this.attachedTabs.add(tabId);
    } catch (err: any) {
      throw new Error(`Failed to attach to tab ${tabId}: ${err.message}`);
    }
  }

  async detach(tabId: number): Promise<void> {
    if (!this.attachedTabs.has(tabId)) return;
    try {
      await chrome.debugger.detach({ tabId });
    } catch {}
    this.attachedTabs.delete(tabId);
  }

  async sendCommand(
    tabId: number,
    command: string,
    params: Record<string, unknown> = {}
  ): Promise<unknown> {
    await this.attach(tabId);
    return new Promise((resolve, reject) => {
      chrome.debugger.sendCommand({ tabId }, command, params, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result);
        }
      });
    });
  }

  async getActiveTabId(): Promise<number> {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) throw new Error("No active tab found");
    return tab.id;
  }

  async handleMessage(
    method: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    const tabId =
      params.tab_id !== undefined
        ? (params.tab_id as number)
        : await this.getActiveTabId();

    const handlers: Record<
      string,
      (bridge: DebuggerBridge, tabId: number, params: Record<string, unknown>) => Promise<unknown>
    > = {
      browser_navigate: handleNavigation,
      browser_back: handleNavigation,
      browser_forward: handleNavigation,
      browser_reload: handleNavigation,
      browser_click: handleInteraction,
      browser_type: handleInteraction,
      browser_fill: handleInteraction,
      browser_scroll: handleInteraction,
      browser_hover: handleInteraction,
      browser_select: handleInteraction,
      browser_get_text: handleExtraction,
      browser_get_html: handleExtraction,
      browser_screenshot: handleExtraction,
      browser_get_url: handleExtraction,
      browser_get_title: handleExtraction,
      browser_list_tabs: handleTabs,
      browser_switch_tab: handleTabs,
      browser_new_tab: handleTabs,
      browser_close_tab: handleTabs,
      browser_evaluate: handleScript,
      browser_get_cookies: handleNetwork,
    };

    const handler = handlers[method];
    if (!handler) {
      throw new Error(`Unknown method: ${method}`);
    }

    return handler(this, tabId, { ...params, _method: method });
  }
}
