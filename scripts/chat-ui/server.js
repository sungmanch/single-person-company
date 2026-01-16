#!/usr/bin/env node
/**
 * SPC Chat UI Server
 *
 * Lightweight Hono + WebSocket server for real-time agent chat display.
 * 100% local - no external API calls.
 */

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import open from 'open';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Agent configuration
const AGENTS = {
  'Alex': { emoji: '🧑‍💼', role: 'PM', color: '#3B82F6' },
  'Jamie': { emoji: '📐', role: 'Architect', color: '#8B5CF6' },
  'Morgan': { emoji: '🎨', role: 'Designer', color: '#EC4899' },
  'Sam': { emoji: '💻', role: 'Developer', color: '#10B981' },
  'Taylor': { emoji: '🧪', role: 'QA', color: '#F59E0B' },
  'Riley': { emoji: '📝', role: 'Writer', color: '#6366F1' }
};

// Party mode message regex
const PARTY_EMOJIS = Object.values(AGENTS).map(a => a.emoji);
const AGENT_NAMES = Object.keys(AGENTS);
const PARTY_MESSAGE_REGEX = new RegExp(
  `^(${PARTY_EMOJIS.join('|')})\\s+(${AGENT_NAMES.join('|')}):\\s+(.+)$`,
  's'
);

// Connected WebSocket clients
const clients = new Set();

// Message history (in-memory, not persisted)
const messageHistory = [];
const MAX_HISTORY = 100;

/**
 * Parse a party mode message
 */
function parseMessage(text) {
  const lines = text.trim().split('\n');
  const messages = [];

  for (const line of lines) {
    const match = line.trim().match(PARTY_MESSAGE_REGEX);
    if (match) {
      const [, emoji, name, content] = match;
      messages.push({
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        agent: name,
        emoji,
        role: AGENTS[name]?.role || 'Unknown',
        color: AGENTS[name]?.color || '#6B7280',
        content: content.trim()
      });
    }
  }

  return messages;
}

/**
 * Broadcast message to all connected clients
 */
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}

/**
 * Add message to history and broadcast
 */
function addMessage(msg) {
  messageHistory.push(msg);
  if (messageHistory.length > MAX_HISTORY) {
    messageHistory.shift();
  }
  broadcast({ type: 'message', data: msg });
}

// Create Hono app
const app = new Hono();

// Serve static files from dist (optional - fallback HTML is built-in)
// app.use('/static/*', serveStatic({ root: join(__dirname, '../../dist') }));

// API: Get agents
app.get('/api/agents', (c) => c.json(AGENTS));

// API: Get message history
app.get('/api/messages', (c) => c.json(messageHistory));

// API: Post new message (for CLI integration)
app.post('/api/message', async (c) => {
  const { text } = await c.req.json();
  const messages = parseMessage(text);
  messages.forEach(addMessage);
  return c.json({ success: true, count: messages.length });
});

// Serve main HTML (always use inline HTML for simplicity)
app.get('/', (c) => {
  return c.html(getInlineHTML());
});

/**
 * Inline HTML fallback (for development)
 */
