# SPC AI Team

> **AI Team Simulation for Solo Founders** | **솔로 파운더를 위한 AI 팀 시뮬레이션**

SPC AI Team is a Claude Code plugin that gives solo founders a 6-person AI expert team for building products from idea to delivery. Works standalone or as an add-on to [Oh-My-Claude-Sisyphus](https://github.com/Yeachan-Heo/oh-my-claude-sisyphus).

SPC AI Team은 Claude Code 플러그인으로, 솔로 파운더가 6명의 AI 전문가 팀과 협업하여 아이디어부터 배포까지 제품을 만들 수 있게 해줍니다.

## Features

- **6 Specialized SPC Agents** - PM, Architect, Designer, Developer, QA, Writer
- **Smart Installation** - Auto-detects existing Sisyphus and adapts accordingly
- **BMAD Workflow** - Structured product development process
- **CLI Native** - Works directly in Claude Code
- **Auto Documentation** - PRDs, specs, test reports generated automatically

## Quick Start

### One-liner Install (Recommended)

```bash
# Option 1: curl (no dependencies)
curl -fsSL https://raw.githubusercontent.com/sungmancho/spc-ai-team/main/install-remote.sh | sh

# Option 2: npx (requires Node.js)
npx spc-ai-team

# Option 3: npm global install
npm install -g spc-ai-team && spc-ai-team
```

### Manual Install

```bash
git clone https://github.com/sungmancho/spc-ai-team.git
cd spc-ai-team && ./install.sh
```

### Start Using

```bash
# In Claude Code
/spc "Add a login feature with email and password"
```

**New to SPC?** Read the [Getting Started Guide](./docs/GETTING_STARTED.md)

## Smart Installation

The installer automatically detects your environment and adapts:

```
┌─────────────────────────────────────────────────────────────┐
│                    ./install.sh                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Sisyphus detected?                                         │
│  ┌────────────┐              ┌────────────┐                │
│  │     No     │              │    Yes     │                │
│  └─────┬──────┘              └─────┬──────┘                │
│        ↓                           ↓                        │
│  ┌────────────────┐        ┌────────────────┐              │
│  │  Full Install  │        │  Add-on Only   │              │
│  │ • SPC agents   │        │ • SPC agents   │              │
│  │ • SPC commands │        │ • SPC commands │              │
│  │ • Sisyphus     │        │ (Sisyphus kept)│              │
│  │   commands     │        │                │              │
│  └────────────────┘        └────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Installation Scenarios

| Scenario | What Gets Installed | Commands Available |
|----------|--------------------|--------------------|
| **New user** | Full package (SPC + Sisyphus) | `/spc`, `/sisyphus`, `/ultrawork`, etc. |
| **Existing Sisyphus user** | SPC only (add-on) | `/spc` + existing Sisyphus commands |

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](./docs/GETTING_STARTED.md) | Installation and first steps |
| [Example Workflow](./docs/EXAMPLE_WORKFLOW.md) | Complete worked example |
| [FAQ](./docs/FAQ.md) | Common questions and troubleshooting |

## Usage

### Full Team Workflow

Let PM analyze and orchestrate the team:

```
/spc "Build a todo list with CRUD operations"
```

### Individual SPC Agents

Invoke specific agents directly:

```
/spc:pm "Analyze requirements for auth system"
/spc:architect "Design API for blog platform"
/spc:designer "Create wireframes for dashboard"
/spc:dev "Implement the login component"
/spc:qa "Test the checkout flow"
/spc:writer "Document the REST API"
```

### Sisyphus Orchestration (if installed)

Use powerful orchestration commands:

```
/sisyphus "Refactor the authentication module"
/ultrawork "Build the entire API layer"
/plan "Design a notification system"
```

### Utility Commands

```
/spc:status     # Check project status
/spc:artifacts  # List generated documents
```

## The AI Team

### SPC Core Team

| Agent | Emoji | Model | Specialty |
|-------|-------|-------|-----------|
| **PM** | 🧑‍💼 | Opus | Requirements, PRD, team orchestration |
| **Architect** | 🏗️ | Opus | Tech stack, API design, DB schema |
| **Designer** | 🎨 | Sonnet | UI/UX, wireframes, design system |
| **Developer** | 💻 | Sonnet | Code implementation, migrations |
| **QA** | 🧪 | Sonnet | Testing, quality validation |
| **Writer** | 📝 | Sonnet | Documentation, README, API docs |

### Sisyphus Specialist Agents (Full Install)

| Agent | Model | Purpose |
|-------|-------|---------|
| **Oracle** | Opus | Architecture & debugging |
| **Prometheus** | Opus | Strategic planning |
| **Momus** | Opus | Plan review & criticism |
| **Librarian** | Sonnet | Documentation research |
| **Explore** | Haiku | Fast codebase search |

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

## Project Structure

```
spc-ai-team/
├── install.sh          # Smart installation script
├── uninstall.sh        # Clean uninstallation
├── commands/           # Slash commands
│   ├── spc.md          # /spc (main)
│   ├── spc-pm.md       # /spc:pm
│   └── ...
├── agents/             # Agent definitions
│   ├── spc-pm.md
│   ├── spc-architect.md
│   └── ...
├── docs/
│   ├── GETTING_STARTED.md
│   ├── EXAMPLE_WORKFLOW.md
│   └── FAQ.md
├── spc-claude.md       # CLAUDE.md integration
└── README.md
```

## Requirements

- **Claude Code CLI** (required)
- **Oh-My-Claude-Sisyphus** (optional, for full orchestration features)

## Installation

### Method 1: One-liner (Recommended)

```bash
# curl (works on any system with curl/wget)
curl -fsSL https://raw.githubusercontent.com/sungmancho/spc-ai-team/main/install-remote.sh | sh

# Or use npm/npx if you have Node.js
npx spc-ai-team
```

### Method 2: npm Global Install

```bash
npm install -g spc-ai-team
spc-ai-team
```

### Method 3: Manual Install

```bash
git clone https://github.com/sungmancho/spc-ai-team.git
cd spc-ai-team
./install.sh
```

### With Sisyphus (Full Features)

For the full experience with advanced orchestration, install Sisyphus first:

```bash
# 1. Install Sisyphus
git clone https://github.com/Yeachan-Heo/oh-my-claude-sisyphus.git
cd oh-my-claude-sisyphus && ./install.sh

# 2. Install SPC (auto-detects Sisyphus, installs as add-on)
curl -fsSL https://raw.githubusercontent.com/sungmancho/spc-ai-team/main/install-remote.sh | sh
```

### Verify Installation

```bash
# SPC commands (always installed)
ls ~/.claude/commands/spc*.md  # Should show 9 files

# SPC agents (always installed)
ls ~/.claude/agents/spc-{pm,architect,designer,developer,qa,writer}.md
```

## Uninstall

```bash
./uninstall.sh
```

- Only removes SPC components
- Preserves existing Sisyphus installation (if add-on mode)
- Backups kept in `~/.claude/backup/`

## Related Projects

- [Oh-My-Claude-Sisyphus](https://github.com/Yeachan-Heo/oh-my-claude-sisyphus) - Multi-agent orchestration system
- [BMAD](https://github.com/aj-geddes/claude-code-bmad-skills) - Build-Measure-Analyze-Decide methodology

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Vision**: Enable solo founders to build products with the efficiency of a full team through AI-powered collaboration.

**비전**: AI 협업을 통해 솔로 파운더가 완전한 팀의 효율성으로 제품을 만들 수 있게 합니다.
