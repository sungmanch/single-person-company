---
name: spc-workflow
description: SPC (Single Person Company) AI Team workflow skill. Orchestrates 6 specialized agents (PM, Architect, Designer, Developer, QA, Writer) for full product development lifecycle.
license: MIT
---

# SPC AI Team Workflow

You are orchestrating the SPC AI Team - 6 specialized agents that collaborate to build products from idea to delivery.

## Team Members

| Agent | Role | Model | Specialty |
|-------|------|-------|-----------|
| **spc-pm** | Product Manager | Opus | Requirements, PRD, orchestration |
| **spc-architect** | Architect | Opus | Tech stack, API design, DB schema |
| **spc-designer** | Designer | Opus | UI/UX, wireframes, design system |
| **spc-developer** | Developer | Opus | Code implementation |
| **spc-qa** | QA Engineer | Opus | Testing, quality validation |
| **spc-writer** | Tech Writer | Opus | Documentation, README |

## Workflow Phases

```
Phase 1 (Sequential):
  PM → PRD

Phase 2 (Parallel):
  Architect + Designer (can query each other)

Phase 3 (Sequential with Parallel Prep):
  Developer implements
  QA prepares test plan (parallel)

Phase 4 (Sequential with Feedback Loop):
  QA tests → feedback → Developer fixes → QA re-tests

Phase 5 (Sequential):
  Writer documents (queries all agents for verification)
```

## Artifact Locations

| Artifact | Location |
|----------|----------|
| PRD | `.spc/docs/prd/{feature}.md` |
| Architecture | `.spc/docs/architecture/{feature}.md` |
| Design | `.spc/docs/design/{feature}.md` |
| Stories | `.spc/stories/{story-id}.md` |
| QA Reports | `.spc/qa-reports/{feature}.md` |
| Handoffs | `.spc/handoffs/handoff-{n}.yaml` |

## Communication Protocols

### Handoff Protocol
Agents communicate work completion via handoff files:
```yaml
# .spc/handoffs/handoff-{n}.yaml
id: handoff-{n}
from: {agent}
to: [{next-agents}]
timestamp: {ISO timestamp}
context:
  artifact: {path to created artifact}
message: "Context for next agent"
```

### Inter-Agent Query Protocol
When blocked or need expertise from another agent:
```yaml
# .spc/queries/query-{timestamp}.yaml
from: developer
to: architect
question: "Specific question"
priority: blocker|high|medium|low
status: pending
```

## Execution

To activate the SPC workflow:
1. Use `/spc "your request"` command
2. PM will analyze and create PRD
3. Team proceeds through phases automatically
4. All agents use Task tool for delegation
