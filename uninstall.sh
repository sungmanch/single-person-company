#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          SPC AI Team Uninstaller                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Paths
CLAUDE_DIR="$HOME/.claude"
COMMANDS_DIR="$CLAUDE_DIR/commands"
AGENTS_DIR="$CLAUDE_DIR/agents"

# ============================================================
# DETECTION: Check what was installed
# ============================================================
# Check if SPC-specific Sisyphus files exist (spc-team-*)
SPC_TEAM_EXISTS=false
if ls "$AGENTS_DIR"/spc-team-*.md 1>/dev/null 2>&1; then
    SPC_TEAM_EXISTS=true
fi

# ============================================================
# COUNT FILES
# ============================================================
SPC_COMMANDS=$(ls -1 "$COMMANDS_DIR"/spc*.md 2>/dev/null | wc -l | tr -d ' ')
SPC_CORE_AGENTS=$(ls -1 "$AGENTS_DIR"/spc-{pm,architect,designer,developer,qa,writer}.md 2>/dev/null | wc -l | tr -d ' ')
SPC_TEAM_AGENTS=$(ls -1 "$AGENTS_DIR"/spc-team-*.md 2>/dev/null | wc -l | tr -d ' ')

# ============================================================
# REMOVAL: Only remove SPC files
# ============================================================
echo -e "${BLUE}Removing SPC components...${NC}"
echo ""

# Remove SPC commands
if ls "$COMMANDS_DIR"/spc*.md 1>/dev/null 2>&1; then
    rm -f "$COMMANDS_DIR"/spc*.md
    echo "  ✓ Removed $SPC_COMMANDS SPC command files"
fi

# Remove SPC core agents
if ls "$AGENTS_DIR"/spc-{pm,architect,designer,developer,qa,writer}.md 1>/dev/null 2>&1; then
    rm -f "$AGENTS_DIR"/spc-{pm,architect,designer,developer,qa,writer}.md
    echo "  ✓ Removed $SPC_CORE_AGENTS SPC core agent files"
fi

# Remove SPC team agents (only if they exist - full install)
if [ "$SPC_TEAM_EXISTS" = true ]; then
    rm -f "$AGENTS_DIR"/spc-team-*.md
    echo "  ✓ Removed $SPC_TEAM_AGENTS SPC team agent files"

    # Also remove Sisyphus commands if this was a full install
    SISYPHUS_REMOVED=0
    for cmd in sisyphus ultrawork deepsearch analyze plan review prometheus orchestrator ralph-loop cancel-ralph update simplify sisyphus-default; do
        if [ -f "$COMMANDS_DIR/$cmd.md" ]; then
            rm -f "$COMMANDS_DIR/$cmd.md"
            SISYPHUS_REMOVED=$((SISYPHUS_REMOVED + 1))
        fi
    done
    if [ "$SISYPHUS_REMOVED" -gt 0 ]; then
        echo "  ✓ Removed $SISYPHUS_REMOVED Sisyphus command files"
    fi
fi

# Remove config
if [ -f "$CLAUDE_DIR/spc-claude.md" ]; then
    rm -f "$CLAUDE_DIR/spc-claude.md"
    echo "  ✓ Removed spc-claude.md"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  SPC AI Team uninstalled successfully!                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$SPC_TEAM_EXISTS" = false ]; then
    echo -e "${CYAN}Note:${NC} Sisyphus installation was preserved"
    echo "  Your /sisyphus, /ultrawork, etc. commands still work"
fi

echo ""
echo -e "${YELLOW}Reminders:${NC}"
echo "  - Backup files in ~/.claude/backup/ were NOT removed"
echo "  - Remove ~/.spc/ directory manually if no longer needed"
echo "  - Update ~/.claude/CLAUDE.md if you added SPC references"
echo ""
