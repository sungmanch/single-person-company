#!/usr/bin/env node
/**
 * SPC Message Bridge
 *
 * Bridges agent messages from stdin/NDJSON stream to the Chat UI WebSocket server.
 * Can be used as a pipe filter or standalone message sender.
 *
 * Usage:
 *   # Pipe mode (filter NDJSON stream)
 *   claude -p --output-format stream-json "task" | node message-bridge.js
 *
 *   # Send single message
 *   node message-bridge.js --send "📐 Jamie: Working on architecture..."
 *
 *   # Connect to custom port
 *   node message-bridge.js --port 3847
 */

import { createInterface } from 'readline';
import WebSocket from 'ws';

// Party mode patterns
const PARTY_EMOJIS = ['🧑‍💼', '📐', '🎨', '💻', '🧪', '📝'];
const AGENT_NAMES = ['Alex', 'Jamie', 'Morgan', 'Sam', 'Taylor', 'Riley'];
const PARTY_MESSAGE_REGEX = new RegExp(
  `^(${PARTY_EMOJIS.join('|')})\\s+(${AGENT_NAMES.join('|')}):\\s+.+$`,
  's'
);

/**
 * Extract party mode messages from text
 */
function extractPartyMessages(text) {
  const messages = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (PARTY_MESSAGE_REGEX.test(trimmed)) {
      messages.push(trimmed);
    }
  }

  return messages;
}

/**
 * Connect to Chat UI server
 */
async function connectToServer(port = 3847, maxRetries = 5) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);

      await new Promise((resolve, reject) => {
        ws.on('open', resolve);
        ws.on('error', reject);
        setTimeout(() => reject(new Error('Connection timeout')), 2000);
      });

      return ws;
    } catch (e) {
      retries++;
      if (retries < maxRetries) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }

  return null;
}

/**
 * Send message to Chat UI server via HTTP
 */
async function sendMessageHTTP(text, port = 3847) {
  try {
    const response = await fetch(`http://localhost:${port}/api/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}

/**
 * Process NDJSON line from Claude stream
 */
function processNDJSONLine(line) {
  try {
    const msg = JSON.parse(line);
    const messages = [];

    // Handle different message types
    if (msg.type === 'message' && msg.content && Array.isArray(msg.content)) {
      for (const block of msg.content) {
        if (block.type === 'text' && block.text) {
          messages.push(...extractPartyMessages(block.text));
        }
      }
    }

    if (msg.type === 'assistant' && msg.message) {
      messages.push(...extractPartyMessages(msg.message));
    }

    if (msg.type === 'result' && msg.result) {
      messages.push(...extractPartyMessages(msg.result));
    }

    return messages;
  } catch (e) {
    return [];
  }
}

/**
 * Main bridge function
 */
async function main() {
  const args = process.argv.slice(2);
  const port = parseInt(args.find(a => a.startsWith('--port='))?.split('=')[1] || '3847');
  const sendMessage = args.find(a => a.startsWith('--send='))?.split('=').slice(1).join('=');

  // Single message mode
  if (sendMessage) {
    const success = await sendMessageHTTP(sendMessage, port);
    process.exit(success ? 0 : 1);
  }

  // Pipe mode - read from stdin
  console.error(`🔗 Message Bridge connecting to localhost:${port}...`);

  const ws = await connectToServer(port);

  if (!ws) {
    console.error('❌ Could not connect to Chat UI server');
    console.error('   Make sure the server is running: npm run chat-ui');
    // Continue anyway - messages will be sent via HTTP fallback
  } else {
    console.error('✅ Connected to Chat UI server');
  }

  const rl = createInterface({
    input: process.stdin,
    terminal: false
  });

  rl.on('line', async (line) => {
    const messages = processNDJSONLine(line);

    for (const msg of messages) {
      // Also print to terminal
      console.log(msg);

      // Send to Chat UI
      if (ws && ws.readyState === WebSocket.OPEN) {
        // Server will parse the message
        await sendMessageHTTP(msg, port);
      } else {
        await sendMessageHTTP(msg, port);
      }
    }
  });

  rl.on('close', () => {
    if (ws) ws.close();
    process.exit(0);
  });

  // Handle errors
  process.stdin.on('error', (err) => {
    if (err.code !== 'EPIPE') {
      console.error('Stream error:', err.message);
    }
  });
}

// Export for programmatic use
export { connectToServer, sendMessageHTTP, extractPartyMessages, processNDJSONLine };

// Run if executed directly
if (process.argv[1].endsWith('message-bridge.js')) {
  main().catch(console.error);
}
