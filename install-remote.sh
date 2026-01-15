#!/bin/sh
# SPC AI Team - Remote Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/sungmancho/spc-ai-team/main/install-remote.sh | sh
set -e

# Colors (POSIX compatible)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
REPO_OWNER="sungmancho"
REPO_NAME="spc-ai-team"
BRANCH="main"
BASE_URL="https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}"

# Paths
CLAUDE_DIR="$HOME/.claude"
COMMANDS_DIR="$CLAUDE_DIR/commands"
AGENTS_DIR="$CLAUDE_DIR/agents"
TMP_DIR=$(mktemp -d)

# Cleanup on exit
cleanup() {
    rm -rf "$TMP_DIR"
}
trap cleanup EXIT

printf "${GREEN}╔════════════════════════════════════════════════════════╗${NC}\n"
printf "${GREEN}║          SPC AI Team Remote Installer                  ║${NC}\n"
printf "${GREEN}╚════════════════════════════════════════════════════════╝${NC}\n"
printf "\n"

# Check for curl or wget
if command -v curl >/dev/null 2>&1; then
    DOWNLOAD="curl -fsSL"
elif command -v wget >/dev/null 2>&1; then
    DOWNLOAD="wget -qO-"
else
    printf "${RED}Error: curl or wget is required${NC}\n"
    exit 1
fi

# Create directories
mkdir -p "$COMMANDS_DIR"
mkdir -p "$AGENTS_DIR"

# File lists
COMMANDS="analyze cancel-ralph deepsearch orchestrator plan prometheus ralph-loop review simplify sisyphus-default sisyphus spc-architect spc-artifacts spc-designer spc-dev spc-pm spc-qa spc-status spc-writer spc update ultrawork"

AGENTS="spc-architect spc-designer spc-developer spc-pm spc-qa spc-team-document-writer spc-team-explore spc-team-frontend-engineer spc-team-librarian spc-team-metis spc-team-momus spc-team-multimodal-looker spc-team-oracle spc-team-orchestrator spc-team-prometheus spc-team-sisyphus-junior spc-writer"

# ============================================================
# SMART DETECTION: Check if Sisyphus is already installed
# ============================================================
SISYPHUS_EXISTS=false
for indicator in "$AGENTS_DIR/oracle.md" "$AGENTS_DIR/prometheus.md" "$COMMANDS_DIR/sisyphus.md"; do
    if [ -f "$indicator" ]; then
        SISYPHUS_EXISTS=true
        break
    fi
done

if [ "$SISYPHUS_EXISTS" = true ]; then
    printf "${CYAN}┌────────────────────────────────────────────────────────┐${NC}\n"
    printf "${CYAN}│  Existing Sisyphus installation detected!              │${NC}\n"
    printf "${CYAN}│  Installing SPC components only (Add-on mode)          │${NC}\n"
    printf "${CYAN}└────────────────────────────────────────────────────────┘${NC}\n"
    printf "\n"
    INSTALL_MODE="addon"
else
    printf "${CYAN}┌────────────────────────────────────────────────────────┐${NC}\n"
    printf "${CYAN}│  No Sisyphus found - Installing full package           │${NC}\n"
    printf "${CYAN}│  (SPC + Sisyphus components)                           │${NC}\n"
    printf "${CYAN}└────────────────────────────────────────────────────────┘${NC}\n"
    printf "\n"
    INSTALL_MODE="full"
fi

# ============================================================
# DOWNLOAD AND INSTALL
# ============================================================
download_file() {
    url="$1"
    dest="$2"
    if ! $DOWNLOAD "$url" > "$dest" 2>/dev/null; then
        return 1
    fi
    return 0
}

printf "${BLUE}Downloading and installing...${NC}\n"

# Download commands
cmd_count=0
cmd_failed=0
if [ "$INSTALL_MODE" = "full" ]; then
    for cmd in $COMMANDS; do
        if download_file "${BASE_URL}/commands/${cmd}.md" "$COMMANDS_DIR/${cmd}.md"; then
            cmd_count=$((cmd_count + 1))
        else
            cmd_failed=$((cmd_failed + 1))
        fi
    done
else
    # Add-on mode: SPC commands only
    for cmd in spc spc-architect spc-artifacts spc-designer spc-dev spc-pm spc-qa spc-status spc-writer; do
        if download_file "${BASE_URL}/commands/${cmd}.md" "$COMMANDS_DIR/${cmd}.md"; then
            cmd_count=$((cmd_count + 1))
        else
            cmd_failed=$((cmd_failed + 1))
        fi
    done
fi
printf "  Commands: ${GREEN}${cmd_count}${NC} installed"
[ "$cmd_failed" -gt 0 ] && printf ", ${YELLOW}${cmd_failed} skipped${NC}"
printf "\n"

# Download agents
agent_count=0
agent_failed=0
if [ "$INSTALL_MODE" = "full" ]; then
    for agent in $AGENTS; do
        if download_file "${BASE_URL}/agents/${agent}.md" "$AGENTS_DIR/${agent}.md"; then
            agent_count=$((agent_count + 1))
        else
            agent_failed=$((agent_failed + 1))
        fi
    done
else
    # Add-on mode: SPC core agents only
    for agent in spc-pm spc-architect spc-designer spc-developer spc-qa spc-writer; do
        if download_file "${BASE_URL}/agents/${agent}.md" "$AGENTS_DIR/${agent}.md"; then
            agent_count=$((agent_count + 1))
        else
            agent_failed=$((agent_failed + 1))
        fi
    done
fi
printf "  Agents: ${GREEN}${agent_count}${NC} installed"
[ "$agent_failed" -gt 0 ] && printf ", ${YELLOW}${agent_failed} skipped${NC}"
printf "\n"

# Download spc-claude.md
if download_file "${BASE_URL}/spc-claude.md" "$CLAUDE_DIR/spc-claude.md"; then
    printf "  Config: ${GREEN}spc-claude.md${NC} installed\n"
fi

# Download protocols
PROTOCOLS_DIR="$CLAUDE_DIR/plugins/spc/protocols"
mkdir -p "$PROTOCOLS_DIR"
protocol_count=0
for protocol in pm-protocol architect-protocol designer-protocol qa-protocol; do
    if download_file "${BASE_URL}/protocols/${protocol}.md" "$PROTOCOLS_DIR/${protocol}.md"; then
        protocol_count=$((protocol_count + 1))
    fi
done
printf "  Protocols: ${GREEN}${protocol_count}${NC} installed\n"

# ============================================================
# COMPLETE
# ============================================================
printf "\n"
printf "${GREEN}╔════════════════════════════════════════════════════════╗${NC}\n"
if [ "$INSTALL_MODE" = "full" ]; then
    printf "${GREEN}║  SPC AI Team (Full) installed successfully!            ║${NC}\n"
else
    printf "${GREEN}║  SPC AI Team (Add-on) installed successfully!          ║${NC}\n"
fi
printf "${GREEN}╚════════════════════════════════════════════════════════╝${NC}\n"
printf "\n"
printf "${GREEN}Quick Start:${NC}\n"
printf "  /spc \"your request\"        - Full AI team workflow\n"
printf "  /spc:pm \"analyze this\"     - Invoke PM directly\n"
printf "  /spc:status                - Check project status\n"
if [ "$INSTALL_MODE" = "full" ]; then
    printf "  /sisyphus \"your task\"      - Multi-agent orchestration\n"
    printf "  /ultrawork \"your task\"     - Maximum performance mode\n"
fi
printf "\n"
printf "${CYAN}Note:${NC} Restart Claude Code for changes to take effect.\n"
printf "\n"
