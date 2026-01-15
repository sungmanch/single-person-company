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
echo -e "${GREEN}║          SPC AI Team Plugin Installer v2.1             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
PLUGIN_NAME="spc-ai-team"
PLUGIN_DIR="$CLAUDE_DIR/plugins/$PLUGIN_NAME"
SETTINGS_FILE="$CLAUDE_DIR/settings.json"

# Check if source files exist
if [ ! -f "$SCRIPT_DIR/.claude-plugin/plugin.json" ]; then
    echo -e "${RED}Error: plugin.json not found${NC}"
    echo "Make sure you're running this script from the spc-ai-team directory"
    exit 1
fi

echo -e "${CYAN}Installing SPC AI Team Plugin...${NC}"
echo ""

# Backup existing plugin if exists
if [ -d "$PLUGIN_DIR" ]; then
    BACKUP_DIR="$CLAUDE_DIR/backup/spc-plugin-$(date +%Y%m%d-%H%M%S)"
    echo -e "${YELLOW}Backing up existing plugin...${NC}"
    mkdir -p "$BACKUP_DIR"
    cp -r "$PLUGIN_DIR" "$BACKUP_DIR/"
    echo "  Backup saved to: $BACKUP_DIR"
    rm -rf "$PLUGIN_DIR"
fi

# Create plugin directory
mkdir -p "$PLUGIN_DIR"

# Copy plugin structure
echo -e "${BLUE}Installing plugin components...${NC}"

# Copy core directories
cp -r "$SCRIPT_DIR/.claude-plugin" "$PLUGIN_DIR/"
cp -r "$SCRIPT_DIR/agents" "$PLUGIN_DIR/"
cp -r "$SCRIPT_DIR/commands" "$PLUGIN_DIR/"
cp -r "$SCRIPT_DIR/protocols" "$PLUGIN_DIR/"

# Copy skills if exists
if [ -d "$SCRIPT_DIR/skills" ]; then
    cp -r "$SCRIPT_DIR/skills" "$PLUGIN_DIR/"
fi

# Copy hooks if exists
if [ -d "$SCRIPT_DIR/hooks" ]; then
    cp -r "$SCRIPT_DIR/hooks" "$PLUGIN_DIR/"
    chmod +x "$PLUGIN_DIR/hooks/"*.sh 2>/dev/null || true
fi

# Copy README
if [ -f "$SCRIPT_DIR/README.md" ]; then
    cp "$SCRIPT_DIR/README.md" "$PLUGIN_DIR/"
fi

# Count installed components
AGENTS_COUNT=$(ls -1 "$PLUGIN_DIR/agents/"*.md 2>/dev/null | wc -l | tr -d ' ')
COMMANDS_COUNT=$(ls -1 "$PLUGIN_DIR/commands/"*.md 2>/dev/null | wc -l | tr -d ' ')

# ============================================================
# AUTO-REGISTER PLUGIN IN SETTINGS.JSON
# ============================================================
echo -e "${BLUE}Registering plugin...${NC}"

if [ ! -f "$SETTINGS_FILE" ]; then
    # Create new settings.json
    echo '{
  "enabledPlugins": {
    "spc-ai-team@local": true
  }
}' > "$SETTINGS_FILE"
    echo "  Created settings.json with plugin enabled"
elif grep -q '"enabledPlugins"' "$SETTINGS_FILE"; then
    # enabledPlugins exists, check if our plugin is already there
    if grep -q '"spc-ai-team@local"' "$SETTINGS_FILE"; then
        echo "  Plugin already registered"
    else
        # Add our plugin to existing enabledPlugins
        # Use sed to add our plugin before the closing brace of enabledPlugins
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS sed
            sed -i '' 's/"enabledPlugins": {/"enabledPlugins": {\n    "spc-ai-team@local": true,/' "$SETTINGS_FILE"
        else
            # GNU sed
            sed -i 's/"enabledPlugins": {/"enabledPlugins": {\n    "spc-ai-team@local": true,/' "$SETTINGS_FILE"
        fi
        echo "  Added plugin to settings.json"
    fi
else
    # No enabledPlugins, need to add it
    # Create a temp file with the new content
    TMP_FILE=$(mktemp)
    # Read existing JSON and add enabledPlugins
    if command -v jq &> /dev/null; then
        jq '. + {"enabledPlugins": {"spc-ai-team@local": true}}' "$SETTINGS_FILE" > "$TMP_FILE"
        mv "$TMP_FILE" "$SETTINGS_FILE"
    else
        # Fallback: simple sed approach
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' 's/^{/{\'$'\n  "enabledPlugins": { "spc-ai-team@local": true },/' "$SETTINGS_FILE"
        else
            sed -i 's/^{/{\n  "enabledPlugins": { "spc-ai-team@local": true },/' "$SETTINGS_FILE"
        fi
    fi
    echo "  Added enabledPlugins section to settings.json"
fi

# ============================================================
# COMPLETION MESSAGE
# ============================================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  SPC AI Team Plugin installed successfully!            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BLUE}Location:${NC} $PLUGIN_DIR"
echo -e "  ${BLUE}Installed:${NC}"
echo "    Agents: $AGENTS_COUNT"
echo "    Commands: $COMMANDS_COUNT"
echo ""
echo -e "  ${GREEN}✓${NC} Auto-registered in settings.json"
echo ""
echo -e "${GREEN}Quick Start:${NC}"
echo "  /spc \"your request\"        - Full AI team workflow"
echo "  /spc:pm \"analyze this\"     - Invoke PM directly"
echo "  /spc:architect \"design\"    - Invoke Architect directly"
echo "  /spc:status                - Check project status"
echo ""
echo -e "${CYAN}Start a new Claude Code session to use the plugin.${NC}"
echo ""
