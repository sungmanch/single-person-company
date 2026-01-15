#!/bin/bash
# SPC AI Team Session Start Hook
# This hook runs when a new Claude Code session starts

# Check if .spc directory exists in the current project
if [ -d ".spc" ]; then
    echo "SPC project detected. Available commands:"
    echo "  /spc \"request\" - Full AI team workflow"
    echo "  /spc:status    - Check project status"
    echo "  /spc:artifacts - List all artifacts"
fi

# Always succeed
exit 0
