# Getting Started with SPC AI Team + Sisyphus

> Transform from solo founder to full-team productivity in 5 minutes

## What is SPC AI Team?

SPC (Single Person Company) AI Team is a Claude Code plugin that gives you a **6-person AI development team** plus **11 Sisyphus specialist agents** at your fingertips. Each agent specializes in a different role, working together to build products from idea to delivery.

```
Your Request → PM → Architect + Designer → Developer → QA → Writer → Complete Product
```

**Now with full Sisyphus integration:**
- Multi-agent orchestration commands (`/sisyphus`, `/ultrawork`)
- Strategic planning (`/plan`, `/prometheus`)
- Critical review (`/review`)
- 11 specialist agents for deep work

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
Installing SPC AI Team with Sisyphus Integration...
Installing commands...
Installing agents...
SPC AI Team + Sisyphus installed successfully!
  Commands: 22 files
    - SPC commands: 9
    - Sisyphus commands: 13
  Agents: 17 files
    - SPC core agents: 6
    - Sisyphus team agents: 11
```

### Option 2: Manual Install

1. **Copy commands** to `~/.claude/commands/`
   ```bash
   cp commands/*.md ~/.claude/commands/
   ```

2. **Copy agents** to `~/.claude/agents/`
   ```bash
   cp agents/*.md ~/.claude/agents/
   ```

3. **(Optional)** Add configuration to `~/.claude/CLAUDE.md`
   - Copy contents from `spc-claude.md` to your CLAUDE.md file

### Verify Installation

After installation, verify the commands are available:

```bash
ls ~/.claude/commands/spc*.md
# Should show 9 files

ls ~/.claude/commands/{sisyphus,ultrawork,plan,review,prometheus,orchestrator,ralph-loop,cancel-ralph,update,simplify,sisyphus-default,deepsearch,analyze}.md
# Should show 13 files

ls ~/.claude/agents/spc-{pm,architect,designer,developer,qa,writer}.md
# Should show 6 core agents

ls ~/.claude/agents/spc-team-*.md
# Should show 11 team agents
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

### The 11 Sisyphus Specialist Agents

| Agent | Specialty | Model |
|-------|-----------|-------|
| **Oracle** | Architecture & debugging | Opus |
| **Prometheus** | Strategic planning | Opus |
| **Momus** | Plan review & criticism | Opus |
| **Metis** | Pre-planning analysis | Opus |
| **Orchestrator** | Task coordination | Sonnet |
| **Sisyphus-Junior** | Focused execution | Sonnet |
| **Librarian** | Documentation research | Sonnet |
| **Frontend-Engineer** | UI/UX implementation | Sonnet |
| **Explore** | Fast codebase search | Haiku |
| **Document-Writer** | Technical writing | Haiku |
| **Multimodal-Looker** | Visual analysis | Sonnet |

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

### Sisyphus Orchestration Commands

For more powerful orchestration:

```
/sisyphus "Refactor the authentication module"  # Multi-agent orchestration
/ultrawork "Build the entire API layer"          # Maximum performance mode
/plan "Design a notification system"             # Strategic planning
/review .sisyphus/plans/notification.md          # Critical plan review
/deepsearch "error handling"                     # Thorough codebase search
/analyze "performance issues"                    # Deep analysis
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

.sisyphus/                    # Sisyphus artifacts
├── plans/                    # Strategic work plans
├── drafts/                   # Plan drafts
└── notepads/                 # Learning records
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
