# BrowserPilot

[English](#english) | [中文](#中文)

---

## English

AI-powered Chrome browser control through MCP. Let any AI assistant read, navigate, and interact with your browser via natural language.

### Architecture

```
AI Assistant ←(Streamable HTTP)→ MCP Server ←(WebSocket)→ Chrome Extension ←(CDP)→ Browser
```

- **MCP Server**: Persistent Node.js HTTP service (Streamable HTTP transport)
- **Chrome Extension**: Connects via WebSocket, controls browser using Chrome DevTools Protocol
- **Supported AI Tools**: MiMoCode, Claude Desktop, Cursor, Codex, and any MCP-compatible assistant

### Quick Start

#### 1. Install & Build

```bash
git clone https://github.com/cxcboss/BrowserPilot.git
cd BrowserPilot
pnpm install
pnpm build
```

#### 2. Start the MCP Server

```bash
node packages/server/dist/index.js
```

You'll see:
```
[BrowserPilot] HTTP server listening on http://127.0.0.1:9876/mcp
[BrowserPilot] WebSocket server listening on ws://127.0.0.1:9877
```

#### 3. Load the Chrome Extension

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `BrowserPilot/packages/extension/dist`
5. Click the BrowserPilot icon → click **重新连接** (Reconnect)

#### 4. Configure Your AI Assistant

**MiMoCode** (`~/.config/mimocode/mimocode.json`):
```json
{
  "mcp": {
    "browserpilot": {
      "type": "remote",
      "url": "http://127.0.0.1:9876/mcp"
    }
  }
}
```

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "browserpilot": {
      "url": "http://127.0.0.1:9876/mcp"
    }
  }
}
```

**Cursor** (`~/.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "browserpilot": {
      "url": "http://127.0.0.1:9876/mcp"
    }
  }
}
```

**Codex** (`~/.codex/config.json`):
```json
{
  "mcpServers": {
    "browserpilot": {
      "url": "http://127.0.0.1:9876/mcp"
    }
  }
}
```

**OpenCode** (`~/.opencode/config.json`):
```json
{
  "mcp": {
    "browserpilot": {
      "type": "remote",
      "url": "http://127.0.0.1:9876/mcp"
    }
  }
}
```

#### 5. Start Using

Ask your AI assistant to control your browser:
- "Open github.com and search for BrowserPilot"
- "Take a screenshot of the current page"
- "Click the login button"
- "What's the title of this page?"

### Available Tools (22 tools)

#### Navigation
| Tool | Description |
|------|-------------|
| `browser_navigate` | Navigate to a URL |
| `browser_back` | Go back in history |
| `browser_forward` | Go forward in history |
| `browser_reload` | Reload the page |

#### Interaction
| Tool | Description |
|------|-------------|
| `browser_click` | Click an element by CSS selector |
| `browser_type` | Type text into an input field |
| `browser_fill` | Fill a form field directly |
| `browser_scroll` | Scroll the page |
| `browser_hover` | Hover over an element |
| `browser_select` | Select a dropdown option |

#### Extraction
| Tool | Description |
|------|-------------|
| `browser_get_text` | Get text content from page or element |
| `browser_get_html` | Get HTML content |
| `browser_screenshot` | Take a screenshot |
| `browser_get_url` | Get current URL |
| `browser_get_title` | Get page title |

#### Tabs
| Tool | Description |
|------|-------------|
| `browser_list_tabs` | List all open tabs |
| `browser_switch_tab` | Switch to a tab |
| `browser_new_tab` | Open a new tab |
| `browser_close_tab` | Close a tab |

#### Script
| Tool | Description |
|------|-------------|
| `browser_evaluate` | Execute JavaScript in the page |

#### Network
| Tool | Description |
|------|-------------|
| `browser_get_cookies` | Get cookies for the current domain |

### Configuration

| Port | Purpose | Default |
|------|---------|---------|
| HTTP | MCP Streamable HTTP endpoint | 9876 |
| WebSocket | Chrome Extension connection | 9877 |

Change via environment variables:
```bash
BROWSERPILOT_HTTP_PORT=8080 BROWSERPILOT_WS_PORT=8081 node packages/server/dist/index.js
```

### Auto-start on macOS

```bash
# Create LaunchAgent
cat > ~/Library/LaunchAgents/com.browserpilot.server.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.browserpilot.server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/node</string>
        <string>/path/to/BrowserPilot/packages/server/dist/index.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# Load it
launchctl load ~/Library/LaunchAgents/com.browserpilot.server.plist
```

### Troubleshooting

**Extension shows "未连接" (Not Connected)**
1. Make sure MCP Server is running: `curl http://127.0.0.1:9876/health`
2. If not running: `node packages/server/dist/index.js`
3. Click the BrowserPilot icon → 重新连接

**AI tool can't find browser tools**
1. Restart your AI tool after adding the MCP config
2. Verify the config file is valid JSON
3. Check the server is running on port 9876

**Extension disconnects after a while**
- This is normal for Manifest V3 Service Workers
- The extension has built-in auto-reconnect (every 3 seconds)
- Click 重新连接 if needed

### Security

- All servers bind to `127.0.0.1` — no remote access
- All communication stays on your local machine
- The extension uses the `debugger` permission to control your real browser

### Development

```bash
pnpm install
pnpm build          # Build all packages
pnpm build:server   # Build MCP server only
pnpm build:extension # Build Chrome extension only
```

### License

MIT

---

## 中文

通过 MCP 实现 AI 驱动的 Chrome 浏览器控制。让任何 AI 助手通过自然语言读取、导航和操作你的浏览器。

### 架构

```
AI 助手 ←(Streamable HTTP)→ MCP Server ←(WebSocket)→ Chrome Extension ←(CDP)→ 浏览器
```

