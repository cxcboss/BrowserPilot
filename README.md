# BrowserPilot

AI-powered Chrome browser control through MCP. Let any AI assistant read, navigate, and interact with your browser via natural language.

## Architecture

```
AI Assistant ←(stdio)→ MCP Server ←(WebSocket)→ Chrome Extension ←(CDP)→ Browser
```

- **MCP Server**: Node.js process that speaks the Model Context Protocol over stdio
- **Chrome Extension**: Connects to the MCP Server via WebSocket, controls the browser using Chrome DevTools Protocol

## Quick Start

### 1. Install the MCP Server

```bash
npm install -g @browserpilot/mcp-server
```

Or run directly with npx:

```bash
npx @browserpilot/mcp-server
```

### 2. Load the Chrome Extension

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `packages/extension` directory
4. Click the BrowserPilot icon in the toolbar — it should show "Connected"

### 3. Configure Your AI Assistant

Add to your MCP config (e.g., `~/.cursor/mcp.json` for Cursor, or Claude Desktop config):

```json
{
  "mcpServers": {
    "browser": {
      "command": "npx",
      "args": ["@browserpilot/mcp-server"]
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

### WebSocket Port

Default: `9876`. Change via the extension popup or environment variable:

```bash
BROWSERPILOT_WS_PORT=8080 npx @browserpilot/mcp-server
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

- WebSocket server binds to `127.0.0.1` only — no remote access
- All communication stays on your local machine
- The extension uses the `debugger` permission to control your real browser

## License

MIT
