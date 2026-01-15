#!/usr/bin/env node
/**
 * SPC AI Team CLI Installer
 * Usage: npx spc-ai-team OR npm install -g spc-ai-team && spc-ai-team
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors
const colors = {
    red: '\x1b[0;31m',
    green: '\x1b[0;32m',
    yellow: '\x1b[1;33m',
    blue: '\x1b[0;34m',
    cyan: '\x1b[0;36m',
    reset: '\x1b[0m'
};

const c = (color, text) => `${colors[color]}${text}${colors.reset}`;

// Paths
const HOME = process.env.HOME || process.env.USERPROFILE;
const CLAUDE_DIR = path.join(HOME, '.claude');
const COMMANDS_DIR = path.join(CLAUDE_DIR, 'commands');
const AGENTS_DIR = path.join(CLAUDE_DIR, 'agents');
const PROTOCOLS_DIR = path.join(CLAUDE_DIR, 'plugins', 'spc', 'protocols');

// Source directory (where npm installed the package)
const PKG_DIR = path.join(__dirname, '..');

// File lists
const ALL_COMMANDS = [
    'analyze', 'cancel-ralph', 'deepsearch', 'orchestrator', 'plan', 'prometheus',
    'ralph-loop', 'review', 'simplify', 'sisyphus-default', 'sisyphus',
    'spc-architect', 'spc-artifacts', 'spc-designer', 'spc-dev', 'spc-pm',
    'spc-qa', 'spc-status', 'spc-writer', 'spc', 'update', 'ultrawork'
];

const SPC_COMMANDS = [
    'spc', 'spc-architect', 'spc-artifacts', 'spc-designer', 'spc-dev',
    'spc-pm', 'spc-qa', 'spc-status', 'spc-writer'
];

const ALL_AGENTS = [
    'spc-architect', 'spc-designer', 'spc-developer', 'spc-pm', 'spc-qa',
    'spc-team-document-writer', 'spc-team-explore', 'spc-team-frontend-engineer',
    'spc-team-librarian', 'spc-team-metis', 'spc-team-momus',
    'spc-team-multimodal-looker', 'spc-team-oracle', 'spc-team-orchestrator',
    'spc-team-prometheus', 'spc-team-sisyphus-junior', 'spc-writer'
];

const SPC_AGENTS = [
    'spc-pm', 'spc-architect', 'spc-designer', 'spc-developer', 'spc-qa', 'spc-writer'
];

const PROTOCOLS = ['pm-protocol', 'architect-protocol', 'designer-protocol', 'qa-protocol'];

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function copyFile(src, dest) {
    try {
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            return true;
        }
    } catch (e) {
        // Silently fail
    }
    return false;
}

function detectSisyphus() {
    const indicators = [
        path.join(AGENTS_DIR, 'oracle.md'),
        path.join(AGENTS_DIR, 'prometheus.md'),
        path.join(COMMANDS_DIR, 'sisyphus.md')
    ];
    return indicators.some(f => fs.existsSync(f));
}

async function main() {
    console.log(c('green', '╔════════════════════════════════════════════════════════╗'));
    console.log(c('green', '║          SPC AI Team Installer (npm)                   ║'));
    console.log(c('green', '╚════════════════════════════════════════════════════════╝'));
    console.log('');

    // Create directories
    ensureDir(COMMANDS_DIR);
    ensureDir(AGENTS_DIR);
    ensureDir(PROTOCOLS_DIR);

    // Detect existing installation
    const sisyphusExists = detectSisyphus();
    const installMode = sisyphusExists ? 'addon' : 'full';

    if (sisyphusExists) {
        console.log(c('cyan', '┌────────────────────────────────────────────────────────┐'));
        console.log(c('cyan', '│  Existing Sisyphus installation detected!              │'));
        console.log(c('cyan', '│  Installing SPC components only (Add-on mode)          │'));
        console.log(c('cyan', '└────────────────────────────────────────────────────────┘'));
    } else {
        console.log(c('cyan', '┌────────────────────────────────────────────────────────┐'));
        console.log(c('cyan', '│  No Sisyphus found - Installing full package           │'));
        console.log(c('cyan', '│  (SPC + Sisyphus components)                           │'));
        console.log(c('cyan', '└────────────────────────────────────────────────────────┘'));
    }
    console.log('');

    // Install commands
    console.log(c('blue', 'Installing commands...'));
    const commandsToInstall = installMode === 'full' ? ALL_COMMANDS : SPC_COMMANDS;
    let cmdCount = 0;
    for (const cmd of commandsToInstall) {
        const src = path.join(PKG_DIR, 'commands', `${cmd}.md`);
        const dest = path.join(COMMANDS_DIR, `${cmd}.md`);
        if (copyFile(src, dest)) cmdCount++;
    }
    console.log(`  ${c('green', cmdCount)} commands installed`);

    // Install agents
    console.log(c('blue', 'Installing agents...'));
    const agentsToInstall = installMode === 'full' ? ALL_AGENTS : SPC_AGENTS;
    let agentCount = 0;
    for (const agent of agentsToInstall) {
        const src = path.join(PKG_DIR, 'agents', `${agent}.md`);
        const dest = path.join(AGENTS_DIR, `${agent}.md`);
        if (copyFile(src, dest)) agentCount++;
    }
    console.log(`  ${c('green', agentCount)} agents installed`);

    // Install spc-claude.md
    console.log(c('blue', 'Installing configuration...'));
    const configSrc = path.join(PKG_DIR, 'spc-claude.md');
    const configDest = path.join(CLAUDE_DIR, 'spc-claude.md');
    if (copyFile(configSrc, configDest)) {
        console.log(`  ${c('green', 'spc-claude.md')} installed`);
    }

    // Install protocols
    console.log(c('blue', 'Installing protocols...'));
    let protocolCount = 0;
    for (const protocol of PROTOCOLS) {
        const src = path.join(PKG_DIR, 'protocols', `${protocol}.md`);
        const dest = path.join(PROTOCOLS_DIR, `${protocol}.md`);
        if (copyFile(src, dest)) protocolCount++;
    }
    console.log(`  ${c('green', protocolCount)} protocols installed`);

    // Done
    console.log('');
    console.log(c('green', '╔════════════════════════════════════════════════════════╗'));
    if (installMode === 'full') {
        console.log(c('green', '║  SPC AI Team (Full) installed successfully!            ║'));
    } else {
        console.log(c('green', '║  SPC AI Team (Add-on) installed successfully!          ║'));
    }
    console.log(c('green', '╚════════════════════════════════════════════════════════╝'));
    console.log('');
    console.log(c('green', 'Quick Start:'));
    console.log('  /spc "your request"        - Full AI team workflow');
    console.log('  /spc:pm "analyze this"     - Invoke PM directly');
    console.log('  /spc:status                - Check project status');
    if (installMode === 'full') {
        console.log('  /sisyphus "your task"      - Multi-agent orchestration');
        console.log('  /ultrawork "your task"     - Maximum performance mode');
    }
    console.log('');
    console.log(c('cyan', 'Note:') + ' Restart Claude Code for changes to take effect.');
    console.log('');
}

main().catch(console.error);
