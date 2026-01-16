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

// Activity tracking for auto-shutdown
let lastActivityTime = Date.now();
const DEFAULT_IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes default
let idleTimeout = DEFAULT_IDLE_TIMEOUT;
let idleCheckInterval = null;
let serverInstance = null;
let wssInstance = null;

/**
 * Update last activity timestamp
 */
function updateActivity() {
  lastActivityTime = Date.now();
}

/**
 * Get remaining time before auto-shutdown (in seconds)
 */
function getRemainingTime() {
  const elapsed = Date.now() - lastActivityTime;
  const remaining = Math.max(0, idleTimeout - elapsed);
  return Math.ceil(remaining / 1000);
}

/**
 * Graceful shutdown
 */
function shutdown(reason = 'manual') {
  console.log(`\n🛑 Shutting down Chat UI (${reason})...`);

  // Notify all clients
  broadcast({ type: 'shutdown', reason });

  // Clear interval
  if (idleCheckInterval) {
    clearInterval(idleCheckInterval);
    idleCheckInterval = null;
  }

  // Close WebSocket connections
  clients.forEach(client => {
    try { client.close(); } catch (e) {}
  });
  clients.clear();

  // Close servers
  if (wssInstance) {
    try { wssInstance.close(); } catch (e) {}
  }
  if (serverInstance) {
    try { serverInstance.close(); } catch (e) {}
  }

  // Exit process
  setTimeout(() => process.exit(0), 500);
}

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
  updateActivity(); // Reset idle timer on new message
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
    header .feature { color: #888; font-size: 14px; flex: 1; }
    header .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .idle-timer {
      font-size: 12px;
      color: #666;
      padding: 4px 8px;
      background: #0f3460;
      border-radius: 4px;
    }
    .idle-timer.warning { color: #F59E0B; }
    .idle-timer.critical { color: #EF4444; }
    .shutdown-btn {
      background: #EF4444;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .shutdown-btn:hover { background: #DC2626; }
    .shutdown-btn:disabled {
      background: #666;
      cursor: not-allowed;
    }
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
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  </style>
</head>
<body>
  <header>
    <span style="font-size: 24px;">🏢</span>
    <h1>SPC Team Chat</h1>
    <span class="feature" id="feature-name"></span>
    <div class="header-right">
      <span class="idle-timer" id="idle-timer" title="Auto-shutdown timer">--:--</span>
      <button class="shutdown-btn" id="shutdown-btn" title="Stop server">종료</button>
    </div>
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
    const idleTimerEl = document.getElementById('idle-timer');
    const shutdownBtn = document.getElementById('shutdown-btn');

    let remainingSeconds = ${idleTimeout / 1000};
    let timerInterval = null;

    // Update idle timer display
    function updateTimerDisplay() {
      const mins = Math.floor(remainingSeconds / 60);
      const secs = remainingSeconds % 60;
      idleTimerEl.textContent = mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');

      // Update color based on remaining time
      idleTimerEl.classList.remove('warning', 'critical');
      if (remainingSeconds <= 60) {
        idleTimerEl.classList.add('critical');
      } else if (remainingSeconds <= 300) {
        idleTimerEl.classList.add('warning');
      }
    }

    // Start countdown timer
    function startTimer() {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        remainingSeconds = Math.max(0, remainingSeconds - 1);
        updateTimerDisplay();
      }, 1000);
      updateTimerDisplay();
    }

    // Handle shutdown button
    shutdownBtn.addEventListener('click', async () => {
      if (!confirm('서버를 종료하시겠습니까?')) return;

      shutdownBtn.disabled = true;
      shutdownBtn.textContent = '종료 중...';

      try {
        await fetch('/api/shutdown', { method: 'POST' });
      } catch (e) {
        // Server might already be closed
      }
    });

    startTimer();

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
        // Reset timer on new message
        remainingSeconds = ${idleTimeout / 1000};
        updateTimerDisplay();
      } else if (type === 'history') {
        chatEl.innerHTML = '';
        data.forEach(addMessage);
      } else if (type === 'feature') {
        featureEl.textContent = '- ' + data;
      } else if (type === 'shutdown') {
        // Server is shutting down
        if (timerInterval) clearInterval(timerInterval);
        idleTimerEl.textContent = '종료됨';
        idleTimerEl.classList.add('critical');
        shutdownBtn.disabled = true;
        shutdownBtn.textContent = '종료됨';
        chatEl.innerHTML += '<p style="text-align:center;color:#EF4444;padding:20px;font-weight:bold;">🛑 서버가 종료되었습니다. (' + data + ')</p>';
      } else if (type === 'timer_reset') {
        // Timer was reset by activity
        remainingSeconds = data;
        updateTimerDisplay();
      } else if (type === 'timer_warning') {
        // Warning when close to shutdown
        remainingSeconds = data;
        updateTimerDisplay();
        if (data <= 30 && !document.getElementById('shutdown-warning')) {
          const warning = document.createElement('div');
          warning.id = 'shutdown-warning';
          warning.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);background:#EF4444;color:white;padding:12px 24px;border-radius:8px;font-weight:bold;z-index:1000;animation:pulse 1s infinite;';
          warning.textContent = '⚠️ ' + data + '초 후 서버가 자동 종료됩니다!';
          document.body.appendChild(warning);
        }
      }
    };

    ws.onclose = () => {
      if (timerInterval) clearInterval(timerInterval);
      idleTimerEl.textContent = '연결 끊김';
      shutdownBtn.disabled = true;
      chatEl.innerHTML += '<p style="text-align:center;color:#F59E0B;padding:20px;">연결이 종료되었습니다. 새로고침하여 재연결하세요.</p>';
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

  // Set idle timeout (default: 30 minutes)
  idleTimeout = (options.idleTimeout || 30) * 60 * 1000;
  lastActivityTime = Date.now();

  // Create HTTP server
  const httpServer = createServer();
  serverInstance = httpServer;

  // Create WebSocket server (noServer mode - we handle upgrades manually)
  const wss = new WebSocketServer({ noServer: true });
  wssInstance = wss;

  wss.on('connection', (ws) => {
    clients.add(ws);
    updateActivity(); // Reset timer on new connection

    // Send history to new client
    ws.send(JSON.stringify({ type: 'history', data: messageHistory }));

    // Send feature name
    if (featureName) {
      ws.send(JSON.stringify({ type: 'feature', data: featureName }));
    }

    // Send current remaining time
    ws.send(JSON.stringify({ type: 'timer_reset', data: getRemainingTime() }));

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  // Attach HTTP request handler
  httpServer.on('request', async (req, res) => {
    // Skip WebSocket upgrade requests
    if (req.url === '/ws') return;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Handle API endpoints directly (simpler than routing through Hono)
    if (req.url === '/api/agents' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(AGENTS));
      return;
    }

    if (req.url === '/api/messages' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(messageHistory));
      return;
    }

    if (req.url === '/api/message' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      try {
        const { text } = JSON.parse(body);
        const messages = parseMessage(text);
        messages.forEach(addMessage);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, count: messages.length }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON', message: e.message }));
      }
      return;
    }

    // API: Shutdown server
    if (req.url === '/api/shutdown' && req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Shutting down...' }));
      setTimeout(() => shutdown('user-requested'), 100);
      return;
    }

    // API: Get server status (including remaining idle time)
    if (req.url === '/api/status' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        uptime: Math.floor((Date.now() - (lastActivityTime - idleTimeout + getRemainingTime() * 1000)) / 1000),
        idleTimeoutSeconds: idleTimeout / 1000,
        remainingSeconds: getRemainingTime(),
        connectedClients: clients.size,
        messageCount: messageHistory.length
      }));
      return;
    }

    // API: Reset idle timer (keep alive)
    if (req.url === '/api/keepalive' && req.method === 'POST') {
      updateActivity();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, remainingSeconds: getRemainingTime() }));
      return;
    }

    // Serve main HTML for root
    if (req.url === '/' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getInlineHTML());
      return;
    }

    // 404 for unknown routes
    res.writeHead(404);
    res.end('Not Found');
  });

  // Handle WebSocket upgrade
  httpServer.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Start listening
  return new Promise((resolve) => {
    httpServer.listen(port, async () => {
      const url = `http://localhost:${port}`;
      console.log(`🏢 SPC Chat UI running at ${url}`);
      console.log(`⏱️  Auto-shutdown after ${idleTimeout / 60000} minutes of inactivity`);

      // Start idle timeout checker
      idleCheckInterval = setInterval(() => {
        const remaining = getRemainingTime();
        if (remaining <= 0) {
          shutdown('idle-timeout');
        } else if (remaining <= 60) {
          // Warn clients when less than 1 minute remaining
          broadcast({ type: 'timer_warning', data: remaining });
        }
      }, 1000);

      if (autoOpen) {
        await open(url);
      }

      resolve({
        url,
        port,
        addMessage,
        broadcast,
        parseMessage,
        updateActivity,
        getRemainingTime,
        shutdown,
        close: () => {
          if (idleCheckInterval) {
            clearInterval(idleCheckInterval);
          }
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
  const idleTimeoutArg = args.find(a => a.startsWith('--timeout='))?.split('=')[1];
  const idleTimeout = idleTimeoutArg ? parseInt(idleTimeoutArg) : 30; // Default 30 minutes

  startServer({ port: parseInt(port), autoOpen: !noOpen, feature, idleTimeout });

  // Handle SIGINT for graceful shutdown
  process.on('SIGINT', () => {
    shutdown('ctrl-c');
  });
}
