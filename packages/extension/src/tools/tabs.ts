import type { DebuggerBridge } from "../debugger.js";

export async function handleTabs(
  bridge: DebuggerBridge,
  tabId: number,
  params: Record<string, unknown>
): Promise<unknown> {
  const method = params._method as string;

  switch (method) {
    case "browser_list_tabs": {
      const tabs = await chrome.tabs.query({});
      return tabs.map((t) => ({
        id: t.id,
        title: t.title,
        url: t.url,
        active: t.active,
        pinned: t.pinned,
      }));
    }

    case "browser_switch_tab": {
      const targetTabId = params.tab_id as number;
      if (!targetTabId) throw new Error("tab_id is required");
      await chrome.tabs.update(targetTabId, { active: true });
      await chrome.windows.update(
        (await chrome.tabs.get(targetTabId)).windowId!,
        { focused: true }
      );
      return { success: true };
    }

    case "browser_new_tab": {
      const url = params.url as string | undefined;
      const tab = await chrome.tabs.create({ url, active: true });
      if (url) await waitForTabLoad(tab.id!);
      return { id: tab.id, title: tab.title, url: tab.url };
    }

    case "browser_close_tab": {
      const closeTabId = (params.tab_id as number) || tabId;
      await chrome.tabs.remove(closeTabId);
      return { success: true };
    }

    default:
      throw new Error(`Unknown tabs method: ${method}`);
  }
}

function waitForTabLoad(tabId: number, timeout = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    }, timeout);

    function listener(
      id: number,
      changeInfo: chrome.tabs.TabChangeInfo
    ) {
      if (id === tabId && changeInfo.status === "complete") {
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }

    chrome.tabs.onUpdated.addListener(listener);
  });
}
