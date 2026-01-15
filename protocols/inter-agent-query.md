# Inter-Agent Query Protocol

This protocol enables SPC agents to directly query other specialist agents when facing decisions that require expertise outside their domain.

## Purpose

Instead of always escalating to the user, agents can now consult each other for domain-specific questions. This reduces bottlenecks and mirrors how real teams collaborate.

## Query File Format

```yaml
# .spc/queries/query-{timestamp}.yaml
id: query-{unique-id}
from: {agent-name}          # pm, architect, designer, developer, qa, writer
to: {target-agent}          # Single agent or list
timestamp: {ISO-8601}
context:
  current_task: "Brief description of what you're working on"
  reference: "{file-path}:{line-range}"  # Optional: specific file reference
question: |
  Clear, specific question that requires the other agent's expertise.
  Include relevant context and constraints.
options:                    # Optional: provide options if applicable
  - "Option A: description"
  - "Option B: description"
priority: blocker|high|medium|low
status: pending|answered|resolved
```

## Consultation Matrix

| Agent | Can Query | For These Topics |
|-------|-----------|------------------|
| PM | architect, designer | Technical/design feasibility of requirements |
| Architect | pm, designer | Requirement clarification, design constraints |
| Designer | pm, architect | Feature scope, technical limitations |
| Developer | architect, designer | Spec ambiguity, implementation decisions |
| QA | developer, pm | Bug severity, requirement interpretation |
| Writer | all agents | Content verification, terminology |

## Query Workflow

### 1. Creating a Query

When an agent encounters a decision outside their expertise:

```yaml
# Example: Developer querying Architect
id: query-20260115-001
from: developer
to: architect
timestamp: 2026-01-15T10:30:00Z
context:
  current_task: "Implementing real-time updates for dashboard"
  reference: ".spc/docs/architecture/dashboard.md:L45-50"
question: |
  The architecture spec mentions "real-time updates" but doesn't specify
  the transport mechanism. Given our requirements for:
  - 1000+ concurrent users
  - Server-to-client updates only
  - Mobile browser support

  Which approach should I implement?
options:
  - "WebSocket: Full duplex, but more complex"
  - "SSE (Server-Sent Events): Simpler, sufficient for one-way"
  - "Long polling: Most compatible, higher latency"
priority: blocker
status: pending
```

### 2. Responding to a Query

The target agent reads the query and creates a response:

```yaml
# .spc/queries/query-20260115-001-response.yaml
query_id: query-20260115-001
from: architect
timestamp: 2026-01-15T10:45:00Z
answer: |
  Use **SSE (Server-Sent Events)** for this use case.

  Rationale:
  - One-way server→client is exactly what SSE is designed for
  - Native browser support, including mobile
  - Simpler implementation than WebSocket
  - Automatic reconnection built-in

  Implementation notes:
  - Use EventSource API on client
  - Set appropriate CORS headers
  - Implement heartbeat every 30s to prevent timeout
recommendation: "SSE"
additional_context: |
  I've updated the architecture doc to specify this.
  See: .spc/docs/architecture/dashboard.md:L45-55
```

### 3. Query Resolution

After receiving a response, the querying agent:
1. Updates the original query status to `resolved`
2. Documents the decision in their working artifact
3. Continues with implementation

## Priority Levels

| Priority | Definition | Expected Response Time |
|----------|------------|----------------------|
| `blocker` | Cannot proceed without answer | Immediate (same session) |
| `high` | Significantly impacts progress | Within current workflow |
| `medium` | Would improve quality | Before task completion |
| `low` | Nice to have clarification | When convenient |

## Best Practices

### DO:
- Provide specific context and file references
- Offer options when you have candidates in mind
- Mark blockers immediately to get quick resolution
- Document the resolution in your working artifact

### DON'T:
- Query for decisions you can make yourself
- Send vague or open-ended questions
- Bypass the query system for blocker issues
- Forget to mark queries as resolved

## Integration with Existing Workflow

The query protocol integrates with the existing handoff system:

```
PM creates PRD
    ↓
PM queries Architect (if technical feasibility unclear)
    ↓
Architect + Designer work (can query each other)
    ↓
Developer implements (can query Architect/Designer)
    ↓
QA tests (can query Developer for expected behavior)
    ↓
Writer documents (can query all for accuracy)
```

## File Locations

- Query files: `.spc/queries/query-{timestamp}.yaml`
- Response files: `.spc/queries/query-{timestamp}-response.yaml`
- Query index: `.spc/queries/index.yaml` (optional, for tracking)
