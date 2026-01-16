#!/usr/bin/env node
/**
 * SPC with Chat UI Launcher
 *
 * Integrated launcher that:
 * 1. Starts the Chat UI server (background)
 * 2. Opens browser automatically
 * 3. Returns server handle for message sending
 *
 * Usage from SPC command:
 *   This script is invoked automatically when /spc is called.
 *   It can also be run standalone for testing:
 *
 *   node scripts/spc-with-ui.js --feature "youtube learning app"
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import net from 'net';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_PATH = join(__dirname, 'chat-ui/server.js');

/**
 * Find an available port starting from the given port
 */
async function findAvailablePort(startPort = 3847) {
  const isPortAvailable = (port) => {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      server.listen(port);
    });
  };

  let port = startPort;
  while (port < startPort + 100) {
    if (await isPortAvailable(port)) {
      return port;
    }
    port++;
  }
  throw new Error('No available port found');
}

/**
 * Start the Chat UI server
 */
export async function startChatUI(options = {}) {
  const { feature = '', autoOpen = true, idleTimeout = 30 } = options;

  // Find available port
  const port = await findAvailablePort(options.port || 3847);

  // Build args
  const args = [SERVER_PATH, `--port=${port}`];
  if (!autoOpen) args.push('--no-open');
  if (feature) args.push(`--feature=${feature}`);
  if (idleTimeout) args.push(`--timeout=${idleTimeout}`);

  // Spawn server process
  const serverProcess = spawn('node', args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });

  // Wait for server to be ready
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server startup timeout')), 10000);

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('SPC Chat UI running')) {
        clearTimeout(timeout);
        resolve();
      }
      // Forward to stderr so it doesn't interfere with NDJSON
      process.stderr.write(output);
    });

    serverProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    serverProcess.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    serverProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        clearTimeout(timeout);
        reject(new Error(`Server exited with code ${code}`));
      }
    });
  });

  const url = `http://localhost:${port}`;

  return {
    url,
    port,
    process: serverProcess,

    /**
     * Send a message to the Chat UI
     */
    async sendMessage(text) {
      try {
        const response = await fetch(`${url}/api/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        return response.ok;
      } catch (e) {
        return false;
      }
    },

    /**
     * Stop the Chat UI server
     */
    stop() {
      if (serverProcess && !serverProcess.killed) {
        serverProcess.kill('SIGTERM');
      }
    }
  };
}

/**
 * Wait for server to be ready by checking the health endpoint
 */
async function waitForServer(url, maxWait = 5000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const response = await fetch(`${url}/api/agents`);
      if (response.ok) return true;
    } catch (e) {
      // Server not ready yet
    }
    await new Promise(r => setTimeout(r, 100));
  }
  return false;
}

// CLI entry point
if (process.argv[1].endsWith('spc-with-ui.js')) {
  const args = process.argv.slice(2);
  const feature = args.find(a => a.startsWith('--feature='))?.split('=').slice(1).join('=') || '';
  const noOpen = args.includes('--no-open');
  const port = parseInt(args.find(a => a.startsWith('--port='))?.split('=')[1] || '3847');

  console.error('🚀 Starting SPC Chat UI...');

  startChatUI({ feature, autoOpen: !noOpen, port })
    .then(({ url, port }) => {
      console.error(`✅ Chat UI ready at ${url}`);
      console.error('   Press Ctrl+C to stop');

      // Keep process alive
      process.on('SIGINT', () => {
        console.error('\n👋 Shutting down Chat UI...');
        process.exit(0);
      });
    })
    .catch((err) => {
      console.error('❌ Failed to start Chat UI:', err.message);
      process.exit(1);
    });
}
