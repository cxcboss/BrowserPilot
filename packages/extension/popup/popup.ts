const statusEl = document.getElementById("status")!;
const portInput = document.getElementById("port") as HTMLInputElement;
const saveBtn = document.getElementById("save")!;
const reconnectBtn = document.getElementById("reconnect")!;

function updateStatus(status: string) {
  statusEl.textContent = status === "connected" ? "已连接" : "未连接";
  statusEl.className = `status ${status}`;
}

chrome.runtime.sendMessage({ type: "GET_STATUS" }, (res) => {
  if (res) updateStatus(res.status);
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "STATUS_UPDATE") {
    updateStatus(msg.status);
  }
});

chrome.storage.local.get("wsPort", (data) => {
  portInput.value = String(data.wsPort || 9876);
});

saveBtn.addEventListener("click", () => {
  const port = parseInt(portInput.value, 10);
  if (port >= 1024 && port <= 65535) {
    chrome.runtime.sendMessage({ type: "SET_PORT", port });
  }
});

reconnectBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "RECONNECT" });
});
