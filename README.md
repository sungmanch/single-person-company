# SPC AI Team

> **AI Team Simulation for Solo Founders**

SPC (Single Person Company) AI Team is a Claude Code plugin that gives solo founders a **17-agent AI development team** for building products from idea to delivery.

## Features

- **17 Specialized Agents** - 6 core team + 11 internal delegation agents
- **Simple Installation** - Direct copy to ~/.claude/commands/ and agents/
- **BMAD Workflow** - Structured product development process
- **CLI Native** - Works directly in Claude Code
- **Auto Documentation** - PRDs, specs, test reports generated automatically

## Quick Start

### Installation

**One-liner (Recommended)**

```bash
curl -fsSL https://raw.githubusercontent.com/sungmanch/single-person-company/main/install-remote.sh | bash
```

**Or clone and install**

```bash
git clone https://github.com/sungmanch/single-person-company.git
cd spc-ai-team
./install.sh
```

You should see:
```
╔════════════════════════════════════════════════════════╗
║  SPC AI Team installed successfully!                   ║
╚════════════════════════════════════════════════════════╝

  Installed:
    Commands: 9 → ~/.claude/commands/
    Agents:   17 → ~/.claude/agents/
```

### Start Using

```bash
# Start a new Claude Code session
claude

# Use the full team
/spc "Add a login feature with email and password"
```

## Usage

### Full Team Workflow

When you run `/spc "your request"`, here's what happens:

1. **Meet Alex 🧑‍💼 (PM):** The Product Manager will interview you about your request
2. **Clarification:** Answer 2-4 questions to help Alex understand your needs
3. **PRD Creation:** Alex creates a comprehensive Product Requirements Document
4. **Team Activation:** Alex orchestrates the team:
   - 🏗️ Architect designs technical architecture
   - 🎨 Designer creates UI/UX specs
   - 💻 Developer implements the feature
   - 🧪 QA tests everything
   - 📝 Writer documents the result
5. **Delivery:** Your complete feature is delivered with tests and docs

All artifacts are saved in `.spc/` directory for your review.

#### Example Session

```
You: /spc "Build a todo list with CRUD operations"

Alex (PM): Hi! I'm Alex 🧑‍💼, your PM. I see you want to build a todo list.
           Before I create the PRD, let me ask a few questions...

[Interactive questions appear with options to select]

You: [Answer questions]

Alex: Perfect! Creating PRD and kicking off the team...
      [Creates PRD, spawns Architect & Designer in parallel]
      [Developer implements after specs ready]
      [QA tests, Writer documents]

Alex: ✅ Todo list complete! All tests passing, docs updated.
```

### Individual Agents

Invoke specific agents directly:

```
/spc-pm "Analyze requirements for auth system"
/spc-architect "Design API for blog platform"
/spc-designer "Create wireframes for dashboard"
/spc-dev "Implement the login component"
/spc-qa "Test the checkout flow"
/spc-writer "Document the REST API"
```

### Utility Commands

```
/spc-status     # Check project status
/spc-artifacts  # List generated documents
```

## The AI Team

### Core Team (6 agents)

| Agent | Emoji | Model | Specialty |
|-------|-------|-------|-----------|
| **PM** | 🧑‍💼 | Opus | Requirements, PRD, team orchestration |
| **Architect** | 🏗️ | Opus | Tech stack, API design, DB schema |
| **Designer** | 🎨 | Opus | UI/UX, wireframes, design system |
| **Developer** | 💻 | Opus | Code implementation, migrations |
| **QA** | 🧪 | Opus | Testing, quality validation |
| **Writer** | 📝 | Opus | Documentation, README, API docs |

### Internal Delegation Agents (11 agents)

| Agent | Model | Purpose |
|-------|-------|---------|
| **Oracle** | Opus | Architecture & debugging |
| **Prometheus** | Opus | Strategic planning |
| **Momus** | Opus | Plan review & criticism |
| **Metis** | Opus | Pre-planning analysis |
| **Orchestrator** | Opus | Task coordination |
| **SPC-Sisyphus-Junior** | Opus | Focused execution |
| **Librarian** | Opus | Documentation research |
| **Frontend-Engineer** | Opus | UI/UX implementation |
| **Multimodal-Looker** | Opus | Visual analysis |
| **Explore** | Haiku | Fast codebase search |
| **Document-Writer** | Haiku | Technical writing |

