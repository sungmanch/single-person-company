#!/usr/bin/env node
/**
 * Party Mode Filter for SPC AI Team
 *
 * Filters NDJSON stream from Claude to extract only party mode messages.
 * These are short, chat-like updates from agents.
 *
 * Usage:
 *   claude -p --output-format stream-json "task" | node scripts/party-filter.js
 *
 * Input: NDJSON stream with Claude messages
 * Output: Party mode messages only (format: {emoji} {name}: {message})
 */

const readline = require('readline');

// Party mode emoji patterns for each agent
const PARTY_EMOJIS = ['🧑‍💼', '📐', '🎨', '💻', '🧪', '📝'];
const PARTY_EMOJI_REGEX = new RegExp(`^(${PARTY_EMOJIS.join('|')})`);

// Agent names for validation
const AGENT_NAMES = ['Alex', 'Jamie', 'Morgan', 'Sam', 'Taylor', 'Riley'];

// Full party message pattern: {emoji} {name}: {message}
const PARTY_MESSAGE_REGEX = new RegExp(
  `^(${PARTY_EMOJIS.join('|')})\\s+(${AGENT_NAMES.join('|')}):\\s+.+$`
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

/**
 * Extract party mode messages from Claude's text output
 * @param {string} text - Text content from Claude message
 * @returns {string[]} - Array of party mode messages
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
 * Process a single NDJSON line
 * @param {string} line - Raw NDJSON line from stream
 */
function processLine(line) {
  try {
    const msg = JSON.parse(line);

    // Handle message type with content blocks
    if (msg.type === 'message' && msg.content && Array.isArray(msg.content)) {
      for (const block of msg.content) {
        if (block.type === 'text' && block.text) {
          const partyMessages = extractPartyMessages(block.text);
          for (const partyMsg of partyMessages) {
            console.log(partyMsg);
          }
        }
      }
    }

    // Handle assistant messages with text field directly
    if (msg.type === 'assistant' && msg.message) {
      const partyMessages = extractPartyMessages(msg.message);
      for (const partyMsg of partyMessages) {
        console.log(partyMsg);
      }
    }

    // Handle result type (completion message)
    if (msg.type === 'result' && msg.result) {
      const partyMessages = extractPartyMessages(msg.result);
      for (const partyMsg of partyMessages) {
        console.log(partyMsg);
      }
    }

  } catch (e) {
    // JSON parsing failed - not a valid NDJSON line, skip silently
  }
}

// Process stdin line by line
rl.on('line', processLine);

// Handle close
rl.on('close', () => {
  // Stream ended
});

// Handle errors gracefully
process.stdin.on('error', (err) => {
  if (err.code !== 'EPIPE') {
    console.error('Stream error:', err.message);
  }
});

process.stdout.on('error', (err) => {
  if (err.code !== 'EPIPE') {
    console.error('Output error:', err.message);
  }
});
