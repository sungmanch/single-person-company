# PRD: SPC AI Team

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Author** | Sungman Cho + Claude |
| **Date** | 2026-01-14 |
| **Status** | 🟢 CLI Plugin Release |

---

## 1. Problem Statement

Solo founders must perform multiple roles (planning, design, architecture, development, QA) alone, leading to:

- **Context switching cost** - Loss of focus between roles
- **Lack of expertise** - Difficult to cover all areas deeply
- **Quality degradation** - Insufficient verification
- **Burnout risk** - Continuous multitasking

**Goal**: Build an AI collaboration system that enables working like a team, even alone.

---

## 2. Vision & Goals

**Vision**: CLI-based AI team plugin using BMAD methodology where 6 agents collaborate through artifact-driven workflow.

| Goal | Description | Target |
|------|-------------|--------|
| G1 | CLI-first interface | `/spc` as primary entry point |
| G2 | BMAD artifact workflow | Structured deliverables in `.spc/` |
| G3 | Autonomous delegation | PM orchestrates, agents self-delegate |
| G4 | Easy distribution | Git + Shell script installation |

**Non-Goals**: Web UI, External API, CI/CD integration, Multi-project support.

---

## 3. Target Users

**Primary**: Solo Founder / Indie Hacker
- Building products alone
- Technical background
- Using Claude Code CLI
- Focused on web apps

---

## 4. Role Definitions

| Role | Model | Key Outputs |
|------|-------|-------------|
| **PM** | Opus | PRD, user stories, orchestration |
| **Architect** | Opus | System design, API specs, DB schema |
| **Designer** | Sonnet | Wireframes, component specs, design system |
| **Developer** | Sonnet | React/Next.js code, migrations |
| **QA** | Sonnet | Test plans, unit/E2E tests, bug reports |
| **TechWriter** | Sonnet | README, API docs, setup guide |

---

## 5. CLI Commands

| Command | Purpose |
|---------|---------|
| `/spc <request>` | Full team collaboration (PM-first) |
| `/spc:pm` | PM only |
| `/spc:architect` | Architect only |
| `/spc:designer` | Designer only |
| `/spc:dev` | Developer only |
| `/spc:qa` | QA only |
| `/spc:writer` | TechWriter only |
| `/spc:status` | Project status |
| `/spc:artifacts` | List artifacts |

---

## 6. Output Artifacts

```
project/.spc/
├── docs/
│   ├── prd/           # PRD documents
│   ├── architecture/  # Architecture docs
│   └── design/        # Design specs
├── stories/           # Development stories
├── qa-reports/        # Test reports
└── handoffs/          # Handoff records
```

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Installation success | 100% |
| Command execution | Works in Claude Code |
| Artifact generation | Creates .spc/ structure |

---

## 8. Technical Constraints

1. **Sisyphus subagent pattern** - Uses Task tool delegation
2. **Namespace** - Use `.spc/` directory for artifacts
3. **Model tiering** - Opus (PM, Architect), Sonnet (others)
4. **BMAD methodology** - Artifact-driven workflow
5. **No external dependencies** - Pure markdown files

---

## 9. Distribution

### Installation

```bash
git clone https://github.com/yourusername/spc-ai-team.git
cd spc-ai-team
./install.sh
```

### File Locations

- Commands: `~/.claude/commands/spc*.md`
- Agents: `~/.claude/agents/spc-*.md`
- Config: `~/.claude/spc-claude.md`

---

## 10. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-01-13 | Initial draft |
| 0.2 | 2026-01-13 | v2 architecture |
| 0.3 | 2026-01-13 | Phase 1-2 complete |
| 0.4 | 2026-01-13 | Phase 3 complete, CLI-first |
| 1.0 | 2026-01-14 | CLI-only plugin release, remove Web UI |
