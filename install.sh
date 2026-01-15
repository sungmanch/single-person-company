#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          SPC AI Team Installer v3.0                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
COMMANDS_DIR="$CLAUDE_DIR/commands"
AGENTS_DIR="$CLAUDE_DIR/agents"

# Check if source files exist
if [ ! -d "$SCRIPT_DIR/commands" ] || [ ! -d "$SCRIPT_DIR/agents" ]; then
    echo -e "${RED}Error: commands or agents directory not found${NC}"
    echo "Make sure you're running this script from the spc-ai-team directory"
    exit 1
fi

echo -e "${CYAN}Installing SPC AI Team...${NC}"
echo ""

# Create directories
mkdir -p "$COMMANDS_DIR"
mkdir -p "$AGENTS_DIR"

# ============================================================
# INSTALL COMMANDS
# ============================================================
echo -e "${BLUE}Installing commands to ~/.claude/commands/...${NC}"

# Backup existing SPC commands if any
BACKUP_NEEDED=false
if ls "$COMMANDS_DIR"/spc*.md 1>/dev/null 2>&1; then
    BACKUP_DIR="$CLAUDE_DIR/backup/spc-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR/commands"
    cp "$COMMANDS_DIR"/spc*.md "$BACKUP_DIR/commands/"
    BACKUP_NEEDED=true
    echo -e "${YELLOW}  Backed up existing SPC commands${NC}"
fi

# Copy commands
cp "$SCRIPT_DIR"/commands/*.md "$COMMANDS_DIR/"
COMMANDS_COUNT=$(ls -1 "$SCRIPT_DIR/commands/"*.md 2>/dev/null | wc -l | tr -d ' ')
echo -e "  ${GREEN}✓${NC} Installed $COMMANDS_COUNT commands"

# ============================================================
# INSTALL AGENTS
# ============================================================
echo -e "${BLUE}Installing agents to ~/.claude/agents/...${NC}"

# Backup existing SPC agents if any
if ls "$AGENTS_DIR"/spc-*.md 1>/dev/null 2>&1; then
    if [ "$BACKUP_NEEDED" = false ]; then
        BACKUP_DIR="$CLAUDE_DIR/backup/spc-$(date +%Y%m%d-%H%M%S)"
    fi
    mkdir -p "$BACKUP_DIR/agents"
    cp "$AGENTS_DIR"/spc-*.md "$BACKUP_DIR/agents/"
    BACKUP_NEEDED=true
    echo -e "${YELLOW}  Backed up existing SPC agents${NC}"
fi

# Copy agents
cp "$SCRIPT_DIR"/agents/*.md "$AGENTS_DIR/"
AGENTS_COUNT=$(ls -1 "$SCRIPT_DIR/agents/"*.md 2>/dev/null | wc -l | tr -d ' ')
echo -e "  ${GREEN}✓${NC} Installed $AGENTS_COUNT agents"

if [ "$BACKUP_NEEDED" = true ]; then
    echo ""
    echo -e "  ${YELLOW}Backup saved to: $BACKUP_DIR${NC}"
fi

# ============================================================
# COMPLETION MESSAGE
# ============================================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  SPC AI Team installed successfully!                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BLUE}Installed:${NC}"
echo "    Commands: $COMMANDS_COUNT → ~/.claude/commands/"
echo "    Agents:   $AGENTS_COUNT → ~/.claude/agents/"
echo ""
echo -e "${GREEN}Quick Start:${NC}"
echo "  /spc \"your request\"        - Full AI team workflow"
echo "  /spc-pm \"analyze this\"     - Invoke PM directly"
echo "  /spc-architect \"design\"    - Invoke Architect directly"
echo "  /spc-status                - Check project status"
echo ""
echo -e "${CYAN}Start a new Claude Code session to use the commands.${NC}"
echo ""
