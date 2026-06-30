import type { DebuggerBridge } from "../debugger.js";

export async function handleNavigation(
  bridge: DebuggerBridge,
  tabId: number,
  params: Record<string, unknown>
): Promise<unknown> {
  const method = params._method as string || "browser_navigate";

  switch (method) {
    case "browser_navigate": {
      const url = params.url as string;
      if (!url) throw new Error("url is required");
      await chrome.tabs.update(tabId, { url });
      await waitForNavigation(tabId);
      const tab = await chrome.tabs.get(tabId);
      return { title: tab.title, url: tab.url };
    }

    case "browser_back":
      await chrome.tabs.goBack(tabId);
      await waitForNavigation(tabId);
      return { success: true };

    case "browser_forward":
      await chrome.tabs.goForward(tabId);
      await waitForNavigation(tabId);
      return { success: true };

    case "browser_reload": {
      const bypassCache = params.ignore_cache as boolean;
      await chrome.tabs.reload(tabId, { bypassCache });
      await waitForNavigation(tabId);
      return { success: true };
    }

    default:
      throw new Error(`Unknown navigation method: ${method}`);
  }
}

function waitForNavigation(tabId: number, timeout = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    }, timeout);

    function listener(
      id: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      tab: chrome.tabs.Tab
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
