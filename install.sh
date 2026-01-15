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
echo -e "${GREEN}║          SPC AI Team Installer                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
COMMANDS_DIR="$CLAUDE_DIR/commands"
AGENTS_DIR="$CLAUDE_DIR/agents"

# Check if source files exist
if [ ! -d "$SCRIPT_DIR/commands" ] || [ ! -d "$SCRIPT_DIR/agents" ]; then
    echo -e "${RED}Error: Source directories not found${NC}"
    echo "Make sure you're running this script from the spc-ai-team directory"
    exit 1
fi

# Create directories
mkdir -p "$COMMANDS_DIR"
mkdir -p "$AGENTS_DIR"

# ============================================================
# SMART DETECTION: Check if Sisyphus is already installed
# ============================================================
SISYPHUS_EXISTS=false
SISYPHUS_INDICATORS=(
    "$AGENTS_DIR/oracle.md"
    "$AGENTS_DIR/prometheus.md"
    "$AGENTS_DIR/momus.md"
    "$COMMANDS_DIR/sisyphus.md"
)

for indicator in "${SISYPHUS_INDICATORS[@]}"; do
    if [ -f "$indicator" ]; then
        SISYPHUS_EXISTS=true
        break
    fi
done

if [ "$SISYPHUS_EXISTS" = true ]; then
    echo -e "${CYAN}┌────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│  Existing Sisyphus installation detected!              │${NC}"
    echo -e "${CYAN}│  Installing SPC components only (Add-on mode)          │${NC}"
    echo -e "${CYAN}└────────────────────────────────────────────────────────┘${NC}"
    echo ""
    INSTALL_MODE="addon"
else
    echo -e "${CYAN}┌────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│  No Sisyphus found - Installing full package           │${NC}"
    echo -e "${CYAN}│  (SPC + Sisyphus components)                           │${NC}"
    echo -e "${CYAN}└────────────────────────────────────────────────────────┘${NC}"
    echo ""
    INSTALL_MODE="full"
fi

# ============================================================
# BACKUP: Only backup SPC files (never touch Sisyphus backups)
# ============================================================
BACKUP_DIR="$CLAUDE_DIR/backup/spc-$(date +%Y%m%d-%H%M%S)"
BACKUP_NEEDED=false

# Backup existing SPC commands
if ls "$COMMANDS_DIR"/spc*.md 1>/dev/null 2>&1; then
    echo -e "${YELLOW}Backing up existing SPC commands...${NC}"
    mkdir -p "$BACKUP_DIR/commands"
    cp "$COMMANDS_DIR"/spc*.md "$BACKUP_DIR/commands/"
    BACKUP_NEEDED=true
fi

# Backup existing SPC agents
if ls "$AGENTS_DIR"/spc-*.md 1>/dev/null 2>&1; then
    echo -e "${YELLOW}Backing up existing SPC agents...${NC}"
    mkdir -p "$BACKUP_DIR/agents"
    cp "$AGENTS_DIR"/spc-*.md "$BACKUP_DIR/agents/"
    BACKUP_NEEDED=true
fi

if [ "$BACKUP_NEEDED" = true ]; then
    echo "  Backup saved to: $BACKUP_DIR"
    echo ""
fi