function getInlineHTML() {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SPC Team Chat</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a2e;
      color: #eee;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #16213e;
      padding: 16px 24px;
      border-bottom: 1px solid #0f3460;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    header h1 { font-size: 18px; font-weight: 600; }
    header .feature { color: #888; font-size: 14px; }
    .chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px 24px;
    }
    .message {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    .message-content {
      flex: 1;
    }
    .message-header {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 4px;
    }
    .agent-name { font-weight: 600; }
    .agent-role { color: #888; font-size: 12px; }
    .timestamp { color: #666; font-size: 12px; margin-left: auto; }
    .message-text {
      background: #16213e;
      padding: 12px 16px;
      border-radius: 8px;
      border-left: 3px solid;
      line-height: 1.5;
      white-space: pre-wrap;
    }
    .agents-bar {
      background: #16213e;
      padding: 12px 24px;
      border-top: 1px solid #0f3460;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .agent-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      opacity: 0.6;
    }
    .agent-badge.active { opacity: 1; }
    .connecting {
      text-align: center;
      padding: 40px;
      color: #888;
    }
    .connecting .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #333;
      border-top-color: #3B82F6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <header>
    <span style="font-size: 24px;">🏢</span>
    <h1>SPC Team Chat</h1>
    <span class="feature" id="feature-name"></span>
  </header>

  <div class="chat-container" id="chat">
    <div class="connecting">
      <div class="spinner"></div>
      <p>Connecting to agents...</p>
    </div>
  </div>

  <div class="agents-bar" id="agents-bar"></div>

  <script>
    const AGENTS = ${JSON.stringify(AGENTS)};
    const chatEl = document.getElementById('chat');
    const agentsBar = document.getElementById('agents-bar');
    const featureEl = document.getElementById('feature-name');

    // Render agents bar
    Object.entries(AGENTS).forEach(([name, info]) => {
      agentsBar.innerHTML += \`
        <div class="agent-badge" data-agent="\${name}">
          <span>\${info.emoji}</span>
          <span>\${name}</span>
        </div>
      \`;
    });

    // WebSocket connection
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(\`\${protocol}//\${location.host}/ws\`);

    ws.onopen = () => {
      chatEl.innerHTML = '<p style="text-align:center;color:#888;padding:40px;">Waiting for agent messages...</p>';
    };

    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type === 'message') {
        addMessage(data);
      } else if (type === 'history') {
        chatEl.innerHTML = '';
        data.forEach(addMessage);
      } else if (type === 'feature') {
        featureEl.textContent = '- ' + data;
      }
    };

    ws.onclose = () => {
      chatEl.innerHTML += '<p style="text-align:center;color:#F59E0B;padding:20px;">Connection closed. Refresh to reconnect.</p>';
    };

    function addMessage(msg) {
      // Clear placeholder
      const placeholder = chatEl.querySelector('.connecting, p');
      if (placeholder) placeholder.remove();

      // Mark agent as active
      const badge = agentsBar.querySelector(\`[data-agent="\${msg.agent}"]\`);
      if (badge) badge.classList.add('active');

      // Create message element
      const div = document.createElement('div');
      div.className = 'message';
      div.innerHTML = \`
        <div class="avatar" style="background:\${msg.color}20">\${msg.emoji}</div>
        <div class="message-content">
          <div class="message-header">
            <span class="agent-name" style="color:\${msg.color}">\${msg.agent}</span>
            <span class="agent-role">\${msg.role}</span>
            <span class="timestamp">\${new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
          <div class="message-text" style="border-color:\${msg.color}">\${escapeHtml(msg.content)}</div>
        </div>
      \`;

      chatEl.appendChild(div);
      chatEl.scrollTop = chatEl.scrollHeight;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
}

/**
 * Start the server
 */
export async function startServer(options = {}) {
  const port = options.port || 3847;
  const autoOpen = options.autoOpen !== false;
  const featureName = options.feature || '';

  // Create HTTP server
  const httpServer = createServer();

  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws) => {
    clients.add(ws);

    // Send history to new client
    ws.send(JSON.stringify({ type: 'history', data: messageHistory }));

    // Send feature name
    if (featureName) {
      ws.send(JSON.stringify({ type: 'feature', data: featureName }));
    }

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  // Attach Hono to HTTP server
  httpServer.on('request', async (req, res) => {
    // Skip WebSocket upgrade requests
    if (req.url === '/ws') return;

    // Collect body for POST requests
    let body = '';
    if (req.method === 'POST') {
      for await (const chunk of req) {
        body += chunk;
      }
    }

    // Handle with Hono
    const url = new URL(req.url, `http://${req.headers.host}`);
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.method === 'POST' ? body : undefined,
    });

    try {
      const response = await app.fetch(request);
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      res.writeHead(response.status, responseHeaders);
      const responseBody = await response.text();
      res.end(responseBody);
    } catch (e) {
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  });

  // Handle WebSocket upgrade
  httpServer.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  // Start listening
  return new Promise((resolve) => {
    httpServer.listen(port, async () => {
      const url = `http://localhost:${port}`;
      console.log(`🏢 SPC Chat UI running at ${url}`);

      if (autoOpen) {
        await open(url);
      }

      resolve({
        url,
        port,
        addMessage,
        broadcast,
        parseMessage,
        close: () => {
          httpServer.close();
          wss.close();
        }
      });
    });
  });
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const port = args.find(a => a.startsWith('--port='))?.split('=')[1] || 3847;
  const noOpen = args.includes('--no-open');
  const feature = args.find(a => a.startsWith('--feature='))?.split('=')[1] || '';

  startServer({ port: parseInt(port), autoOpen: !noOpen, feature });
}
