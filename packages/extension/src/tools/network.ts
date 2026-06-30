import type { DebuggerBridge } from "../debugger.js";

export async function handleNetwork(
  bridge: DebuggerBridge,
  tabId: number,
  params: Record<string, unknown>
): Promise<unknown> {
  const method = params._method as string;

  switch (method) {
    case "browser_get_cookies": {
      const tab = await chrome.tabs.get(tabId);
      const url = tab.url;
      if (!url) throw new Error("Tab has no URL");
      const cookies = await chrome.cookies.getAll({ url });
      return cookies.map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path,
        expires: c.expirationDate,
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: c.sameSite,
      }));
    }

    default:
      throw new Error(`Unknown network method: ${method}`);
  }
}
