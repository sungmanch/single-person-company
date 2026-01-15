# Getting Started with SPC AI Team

> Transform from solo founder to full-team productivity in 5 minutes

## What is SPC AI Team?

SPC (Single Person Company) AI Team is a Claude Code plugin that gives you a **17-agent AI development team** at your fingertips. Each agent specializes in a different role, working together to build products from idea to delivery.

```
Your Request → PM → Architect + Designer → Developer → QA → Writer → Complete Product
```

**What you get:**
- 6 core SPC agents (PM, Architect, Designer, Developer, QA, Writer)
- 11 internal delegation agents for specialized tasks
- 9 slash commands for team orchestration

## Prerequisites

Before installing SPC AI Team, ensure you have:

1. **Claude Code CLI** installed and configured
   - [Installation Guide](https://docs.anthropic.com/claude-code)
   - Verify: `claude --version`

2. **Git** for cloning the repository
   - Verify: `git --version`

## Installation

### Option 1: Quick Install (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/spc-ai-team.git

# Navigate to directory
cd spc-ai-team

# Make install script executable
chmod +x install.sh

# Run installer
./install.sh
```

You should see:
```
Installing SPC AI Team Plugin...
  Location: ~/.claude/plugins/spc-ai-team/
  Installed:
    Agents: 17
    Commands: 9
  Auto-registered in settings.json
```

### Option 2: Manual Install

1. **Create plugin directory:**
   ```bash
   mkdir -p ~/.claude/plugins/spc-ai-team
   ```

2. **Copy plugin contents:**
   ```bash
   cp -r .claude-plugin agents commands protocols skills hooks README.md ~/.claude/plugins/spc-ai-team/
   ```

3. **Register plugin in settings.json:**
   Add to `~/.claude/settings.json`:
   ```json
   {
     "enabledPlugins": {
       "spc-ai-team@local": true
     }
   }
   ```

### Verify Installation

After installation, verify the plugin is available:

```bash
# Check plugin directory exists
ls ~/.claude/plugins/spc-ai-team/
# Should show: agents, commands, protocols, skills, etc.

# Check agents
ls ~/.claude/plugins/spc-ai-team/agents/
# Should show 17 agent files

# Check commands
ls ~/.claude/plugins/spc-ai-team/commands/
# Should show 9 SPC command files

# Check plugin registration
grep "spc-ai-team" ~/.claude/settings.json
# Should show plugin is enabled
```

## Your First Command

### 1. Start Claude Code

Open your terminal and start Claude Code in your project directory:

```bash
cd your-project
claude
```

### 2. Use the Full Team

Invoke the complete SPC team with a simple request:

```
/spc "Add a contact form with email validation"
```

**What happens:**
1. **PM** analyzes your request and creates a PRD
2. **Architect** designs the technical solution
3. **Designer** creates UI specifications (in parallel with Architect)
4. **Developer** implements the code
5. **QA** tests and validates
6. **Writer** documents the feature

### 3. Watch the Magic

You'll see emoji-prefixed updates as each agent works:

```
🧑‍💼 PM: Analyzing request and creating PRD...
🏗️ Architect: Designing technical architecture...
🎨 Designer: Creating UI specifications...
💻 Developer: Implementing feature...
🧪 QA: Running tests and validation...
📝 Writer: Updating documentation...
```

## Understanding the AI Team

### The 6 Core SPC Agents

| Agent | Emoji | Specialty | Model |
|-------|-------|-----------|-------|
| **PM** | 🧑‍💼 | Requirements analysis, PRD creation, team coordination | Opus |
| **Architect** | 🏗️ | Tech stack, API design, database schema | Opus |
| **Designer** | 🎨 | UI/UX, wireframes, design system | Sonnet |
| **Developer** | 💻 | Code implementation, migrations | Sonnet |
| **QA** | 🧪 | Testing, quality validation, bug tracking | Sonnet |
| **Writer** | 📝 | Documentation, README, API docs | Sonnet |

### The 11 Internal Delegation Agents

| Agent | Specialty | Model |
|-------|-----------|-------|
| **Oracle** | Architecture & debugging | Opus |
| **Prometheus** | Strategic planning | Opus |
| **Momus** | Plan review & criticism | Opus |
| **Metis** | Pre-planning analysis | Opus |
| **Orchestrator** | Task coordination | Opus |
| **Sisyphus-Junior** | Focused execution | Opus |
| **Librarian** | Documentation research | Opus |
| **Frontend-Engineer** | UI/UX implementation | Opus |
| **Multimodal-Looker** | Visual analysis | Opus |
| **Explore** | Fast codebase search | Haiku |
| **Document-Writer** | Technical writing | Haiku |

### When to Use Each Agent Directly

Sometimes you don't need the full team. Use individual agents for focused tasks:

```
/spc:pm "Analyze requirements for user authentication"
/spc:architect "Design the API for a blog system"
/spc:designer "Create wireframes for a dashboard"
/spc:dev "Implement the login form component"
/spc:qa "Test the checkout flow"
/spc:writer "Write API documentation for endpoints"
```

### Utility Commands

```
/spc:status     # Check current project status
/spc:artifacts  # List all generated documents
```

### Project Status Commands

```
/spc:status     # Check current project status and artifacts
/spc:artifacts  # List all generated documents in .spc/
```

## Generated Artifacts

SPC AI Team creates a `.spc/` directory in your project root with organized artifacts:

```
.spc/
├── docs/
│   ├── prd/                  # Product Requirements Documents
│   │   └── contact-form.md
│   ├── architecture/         # Technical Architecture Specs
│   │   └── contact-form.md
│   └── design/               # UI/UX Design Specs
│       └── contact-form.md
├── stories/                  # Development Stories
│   └── cf-001.md
├── qa-reports/               # Test Results
│   └── contact-form.md
└── handoffs/                 # Agent Handoff Records
    ├── handoff-1.yaml
    └── handoff-2.yaml

```

### What Each Artifact Contains

| Artifact | Contents |
|----------|----------|
| **PRD** | Problem statement, goals, acceptance criteria, user stories |
| **Architecture** | Tech stack, API endpoints, database schema, sequence diagrams |
| **Design** | Component specs, wireframes, style guide references |
| **Stories** | Implementation tasks, technical details, dependencies |
| **QA Reports** | Test results, bug findings, validation checklist |
| **Handoffs** | Context passed between agents |

## Tips for Best Results

### 1. Be Specific

```
# Good - clear and specific
/spc "Add a login form with email/password, remember me checkbox, and forgot password link"

# Less effective - too vague
/spc "Add login"
```

### 2. Provide Context

```
# Good - includes context
/spc "Add dark mode toggle to the existing settings page, using our Tailwind CSS setup"

# Less effective - no context
/spc "Add dark mode"
```

### 3. Break Down Large Features

For complex features, consider breaking them into smaller requests:

```
# Instead of one massive request:
/spc "Build complete e-commerce system"

# Break it down:
/spc "Add product catalog with categories and search"
/spc "Add shopping cart with quantity management"
/spc "Add checkout flow with payment integration"
```

### 4. Review and Iterate

After completion, review the generated artifacts and code. You can:
- Ask for clarifications
- Request modifications
- Re-run specific agents

## Common Workflows

### New Feature Development
```
/spc "Add [feature description]"
```

### Technical Design Only
```
/spc:architect "Design [system/API/database]"
```

### Documentation Catch-up
```
/spc:writer "Document the existing [feature/API/component]"
```

### Quality Check
```
/spc:qa "Validate [feature] meets acceptance criteria"
```

## Troubleshooting

### "Command not found" after installation

1. Verify files exist:
   ```bash
   ls ~/.claude/commands/spc*.md
   ```

2. Restart Claude Code session

3. Check Claude Code is properly configured

### Agents not completing tasks

1. Check if `.spc/` directory exists in your project
2. Ensure you have write permissions
3. Try a simpler request first to verify setup

### Want to start fresh?

Remove the `.spc/` directory to clear all artifacts:
```bash
rm -rf .spc/
```

## Uninstallation

If you need to remove SPC AI Team:

```bash
cd spc-ai-team
./uninstall.sh
```

Backup files are preserved in `~/.claude/backup/`.

## Next Steps

1. **Read the [Example Workflow](./EXAMPLE_WORKFLOW.md)** - See a complete worked example
2. **Check the [FAQ](./FAQ.md)** - Common questions answered
3. **Explore agent docs** in the `agents/` directory for detailed capabilities

---

**Ready to build?** Start with:
```
/spc "Add a simple hello world feature to test the setup"
```

Welcome to your new AI team! 🚀
