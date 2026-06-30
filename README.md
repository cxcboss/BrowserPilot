# BrowserPilot

AI-powered Chrome browser control through MCP. Let any AI assistant read, navigate, and interact with your browser via natural language.

## Architecture

```
AI Assistant ←(Streamable HTTP)→ MCP Server (persistent) ←(WebSocket)→ Chrome Extension ←(CDP)→ Browser
```

- **MCP Server**: Persistent Node.js HTTP service with Streamable HTTP transport
- **Chrome Extension**: Connects to the MCP Server via WebSocket, controls browser using Chrome DevTools Protocol

## Quick Start

### 1. Start the MCP Server

```bash
npx @browserpilot/server
```

Or clone and build locally:

```bash
git clone https://github.com/cxcboss/BrowserPilot.git
cd BrowserPilot
pnpm install
pnpm build
node packages/server/dist/index.js
```

The server starts on:
- HTTP: `http://127.0.0.1:9876/mcp`
- WebSocket: `ws://127.0.0.1:9877`

### 2. Load the Chrome Extension

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select `packages/extension/dist`
4. Click the BrowserPilot icon — it should show "已连接"

### 3. Configure Your AI Assistant

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

### 4. Start Using

Ask your AI assistant to control your browser:

- "Open github.com and search for BrowserPilot"
- "Take a screenshot of the current page"
- "Click the login button"
- "What's the title of this page?"

## Available Tools

### Navigation
| Tool | Description |
|------|-------------|
| `browser_navigate` | Navigate to a URL |
| `browser_back` | Go back in history |
| `browser_forward` | Go forward in history |
| `browser_reload` | Reload the page |

### Interaction
| Tool | Description |
|------|-------------|
| `browser_click` | Click an element by CSS selector |
| `browser_type` | Type text into an input field |
| `browser_fill` | Fill a form field directly |
| `browser_scroll` | Scroll the page |
| `browser_hover` | Hover over an element |
| `browser_select` | Select a dropdown option |

### Extraction
| Tool | Description |
|------|-------------|
| `browser_get_text` | Get text content from page or element |
| `browser_get_html` | Get HTML content |
| `browser_screenshot` | Take a screenshot |
| `browser_get_url` | Get current URL |
| `browser_get_title` | Get page title |

### Tabs
| Tool | Description |
|------|-------------|
| `browser_list_tabs` | List all open tabs |
| `browser_switch_tab` | Switch to a tab |
| `browser_new_tab` | Open a new tab |
| `browser_close_tab` | Close a tab |

### Script
| Tool | Description |
|------|-------------|
| `browser_evaluate` | Execute JavaScript in the page |

### Network
| Tool | Description |
|------|-------------|
| `browser_get_cookies` | Get cookies for the current domain |

## Configuration

### Ports

| Port | Purpose | Default |
|------|---------|---------|
| HTTP | MCP Streamable HTTP endpoint | 9876 |
| WebSocket | Chrome Extension connection | 9877 |

Change via environment variables:

```bash
BROWSERPILOT_HTTP_PORT=8080 BROWSERPILOT_WS_PORT=8081 npx @browserpilot/server
```

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
git clone https://github.com/cxcboss/BrowserPilot.git
cd BrowserPilot
pnpm install
```

### Build

```bash
pnpm build
```

## Security

- All servers bind to `127.0.0.1` — no remote access
- All communication stays on your local machine
- The extension uses the `debugger` permission to control your real browser

## License

MIT
