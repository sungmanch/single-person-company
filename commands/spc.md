---
description: Activate SPC (Single Person Company) AI Team for full collaboration workflow
---

[SPC TEAM ACTIVATED] 🚀

$ARGUMENTS

## Single Person Company AI Team

You are now orchestrating the SPC AI Team - 6 specialized agents that collaborate to build products from idea to delivery.

### Team Members

| Agent | Role | Model | Specialty |
|-------|------|-------|-----------|
| 🧑‍💼 **spc-pm** | Product Manager | Opus | Requirements, PRD, orchestration |
| 🏗️ **spc-architect** | Architect | Opus | Tech stack, API design, DB schema |
| 🎨 **spc-designer** | Designer | Sonnet | UI/UX, wireframes, design system |
| 💻 **spc-developer** | Developer | Sonnet | Code implementation |
| 🧪 **spc-qa** | QA Engineer | Sonnet | Testing, quality validation |
| 📝 **spc-writer** | Tech Writer | Sonnet | Documentation, README |

### Workflow

```
User Request
     ↓
[🧑‍💼 PM] ←─ clarify ─→ [User]
     ↓
     PRD → .spc/docs/prd/
     ↓
┌────┴────┐ (parallel)
↓         ↓
[🏗️ Architect] ←─ query ─→ [🎨 Designer]
     ↓                           ↓
Tech Spec                   Design Spec
     ↓                           ↓
     └──────────┬────────────────┘
                ↓
[💻 Developer] ←─ query ─→ [Architect/Designer]
     ↓
     Code → src/
     ↓
[🧪 QA] ←─ feedback ─→ [Developer]
     ↓
     Tests → .spc/qa-reports/
     ↓
[📝 Writer] ←─ verify ─→ [All Agents]
     ↓
     Docs → README.md
     ↓
✅ Complete
```

### Execution Instructions

1. **Initialize Project Structure**
   First, ensure `.spc/` directory structure exists:
   ```
   .spc/
   ├── docs/
   │   ├── prd/
   │   ├── architecture/
   │   └── design/
   ├── stories/
   ├── qa-reports/
   ├── handoffs/
   ├── queries/          # NEW: Inter-agent queries
   └── feedback/         # NEW: Feedback files
   ```

2. **Start with PM**
   Invoke the PM agent to analyze the request and create PRD:
   ```
   Task(subagent_type: "spc-pm", prompt: "<user request>")
   ```

3. **Follow Handoff Protocol**
   Each agent writes handoff records to `.spc/handoffs/` before delegating

4. **Parallel Execution**
   Architect and Designer can work in parallel after PRD is ready
   - They can query each other via `.spc/queries/`

5. **Inter-Agent Communication**
   When agents face ambiguity, they can:
   - Query other agents via `.spc/queries/query-{timestamp}.yaml`
   - Send feedback via `.spc/feedback/feedback-{timestamp}.yaml`
   - See: `protocols/inter-agent-query.md` and `protocols/feedback-loop.md`

6. **Sequential Validation**
   QA must verify before Writer documents

7. **Completion Verification**
   - All acceptance criteria met
   - Tests passing
   - Documentation complete

### Artifact Locations

| Artifact | Location |
|----------|----------|
| PRD | `.spc/docs/prd/{feature}.md` |
| Architecture | `.spc/docs/architecture/{feature}.md` |
| Design | `.spc/docs/design/{feature}.md` |
| Stories | `.spc/stories/{story-id}.md` |
| QA Reports | `.spc/qa-reports/{feature}.md` |
| Handoffs | `.spc/handoffs/handoff-{n}.yaml` |
| Queries | `.spc/queries/query-{timestamp}.yaml` |
| Feedback | `.spc/feedback/feedback-{timestamp}.yaml` |

### Communication Protocols

#### Handoff Protocol
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

#### Inter-Agent Query Protocol
When blocked or need expertise from another agent:
```yaml
# .spc/queries/query-{timestamp}.yaml
from: developer
to: architect
question: "Specific question"
options: [possible answers]
priority: blocker|high|medium|low
status: pending
```
See: `protocols/inter-agent-query.md`

#### Feedback Loop Protocol
When QA finds issues or Writer needs verification:
```yaml
# .spc/feedback/feedback-{timestamp}.yaml
type: bug_report|clarification_request
from: qa
to: developer
severity: blocker|major|minor
issue: "Description"
suggested_resolution: "Fix suggestion"
status: open
```
See: `protocols/feedback-loop.md`

### Agent Interaction Rules

| Scenario | Action |
|----------|--------|
| Requirement ambiguity | PM asks user or queries Architect/Designer |
| Technical question | Developer queries Architect |
| Design question | Developer queries Designer |
| Bug found | QA creates feedback for Developer |
| Doc verification | Writer queries relevant agent |
| Blocker | Create query with `priority: blocker` |

### Parallel Execution Optimization

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

### Orchestration Implementation

**CRITICAL**: When this command is invoked, use the **Task tool** to spawn PM with explicit orchestration instructions:

```
Task(
  subagent_type: "spc-pm",
  prompt: "User request: $ARGUMENTS

           You are the Product Manager for the SPC AI Team.

           Begin the SPC workflow:
           1. Analyze request and clarify with user if needed
           2. Create comprehensive PRD
           3. Orchestrate the team using Task tool (see protocols/orchestration-patterns.md)
           4. Monitor completion markers in .spc/markers/
           5. Perform final validation

           IMPORTANT: Use actual Task tool syntax to invoke other agents.
           Reference: protocols/orchestration-patterns.md"
)
```

**Key Points:**
- PM MUST use Task tool to invoke other agents
- Handoffs MUST be created before each agent invocation
- Markers MUST be checked before proceeding to next phase
- See `agents/spc-pm.md` for detailed orchestration steps

### Start Now

Begin by:
1. Creating `.spc/` directory structure (including `queries/`, `feedback/`, `markers/`, `handoffs/`)
2. Invoking the PM agent with Task tool as shown above
3. Following the workflow through to completion
4. Using query/feedback protocols when agents face ambiguity

The boulder rolls until the product is complete. 🪨
