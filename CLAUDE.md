# Single Person Company (SPC) Plugin Development

## Path Warnings

This is a Claude Code plugin development project.

### Development Path vs Installation Path

| Category | Path | Purpose |
|----------|------|---------|
| **Development Path (Source)** | `/Users/sungmancho/projects/single-person-company/` | Edit code here! |
| **Installation Path** | `~/.claude/plugins/spc-ai-team/` | Testing only (do not edit) |

### Do NOT Do This

- Do not directly modify files inside `~/.claude/plugins/`
- Do not edit code inside the installed plugin folder
- Changes in the installation path will be overwritten on next installation

### Correct Development Workflow

1. **Code Editing**: Always edit in this directory (`/Users/sungmancho/projects/single-person-company/`)
2. **Installation**: Run `npm run install:plugin` or the corresponding installation script
3. **Testing**: Test in a new Claude Code session
4. **Repeat**: Go back to step 1

### Before Editing Files

Always verify your current path before editing:
- If it starts with `/Users/sungmancho/projects/single-person-company/` - OK
- If it starts with `~/.claude/` or `/Users/sungmancho/.claude/` - STOP

## Quick Reference

```bash
# Check current path
pwd

# Move to correct development path
cd /Users/sungmancho/projects/single-person-company/
```
