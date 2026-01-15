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
echo -e "${GREEN}║       SPC AI Team - Remote Installer v3.0             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
REPO="sungmanch/single-person-company"
BRANCH="main"
TMP_DIR=$(mktemp -d)
DOWNLOAD_URL="https://github.com/$REPO/archive/refs/heads/$BRANCH.tar.gz"

# Cleanup function
cleanup() {
    rm -rf "$TMP_DIR"
}
trap cleanup EXIT

# Check dependencies
check_dependency() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}Error: $1 is required but not installed.${NC}"
        exit 1
    fi
}

echo -e "${BLUE}Checking dependencies...${NC}"
check_dependency "curl"
check_dependency "tar"

# Download
echo -e "${BLUE}Downloading SPC AI Team...${NC}"
curl -fsSL "$DOWNLOAD_URL" -o "$TMP_DIR/spc-ai-team.tar.gz"

# Extract
echo -e "${BLUE}Extracting...${NC}"
tar -xzf "$TMP_DIR/spc-ai-team.tar.gz" -C "$TMP_DIR"

# Find extracted directory (handles branch name in folder)
EXTRACTED_DIR=$(find "$TMP_DIR" -maxdepth 1 -type d -name "single-person-company*" | head -1)

if [ -z "$EXTRACTED_DIR" ]; then
    echo -e "${RED}Error: Failed to extract archive${NC}"
    exit 1
fi

# Run installer
echo -e "${BLUE}Running installer...${NC}"
echo ""
cd "$EXTRACTED_DIR"
chmod +x install.sh
./install.sh

echo ""
echo -e "${GREEN}Installation complete!${NC}"
echo -e "${CYAN}Start a new Claude Code session to use the plugin.${NC}"
