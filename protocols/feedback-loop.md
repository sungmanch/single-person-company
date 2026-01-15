# Feedback Loop Protocol

This protocol enables bidirectional feedback between SPC agents, allowing downstream agents to communicate issues, suggestions, and clarifications back to upstream agents.

## Purpose

Real teams don't just hand off work—they provide feedback. This protocol enables:
- QA to send bug reports back to Developer
- Writer to request clarifications from any agent
- Any agent to flag issues with upstream artifacts

## Feedback Types

| Type | From → To | Purpose |
|------|-----------|---------|
| `bug_report` | QA → Developer | Report implementation bugs |
| `spec_clarification` | Developer → Architect/Designer | Request spec clarification |
| `content_verification` | Writer → Any | Verify documentation accuracy |
| `requirement_gap` | Any → PM | Flag missing requirements |
| `design_inconsistency` | Developer → Designer | Flag design implementation issues |

## Feedback File Format

```yaml
# .spc/feedback/feedback-{timestamp}.yaml
id: feedback-{unique-id}
type: bug_report|spec_clarification|content_verification|requirement_gap|design_inconsistency
from: {agent-name}
to: {target-agent}
timestamp: {ISO-8601}
severity: blocker|major|minor|suggestion
context:
  artifact: "{path to related artifact}"
  reference: "{file:line if applicable}"
issue: |
  Clear description of the issue or question.
suggested_resolution: |
  Optional: Proposed fix or clarification request.
blocks_progress: true|false
status: open|acknowledged|resolved|wont_fix
```

## Feedback Workflows

### Bug Report (QA → Developer)

```yaml
id: feedback-20260115-001
type: bug_report
from: qa
to: developer
timestamp: 2026-01-15T14:00:00Z
severity: major
context:
  artifact: ".spc/qa-reports/counter-feature.md"
  reference: "src/components/Counter.tsx:L42"
issue: |
  Delete button click handler is not attached.

  Steps to reproduce:
  1. Navigate to counter page
  2. Click delete button on any item
  3. Observe: Nothing happens

  Expected: Item should be deleted
  Actual: No response to click
suggested_resolution: |
  Add onClick handler to delete button:
  ```tsx
  <button onClick={() => handleDelete(item.id)}>Delete</button>
  ```
blocks_progress: true
status: open
```

### Spec Clarification (Developer → Architect)

```yaml
id: feedback-20260115-002
type: spec_clarification
from: developer
to: architect
timestamp: 2026-01-15T14:30:00Z
severity: minor
context:
  artifact: ".spc/docs/architecture/user-auth.md"
  reference: "L78-82"
issue: |
  The architecture spec mentions "session timeout" but doesn't specify:
  - Timeout duration
  - Whether to show warning before logout
  - Behavior on activity (extend or fixed?)
suggested_resolution: |
  Please update the spec with:
  - Timeout duration (suggest: 30 minutes)
  - Warning: 5 minutes before timeout
  - Activity extends session
blocks_progress: false
status: open
```

### Content Verification (Writer → Any)

```yaml
id: feedback-20260115-003
type: content_verification
from: writer
to: architect
timestamp: 2026-01-15T15:00:00Z
severity: minor
context:
  artifact: "README.md"
  reference: "L45-50"
issue: |
  Documenting API endpoints. Please verify:

  1. Is rate limiting 100 req/min or 1000 req/min?
  2. Are all endpoints authenticated or only /api/admin/*?
  3. What's the correct base URL for production?
suggested_resolution: |
  Please provide:
  - Accurate rate limit values
  - Authentication scope
  - Production URL
blocks_progress: true
status: open
```

## Response Format

```yaml
# .spc/feedback/feedback-{id}-response.yaml
feedback_id: feedback-20260115-001
from: developer
timestamp: 2026-01-15T14:30:00Z
resolution: |
  Fixed in commit abc123.
  Added onClick handler as suggested.

  Additional changes:
  - Added loading state during delete operation
  - Added confirmation dialog for destructive action
artifacts_updated:
  - src/components/Counter.tsx
  - src/components/ConfirmDialog.tsx (new)
status: resolved
verification_needed: true  # QA should re-verify
```

## Severity Definitions

| Severity | Definition | Expected Response |
|----------|------------|-------------------|
| `blocker` | Cannot proceed; critical functionality broken | Immediate fix required |
| `major` | Significant issue but workaround exists | Fix before approval |
| `minor` | Small issue, doesn't block progress | Fix if time permits |
| `suggestion` | Improvement idea, not a defect | Consider for future |

## Integration with Workflow

### Standard Flow with Feedback

```
Developer completes → QA tests
                         ↓
              ┌─── Issues found? ───┐
              │                     │
            Yes                    No
              │                     │
     Create bug_report         Approve
              │                     │
              ↓                     ↓
     Developer fixes          Writer documents
              │
              ↓
     Re-submit to QA
```

### Escalation Path

If feedback is disputed or unresolved:

1. **Same-level resolution**: Direct discussion between agents
2. **PM escalation**: If no agreement, escalate to PM
3. **User escalation**: If PM cannot resolve, ask user

## Best Practices

### For Feedback Senders:
- Be specific with reproduction steps and file references
- Provide suggested resolutions when possible
- Use appropriate severity levels
- Mark blockers immediately

### For Feedback Receivers:
- Acknowledge feedback promptly
- Update status as you work on resolution
- Document what was changed and why
- Request re-verification when fixed

### For All Agents:
- Don't take feedback personally—it improves quality
- Be constructive and solution-oriented
- Document decisions for future reference

## File Locations

- Feedback files: `.spc/feedback/feedback-{timestamp}.yaml`
- Response files: `.spc/feedback/feedback-{id}-response.yaml`
- Feedback log: `.spc/feedback/log.md` (optional summary)