## Workflow

```
User Request
     ↓
🧑‍💼 PM → Requirements Analysis → PRD
     ↓
  ┌──┴──┐ (parallel)
  ↓     ↓
🏗️ Arch  🎨 Designer
  └──┬──┘
     ↓
💻 Developer → Implementation
     ↓
🧪 QA → Testing & Validation
     ↓
📝 Writer → Documentation
     ↓
✅ Complete!
```

## Generated Artifacts

SPC creates a `.spc/` directory in your project:

```
.spc/
├── docs/
│   ├── prd/           # PRD documents
│   ├── architecture/  # Technical specs
│   └── design/        # Design specs
├── stories/           # Development stories
├── qa-reports/        # Test reports
└── handoffs/          # Agent handoff records
```

## Installation Details

### What Gets Installed

```
~/.claude/
├── commands/             # 9 slash commands
│   ├── spc.md
│   ├── spc-pm.md
│   ├── spc-architect.md
│   └── ...
└── agents/               # 17 agent definitions
    ├── spc-pm.md
    ├── spc-architect.md
    └── ...
```

### Verify Installation

```bash
# Check commands (should show 9 spc files)
ls ~/.claude/commands/spc*.md

# Check agents (should show 17 spc files)
ls ~/.claude/agents/spc-*.md
```

### Manual Installation

If the installer doesn't work, you can install manually:

```bash
# 1. Clone repository
git clone https://github.com/sungmanch/single-person-company.git
cd single-person-company

# 2. Copy commands and agents
cp commands/*.md ~/.claude/commands/
cp agents/*.md ~/.claude/agents/
```

## Uninstall

```bash
# Remove SPC commands
rm ~/.claude/commands/spc*.md

# Remove SPC agents
rm ~/.claude/agents/spc-*.md
```

## Requirements

- **Claude Code CLI** (required)
- Claude Code subscription with access to Opus model

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](./docs/GETTING_STARTED.md) | Installation and first steps |
| [Example Workflow](./docs/EXAMPLE_WORKFLOW.md) | Complete worked example |
| [FAQ](./docs/FAQ.md) | Common questions and troubleshooting |

## Project Structure

```
spc-ai-team/
├── install.sh              # Local installation script
├── install-remote.sh       # Remote installation (curl)
├── uninstall.sh            # Clean uninstallation
├── .claude-plugin/
│   └── plugin.json         # Plugin metadata
├── commands/               # Slash commands (9 files)
│   ├── spc.md              # /spc (main)
│   ├── spc-pm.md           # /spc:pm
│   ├── spc-architect.md    # /spc:architect
│   ├── spc-designer.md     # /spc:designer
│   ├── spc-dev.md          # /spc:dev
│   ├── spc-qa.md           # /spc:qa
│   ├── spc-writer.md       # /spc:writer
│   ├── spc-status.md       # /spc:status
│   └── spc-artifacts.md    # /spc:artifacts
├── agents/                 # Agent definitions (17 files)
│   ├── spc-pm.md
│   ├── spc-architect.md
│   ├── spc-designer.md
│   ├── spc-developer.md
│   ├── spc-qa.md
│   ├── spc-writer.md
│   ├── spc-oracle.md
│   ├── spc-prometheus.md
│   ├── spc-momus.md
│   ├── spc-metis.md
│   ├── spc-orchestrator.md
│   ├── spc-sisyphus-junior.md
│   ├── spc-librarian.md
│   ├── spc-frontend-engineer.md
│   ├── spc-multimodal-looker.md
│   ├── spc-explore.md
│   └── spc-document-writer.md
├── protocols/
├── skills/
├── hooks/
├── docs/
│   ├── GETTING_STARTED.md
│   ├── EXAMPLE_WORKFLOW.md
│   └── FAQ.md
├── spc-claude.md           # CLAUDE.md integration
└── README.md
```

## Acknowledgments

This project was created with inspiration from these excellent projects:

- **[oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)** - Original multi-agent framework for Claude Code
- **[Oh-My-Claude-Sisyphus](https://github.com/Yeachan-Heo/oh-my-claude-sisyphus)** - Multi-agent orchestration system
- **[BMAD](https://github.com/aj-geddes/claude-code-bmad-skills)** - Build-Measure-Analyze-Decide methodology

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Vision**: Enable solo founders to build products with the efficiency of a full team through AI-powered collaboration.
