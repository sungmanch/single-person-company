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
 * Crystal Collective - Modern Chat UI
 * Inspired by Apple Liquid Glass, Figma Presence, Notion Typography
 */
function getInlineHTML() {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SPC Workspace</title>
  <style>
    /* ========================================
       CSS Custom Properties (Design Tokens)
       ======================================== */
    :root {
      /* Background - layered depth */
      --bg-base: #F0F2F5;
      --bg-chat: linear-gradient(135deg, #E8EBF0 0%, #F5F7FA 50%, #EEF1F5 100%);
      --bg-sidebar: linear-gradient(180deg, #FFFFFF 0%, #F8F9FB 100%);
      --bg-header: rgba(255, 255, 255, 0.92);
      --bg-hover: rgba(0, 0, 0, 0.04);

      /* Text - high contrast, readable */
      --text-primary: #1A1A1A;
      --text-secondary: #5C6370;
      --text-muted: #8B939E;

      /* Borders */
      --border-subtle: rgba(0, 0, 0, 0.08);
      --border-divider: rgba(0, 0, 0, 0.1);

      /* Agent accent colors */
      --agent-alex: #3B82F6;
      --agent-jamie: #8B5CF6;
      --agent-morgan: #EC4899;
      --agent-sam: #10B981;
      --agent-taylor: #F59E0B;
      --agent-riley: #6366F1;

      /* Agent bubble tints (very subtle) */
      --bubble-alex: linear-gradient(135deg, #EBF4FF 0%, #FFFFFF 100%);
      --bubble-jamie: linear-gradient(135deg, #F3EEFF 0%, #FFFFFF 100%);
      --bubble-morgan: linear-gradient(135deg, #FDF2F8 0%, #FFFFFF 100%);
      --bubble-sam: linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%);
      --bubble-taylor: linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%);
      --bubble-riley: linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 100%);

      /* Status colors */
      --status-active: #22C55E;
      --status-idle: #9CA3AF;
      --status-warning: #F59E0B;
      --status-critical: #EF4444;

      /* Typography */
      --font-xs: 11px;
      --font-sm: 13px;
      --font-base: 15px;
      --font-lg: 17px;

      /* Spacing */
      --sidebar-width: 220px;
      --header-height: 64px;
    }

    /* ========================================
       Reset & Base
       ======================================== */
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-base);
      color: var(--text-primary);
      height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* ========================================
       Header - Frosted Glass
       ======================================== */
    header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--header-height);
      background: var(--bg-header);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      padding: 0 24px;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--status-active);
      position: relative;
    }

    .status-dot.connected::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: var(--status-active);
      animation: pulse-ring 2s ease-out infinite;
    }

    .status-dot.disconnected {
      background: var(--status-idle);
    }

    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(2); opacity: 0; }
    }

    header h1 {
      font-size: var(--font-lg);
      font-weight: 600;
      color: var(--text-primary);
    }

    .feature-name {
      color: var(--text-muted);
      font-size: var(--font-sm);
      margin-left: 8px;
      font-weight: 400;
    }

    .header-right {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .idle-timer {
      font-size: var(--font-sm);
      font-weight: 500;
      color: var(--text-muted);
      padding: 6px 12px;
      background: var(--bg-hover);
      border-radius: 6px;
      font-variant-numeric: tabular-nums;
    }

    .idle-timer.warning { color: var(--status-warning); }
    .idle-timer.critical { color: var(--status-critical); }

    .shutdown-btn {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-divider);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: var(--font-sm);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .shutdown-btn:hover {
      background: var(--bg-hover);
      border-color: var(--text-muted);
    }

    .shutdown-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* ========================================
       Main Layout - Sidebar + Content
       ======================================== */
    .main-container {
      display: flex;
      margin-top: var(--header-height);
      height: calc(100vh - var(--header-height));
    }

    /* ========================================
       Presence Sidebar - Enhanced
       ======================================== */
    .sidebar {
      width: var(--sidebar-width);
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border-divider);
      box-shadow: 2px 0 12px rgba(0, 0, 0, 0.06);
      padding: 20px 16px;
      overflow-y: auto;
      flex-shrink: 0;
    }

    .sidebar-title {
      font-size: var(--font-xs);
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-divider);
    }

    .agent-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .agent-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px;
      border-radius: 10px;
      transition: all 0.15s ease;
      cursor: default;
      border: 1px solid transparent;
    }

    .agent-item:hover {
      background: rgba(255, 255, 255, 0.8);
      border-color: var(--border-subtle);
    }

    .agent-item.active {
      background: rgba(255, 255, 255, 0.9);
      border-color: var(--border-divider);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .presence-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--status-idle);
      margin-top: 4px;
      flex-shrink: 0;
      position: relative;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .presence-indicator.active {
      background: var(--status-active);
    }

    .presence-indicator.active::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      width: calc(100% + 4px);
      height: calc(100% + 4px);
      border-radius: 50%;
      background: var(--status-active);
      animation: pulse-ring 2s ease-out infinite;
      z-index: -1;
    }

    .agent-info {
      flex: 1;
      min-width: 0;
    }

    .agent-name-sidebar {
      font-size: var(--font-sm);
      font-weight: 600;
      line-height: 1.3;
      /* Color set dynamically via inline style */
    }

    .agent-role-sidebar {
      font-size: var(--font-xs);
      color: var(--text-secondary);
      line-height: 1.4;
      font-weight: 500;
    }

    .agent-status {
      font-size: var(--font-xs);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 3px;
    }

    .agent-status.typing {
      color: var(--status-active);
      font-weight: 500;
    }

    .typing-dots {
      display: flex;
      gap: 3px;
    }

    .typing-dots span {
      width: 5px;
      height: 5px;
      background: var(--status-active);
      border-radius: 50%;
      animation: typing-bounce 1.4s ease-in-out infinite;
    }

    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typing-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }

    /* ========================================
       Chat Area - Speech Bubbles
       ======================================== */
    .chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 24px 40px;
      scroll-behavior: smooth;
      background: var(--bg-chat);
    }

    .message {
      padding: 8px 0;
      animation: fadeIn 0.3s ease;
      margin-bottom: 16px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      padding-left: 4px;
    }

    .agent-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }

    .agent-name {
      font-size: var(--font-sm);
      font-weight: 600;
      /* Color set dynamically via inline style */
    }

    .agent-role {
      font-size: var(--font-xs);
      color: var(--text-muted);
      font-weight: 500;
    }

    .message-divider {
      color: var(--text-muted);
      font-size: var(--font-xs);
    }

    .timestamp {
      font-size: var(--font-xs);
      color: var(--text-muted);
      margin-left: auto;
    }

    /* Speech Bubble Style - Agent Tinted */
    .message-bubble {
      position: relative;
      background: white;
      border-radius: 16px;
      border-top-left-radius: 4px;
      padding: 14px 18px;
      box-shadow:
        0 1px 1px rgba(0, 0, 0, 0.04),
        0 2px 4px rgba(0, 0, 0, 0.04),
        0 4px 16px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(0, 0, 0, 0.05);
      max-width: 80%;
      margin-left: 12px;
    }

    /* Agent-specific bubble tints */
    .message-bubble.agent-alex { background: var(--bubble-alex); border-left: 3px solid var(--agent-alex); }
    .message-bubble.agent-jamie { background: var(--bubble-jamie); border-left: 3px solid var(--agent-jamie); }
    .message-bubble.agent-morgan { background: var(--bubble-morgan); border-left: 3px solid var(--agent-morgan); }
    .message-bubble.agent-sam { background: var(--bubble-sam); border-left: 3px solid var(--agent-sam); }
    .message-bubble.agent-taylor { background: var(--bubble-taylor); border-left: 3px solid var(--agent-taylor); }
    .message-bubble.agent-riley { background: var(--bubble-riley); border-left: 3px solid var(--agent-riley); }

    .message-content {
      font-size: var(--font-base);
      line-height: 1.6;
      color: var(--text-primary);
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    /* ========================================
       States & Placeholders
       ======================================== */
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--text-muted);
      text-align: center;
    }

    .placeholder-icon {
      font-size: 32px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .placeholder-text {
      font-size: var(--font-sm);
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid var(--border-divider);
      border-top-color: var(--text-muted);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 12px;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ========================================
       Warning Banner
       ======================================== */
    .warning-banner {
      position: fixed;
      top: calc(var(--header-height) + 12px);
      left: 50%;
      transform: translateX(-50%);
      background: var(--status-critical);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: var(--font-sm);
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      z-index: 200;
      animation: pulse-opacity 1s ease-in-out infinite;
    }

    @keyframes pulse-opacity {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.85; }
    }

    /* ========================================
       Responsive - Mobile
       ======================================== */
    @media (max-width: 768px) {
      :root {
        --sidebar-width: 0px;
        --header-height: 120px;
      }

      .sidebar {
        display: none;
      }

      header {
        flex-direction: column;
        align-items: stretch;
        padding: 12px 16px;
        gap: 12px;
      }

      .header-top {
        display: flex;
        align-items: center;
        width: 100%;
      }

      .header-left {
        flex: 1;
      }

      .mobile-agents {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding: 8px 0;
        -webkit-overflow-scrolling: touch;
      }

      .mobile-agent {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        background: var(--bg-hover);
        border-radius: 20px;
        flex-shrink: 0;
        font-size: var(--font-xs);
      }

      .mobile-agent .presence-indicator {
        margin-top: 0;
      }

      .chat-container {
        padding: 16px;
      }
    }

    @media (min-width: 769px) {
      .mobile-agents {
        display: none;
      }

      .header-top {
        display: contents;
      }
    }

    /* ========================================
       System Messages
       ======================================== */
    .system-message {
      text-align: center;
      padding: 16px;
      color: var(--text-muted);
      font-size: var(--font-sm);
    }

    .system-message.error {
      color: var(--status-critical);
    }

    .system-message.warning {
      color: var(--status-warning);
    }
  </style>
</head>
<body>
  <header>
    <div class="header-top">
      <div class="header-left">
        <div class="status-dot connected" id="status-dot"></div>
        <h1>SPC Workspace</h1>
        <span class="feature-name" id="feature-name"></span>
      </div>
      <div class="header-right">
        <span class="idle-timer" id="idle-timer" title="Auto-shutdown timer">--:--</span>
        <button class="shutdown-btn" id="shutdown-btn">Stop</button>
      </div>
    </div>
    <div class="mobile-agents" id="mobile-agents"></div>
  </header>

  <div class="main-container">
    <aside class="sidebar">
      <div class="sidebar-title">Team</div>
      <div class="agent-list" id="agent-list"></div>
    </aside>

    <main class="chat-container" id="chat">
      <div class="placeholder">
        <div class="spinner"></div>
        <p class="placeholder-text">Connecting to workspace...</p>
      </div>
    </main>
  </div>

  <script>
    const AGENTS = ${JSON.stringify(AGENTS)};
    const AGENT_COLORS = {
      'Alex': 'var(--agent-alex)',
      'Jamie': 'var(--agent-jamie)',
      'Morgan': 'var(--agent-morgan)',
      'Sam': 'var(--agent-sam)',
      'Taylor': 'var(--agent-taylor)',
      'Riley': 'var(--agent-riley)'
    };

    // DOM Elements
    const chatEl = document.getElementById('chat');
    const agentListEl = document.getElementById('agent-list');
    const mobileAgentsEl = document.getElementById('mobile-agents');
    const featureEl = document.getElementById('feature-name');
    const idleTimerEl = document.getElementById('idle-timer');
    const shutdownBtn = document.getElementById('shutdown-btn');
    const statusDot = document.getElementById('status-dot');

    // State
    let remainingSeconds = ${idleTimeout / 1000};
    let timerInterval = null;
    const agentStates = {};

    // Initialize agent states
    Object.keys(AGENTS).forEach(name => {
      agentStates[name] = { status: 'idle', lastSeen: null };
    });

    // Render sidebar agents with colored names
    function renderAgentList() {
      agentListEl.innerHTML = Object.entries(AGENTS).map(([name, info]) => {
        const state = agentStates[name] || { status: 'idle' };
        const isActive = state.status !== 'idle';
        const agentColor = AGENT_COLORS[name] || 'var(--text-primary)';
        const statusText = state.status === 'typing'
          ? '<span class="typing-dots"><span></span><span></span><span></span></span>'
          : state.status === 'idle' ? '' : state.status;

        return \`
          <div class="agent-item \${isActive ? 'active' : ''}" data-agent="\${name}">
            <div class="presence-indicator \${isActive ? 'active' : ''}" style="background:\${agentColor}"></div>
            <div class="agent-info">
              <div class="agent-name-sidebar" style="color:\${agentColor}">\${name}</div>
              <div class="agent-role-sidebar">\${info.role}</div>
              \${statusText ? '<div class="agent-status ' + state.status + '">' + statusText + '</div>' : ''}
            </div>
          </div>
        \`;
      }).join('');
    }

    // Render mobile agents with colors
    function renderMobileAgents() {
      mobileAgentsEl.innerHTML = Object.entries(AGENTS).map(([name, info]) => {
        const state = agentStates[name] || { status: 'idle' };
        const isActive = state.status !== 'idle';
        const agentColor = AGENT_COLORS[name] || 'var(--text-primary)';

        return \`
          <div class="mobile-agent" data-agent="\${name}">
            <div class="presence-indicator \${isActive ? 'active' : ''}" style="background:\${agentColor}"></div>
            <span style="color:\${agentColor}; font-weight:500;">\${name}</span>
          </div>
        \`;
      }).join('');
    }

    // Update agent state
    function updateAgentState(name, status) {
      if (agentStates[name]) {
        agentStates[name] = { status, lastSeen: Date.now() };
        renderAgentList();
        renderMobileAgents();

        // Auto-reset to idle after 5 seconds if no new activity
        setTimeout(() => {
          if (agentStates[name] && Date.now() - agentStates[name].lastSeen >= 5000) {
            agentStates[name].status = 'idle';
            renderAgentList();
            renderMobileAgents();
          }
        }, 5000);
      }
    }

    // Timer display
    function updateTimerDisplay() {
      const mins = Math.floor(remainingSeconds / 60);
      const secs = remainingSeconds % 60;
      idleTimerEl.textContent = mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');

      idleTimerEl.classList.remove('warning', 'critical');
      if (remainingSeconds <= 60) {
        idleTimerEl.classList.add('critical');
      } else if (remainingSeconds <= 300) {
        idleTimerEl.classList.add('warning');
      }
    }

    function startTimer() {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        remainingSeconds = Math.max(0, remainingSeconds - 1);
        updateTimerDisplay();
      }, 1000);
      updateTimerDisplay();
    }

    // Shutdown handler
    shutdownBtn.addEventListener('click', async () => {
      if (!confirm('Stop the workspace?')) return;
      shutdownBtn.disabled = true;
      shutdownBtn.textContent = 'Stopping...';
      try {
        await fetch('/api/shutdown', { method: 'POST' });
      } catch (e) {}
    });

    // Initialize
    renderAgentList();
    renderMobileAgents();
    startTimer();

    // WebSocket connection
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(\`\${protocol}//\${location.host}/ws\`);

    ws.onopen = () => {
      statusDot.classList.add('connected');
      statusDot.classList.remove('disconnected');
      chatEl.innerHTML = '<div class="placeholder"><div class="placeholder-icon">💬</div><p class="placeholder-text">Waiting for team activity...</p></div>';
    };

    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);

      if (type === 'message') {
        addMessage(data);
        updateAgentState(data.agent, 'typing');
        remainingSeconds = ${idleTimeout / 1000};
        updateTimerDisplay();
      } else if (type === 'history') {
        chatEl.innerHTML = '';
        if (data.length === 0) {
          chatEl.innerHTML = '<div class="placeholder"><div class="placeholder-icon">💬</div><p class="placeholder-text">Waiting for team activity...</p></div>';
        } else {
          data.forEach(addMessage);
        }
      } else if (type === 'feature') {
        featureEl.textContent = data;
      } else if (type === 'shutdown') {
        if (timerInterval) clearInterval(timerInterval);
        statusDot.classList.remove('connected');
        statusDot.classList.add('disconnected');
        idleTimerEl.textContent = 'Stopped';
        idleTimerEl.classList.add('critical');
        shutdownBtn.disabled = true;
        chatEl.innerHTML += '<div class="system-message">Workspace stopped (' + data + ')</div>';
      } else if (type === 'timer_reset') {
        remainingSeconds = data;
        updateTimerDisplay();
      } else if (type === 'timer_warning') {
        remainingSeconds = data;
        updateTimerDisplay();
        if (data <= 30 && !document.getElementById('shutdown-warning')) {
          const warning = document.createElement('div');
          warning.id = 'shutdown-warning';
          warning.className = 'warning-banner';
          warning.textContent = '⚠️ Auto-stop in ' + data + ' seconds';
          document.body.appendChild(warning);
        }
      } else if (type === 'agent_status') {
        Object.assign(agentStates, data);
        renderAgentList();
        renderMobileAgents();
      }
    };

    ws.onclose = () => {
      if (timerInterval) clearInterval(timerInterval);
      statusDot.classList.remove('connected');
      statusDot.classList.add('disconnected');
      idleTimerEl.textContent = 'Offline';
      shutdownBtn.disabled = true;
      chatEl.innerHTML += '<div class="system-message warning">Connection lost. Refresh to reconnect.</div>';
    };

    function addMessage(msg) {
      // Clear placeholder
      const placeholder = chatEl.querySelector('.placeholder');
      if (placeholder) placeholder.remove();

      const agentColor = AGENT_COLORS[msg.agent] || 'var(--text-muted)';
      const agentClass = 'agent-' + msg.agent.toLowerCase();

      const div = document.createElement('div');
      div.className = 'message';
      div.innerHTML = \`
        <div class="message-header">
          <div class="agent-dot" style="background:\${agentColor}"></div>
          <span class="agent-name" style="color:\${agentColor}">\${msg.agent}</span>
          <span class="message-divider">·</span>
          <span class="agent-role">\${msg.role}</span>
          <span class="timestamp">\${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="message-bubble \${agentClass}">
          <div class="message-content">\${escapeHtml(msg.content)}</div>
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
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const body = Buffer.concat(chunks).toString('utf-8');
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