- **MCP Server**：持久化 Node.js HTTP 服务（Streamable HTTP 传输）
- **Chrome Extension**：通过 WebSocket 连接，使用 Chrome DevTools Protocol 控制浏览器
- **支持的 AI 工具**：MiMoCode、Claude Desktop、Cursor、Codex 及所有兼容 MCP 的助手

### 快速开始

#### 1. 安装并构建

```bash
git clone https://github.com/cxcboss/BrowserPilot.git
cd BrowserPilot
pnpm install
pnpm build
```

#### 2. 启动 MCP Server

```bash
node packages/server/dist/index.js
```

看到以下输出表示启动成功：
```
[BrowserPilot] HTTP server listening on http://127.0.0.1:9876/mcp
[BrowserPilot] WebSocket server listening on ws://127.0.0.1:9877
```

#### 3. 加载 Chrome 扩展

1. 打开 `chrome://extensions/`
2. 开启 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择 `BrowserPilot/packages/extension/dist` 目录
5. 点击 BrowserPilot 图标 → 点击 **重新连接**

#### 4. 配置 AI 工具

**MiMoCode**（`~/.config/mimocode/mimocode.json`）：
```json
{
  "mcp": {
    "browserpilot": {
      "type": "remote",
      "url": "http://127.0.0.1:9876/mcp"
    }
  }
}
```

**Claude Desktop**（`~/Library/Application Support/Claude/claude_desktop_config.json`）：
```json
{
  "mcpServers": {
    "browserpilot": {
      "url": "http://127.0.0.1:9876/mcp"
    }
  }
}
```

**Cursor**（`~/.cursor/mcp.json`）：
```json
{
  "mcpServers": {
    "browserpilot": {
      "url": "http://127.0.0.1:9876/mcp"
    }
  }
}
```

**Codex**（`~/.codex/config.json`）：
```json
{
  "mcpServers": {
    "browserpilot": {
      "url": "http://127.0.0.1:9876/mcp"
    }
  }
}
```

**OpenCode**（`~/.opencode/config.json`）：
```json
{
  "mcp": {
    "browserpilot": {
      "type": "remote",
      "url": "http://127.0.0.1:9876/mcp"
    }
  }
}
```

#### 5. 开始使用

对你的 AI 助手说：
- "打开 github.com 搜索 BrowserPilot"
- "截图当前页面"
- "点击登录按钮"
- "这个页面的标题是什么？"

### 可用工具（22 个）

#### 导航
| 工具 | 说明 |
|------|------|
| `browser_navigate` | 导航到指定 URL |
| `browser_back` | 浏览器后退 |
| `browser_forward` | 浏览器前进 |
| `browser_reload` | 刷新当前页面 |

#### 交互
| 工具 | 说明 |
|------|------|
| `browser_click` | 点击 CSS 选择器指定的元素 |
| `browser_type` | 在输入框中输入文字 |
| `browser_fill` | 直接填充表单字段 |
| `browser_scroll` | 滚动页面 |
| `browser_hover` | 鼠标悬停在元素上 |
| `browser_select` | 选择下拉框选项 |

#### 提取
| 工具 | 说明 |
|------|------|
| `browser_get_text` | 获取页面或元素的文本内容 |
| `browser_get_html` | 获取 HTML 内容 |
| `browser_screenshot` | 截图 |
| `browser_get_url` | 获取当前 URL |
| `browser_get_title` | 获取页面标题 |

#### 标签页
| 工具 | 说明 |
|------|------|
| `browser_list_tabs` | 列出所有打开的标签页 |
| `browser_switch_tab` | 切换到指定标签页 |
| `browser_new_tab` | 打开新标签页 |
| `browser_close_tab` | 关闭标签页 |

#### 脚本
| 工具 | 说明 |
|------|------|
| `browser_evaluate` | 在页面中执行 JavaScript |

#### 网络
| 工具 | 说明 |
|------|------|
| `browser_get_cookies` | 获取当前域名的 cookies |

### 配置

| 端口 | 用途 | 默认值 |
|------|------|--------|
| HTTP | MCP Streamable HTTP 端点 | 9876 |
| WebSocket | Chrome 扩展连接 | 9877 |

通过环境变量修改：
```bash
BROWSERPILOT_HTTP_PORT=8080 BROWSERPILOT_WS_PORT=8081 node packages/server/dist/index.js
```

### macOS 开机自启

```bash
# 创建 LaunchAgent
cat > ~/Library/LaunchAgents/com.browserpilot.server.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.browserpilot.server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/node</string>
        <string>/path/to/BrowserPilot/packages/server/dist/index.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# 加载
launchctl load ~/Library/LaunchAgents/com.browserpilot.server.plist
```

### 常见问题

**扩展显示"未连接"**
1. 确保 MCP Server 已运行：`curl http://127.0.0.1:9876/health`
2. 未运行则启动：`node packages/server/dist/index.js`
3. 点击 BrowserPilot 图标 → 重新连接

**AI 工具找不到浏览器工具**
1. 添加 MCP 配置后重启 AI 工具
2. 检查配置文件是否为有效 JSON
3. 确认服务运行在 9876 端口

**扩展偶尔断开**
- 这是 Manifest V3 Service Worker 的正常行为
- 扩展内置自动重连（每 3 秒）
- 需要时点击「重新连接」

### 安全

- 所有服务绑定 `127.0.0.1` — 不暴露到网络
- 所有通信仅在本地进行
- 扩展使用 `debugger` 权限控制你的真实浏览器

### 开发

```bash
pnpm install
pnpm build          # 构建所有包
pnpm build:server   # 仅构建 MCP Server
pnpm build:extension # 仅构建 Chrome 扩展
```

### 许可证

MIT