# ============================================================
# INSTALLATION
# ============================================================
if [ "$INSTALL_MODE" = "full" ]; then
    # Full installation: SPC + Sisyphus
    echo -e "${BLUE}Installing all commands...${NC}"
    cp "$SCRIPT_DIR"/commands/*.md "$COMMANDS_DIR/"

    echo -e "${BLUE}Installing all agents...${NC}"
    cp "$SCRIPT_DIR"/agents/*.md "$AGENTS_DIR/"
else
    # Add-on installation: SPC only
    echo -e "${BLUE}Installing SPC commands only...${NC}"
    cp "$SCRIPT_DIR"/commands/spc*.md "$COMMANDS_DIR/"

    echo -e "${BLUE}Installing SPC core agents only...${NC}"
    for agent in spc-pm spc-architect spc-designer spc-developer spc-qa spc-writer; do
        if [ -f "$SCRIPT_DIR/agents/$agent.md" ]; then
            cp "$SCRIPT_DIR/agents/$agent.md" "$AGENTS_DIR/"
        fi
    done
fi

# Copy spc-claude.md (always)
if [ -f "$SCRIPT_DIR/spc-claude.md" ]; then
    echo -e "${BLUE}Installing SPC configuration...${NC}"
    cp "$SCRIPT_DIR/spc-claude.md" "$CLAUDE_DIR/"
fi

# Copy protocols folder to plugins/spc
SPC_PLUGIN_DIR="$CLAUDE_DIR/plugins/spc"
if [ -d "$SCRIPT_DIR/protocols" ]; then
    echo -e "${BLUE}Installing SPC protocols...${NC}"
    mkdir -p "$SPC_PLUGIN_DIR"
    cp -r "$SCRIPT_DIR/protocols" "$SPC_PLUGIN_DIR/"
fi

# ============================================================
# VERIFICATION
# ============================================================
SPC_COMMANDS=$(ls -1 "$COMMANDS_DIR"/spc*.md 2>/dev/null | wc -l | tr -d ' ')
SPC_CORE_AGENTS=$(ls -1 "$AGENTS_DIR"/spc-{pm,architect,designer,developer,qa,writer}.md 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
if [ "$INSTALL_MODE" = "full" ]; then
    echo -e "${GREEN}║  SPC AI Team (Full) installed successfully!            ║${NC}"
else
    echo -e "${GREEN}║  SPC AI Team (Add-on) installed successfully!          ║${NC}"
fi
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$INSTALL_MODE" = "full" ]; then
    SISYPHUS_COMMANDS=$(ls -1 "$COMMANDS_DIR"/{sisyphus,ultrawork,deepsearch,analyze,plan,review,prometheus,orchestrator,ralph-loop,cancel-ralph,update,simplify,sisyphus-default}.md 2>/dev/null | wc -l | tr -d ' ')
    SPC_TEAM_AGENTS=$(ls -1 "$AGENTS_DIR"/spc-team-*.md 2>/dev/null | wc -l | tr -d ' ')

    echo -e "  ${BLUE}Installed:${NC}"
    echo "    Commands: $SPC_COMMANDS SPC + $SISYPHUS_COMMANDS Sisyphus"
    echo "    Agents: $SPC_CORE_AGENTS SPC core + $SPC_TEAM_AGENTS Sisyphus team"
else
    echo -e "  ${BLUE}Installed:${NC}"
    echo "    Commands: $SPC_COMMANDS SPC commands"
    echo "    Agents: $SPC_CORE_AGENTS SPC core agents"
    echo ""
    echo -e "  ${CYAN}Note:${NC} Using existing Sisyphus installation"
    echo "    Sisyphus commands (/sisyphus, /ultrawork, etc.) preserved"
fi

# ============================================================
# PERMISSION CONFIGURATION (Optional)
# ============================================================
SETTINGS_FILE="$CLAUDE_DIR/settings.json"

echo ""
echo -e "${CYAN}┌────────────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│  Permission Configuration (Optional)                   │${NC}"
echo -e "${CYAN}└────────────────────────────────────────────────────────┘${NC}"
echo ""
echo "SPC AI Team works best with pre-approved permissions for:"
echo "  - npm/yarn/pnpm commands (install, build, test, dev)"
echo "  - git operations"
echo "  - build and development tools"
echo ""
read -p "Configure recommended permissions? (y/N): " CONFIGURE_PERMS

if [[ "$CONFIGURE_PERMS" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Configuring permissions...${NC}"

    # Create settings.json if it doesn't exist
    if [ ! -f "$SETTINGS_FILE" ]; then
        echo '{}' > "$SETTINGS_FILE"
    fi

    # Backup existing settings
    cp "$SETTINGS_FILE" "$SETTINGS_FILE.backup-$(date +%Y%m%d-%H%M%S)"

    # Use Python to merge permissions (more reliable than jq for complex operations)
    python3 << EOF
import json
import os

settings_file = "$SETTINGS_FILE"
new_perms = [
    # File exploration (read-only)
    "Bash(list files and directories)",
    "Bash(read file contents)",
    "Bash(search file contents)",
    "Bash(find files)",

    # Development tools
    "Bash(install dependencies)",
    "Bash(run tests)",
    "Bash(build the project)",
    "Bash(run development server)",
    "Bash(run linters and formatters)",
    "Bash(run node scripts)",
    "Bash(run python scripts)",
    "Bash(python package management)",
    "Bash(run npx commands)",
    "Bash(run tsx scripts)",

    # Git
    "Bash(git operations)",

    # System info (read-only)
    "Bash(check system info)",
    "Bash(environment variables)",
    "Bash(manage processes)",
    "Bash(check ports)",

    # Network (read-only)
    "Bash(fetch URLs)",
    "Bash(network diagnostics)",

    # Docker
    "Bash(docker operations)",

    # Database
    "Bash(database migrations)"
]

# Read existing settings
try:
    with open(settings_file, 'r') as f:
        settings = json.load(f)
except (json.JSONDecodeError, FileNotFoundError):
    settings = {}

# Initialize permissions structure
if 'permissions' not in settings:
    settings['permissions'] = {}
if 'allow' not in settings['permissions']:
    settings['permissions']['allow'] = []

# Add new permissions (avoid duplicates)
existing = set(settings['permissions']['allow'])
for perm in new_perms:
    if perm not in existing:
        settings['permissions']['allow'].append(perm)

# Write back
with open(settings_file, 'w') as f:
    json.dump(settings, f, indent=2)

print(f"Added {len(new_perms)} recommended permissions")
EOF

    echo -e "${GREEN}  Permissions configured successfully!${NC}"
    echo "  Backup saved to: $SETTINGS_FILE.backup-*"
else
    echo ""
    echo -e "${YELLOW}Skipping permission configuration.${NC}"
    echo "You can configure permissions manually in ~/.claude/settings.json"
    echo "or run: claude /permissions"
fi

echo ""
echo -e "${GREEN}Quick Start:${NC}"
echo "  /spc \"your request\"        - Full AI team workflow"
echo "  /spc:pm \"analyze this\"     - Invoke PM directly"
echo "  /spc:status                - Check project status"
if [ "$INSTALL_MODE" = "full" ]; then
    echo "  /sisyphus \"your task\"      - Multi-agent orchestration"
    echo "  /ultrawork \"your task\"     - Maximum performance mode"
fi
echo ""
