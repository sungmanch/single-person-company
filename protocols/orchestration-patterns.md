# Orchestration Patterns

This document provides the **actual Task tool syntax** used when SPC agents invoke each other.

## Pattern 1: Sequential Agent Invocation

Invoke one agent, wait for completion, then proceed to the next:

```
# Step 1: Generate handoff
Write(.spc/handoffs/pm-to-designer-{timestamp}.md, {handoff_content})

# Step 2: Invoke agent
Task(
  subagent_type: "spc-designer",
  prompt: "You are the UI/UX Designer for the SPC AI Team.

           Read handoff: .spc/handoffs/pm-to-designer-{timestamp}.md
           Read PRD: .spc/docs/prd/{feature}.md

           Create design specifications and enhanced userflows.

           Write completion marker: .spc/markers/designer-{feature}-complete.yaml"
)

# Step 3: Verify completion
Read(.spc/markers/designer-{feature}-complete.yaml)

# Step 4: Proceed to next agent
```

## Pattern 2: Parallel Agent Invocation

Run multiple agents simultaneously in the background:

```
# Step 1: Generate handoffs for both agents
Write(.spc/handoffs/pm-to-designer-{timestamp}.md, {designer_handoff})
Write(.spc/handoffs/pm-to-architect-{timestamp}.md, {architect_handoff})

# Step 2: Spawn both in background (single message, multiple tool calls)
Task(
  subagent_type: "spc-designer",
  prompt: "Read handoff: .spc/handoffs/pm-to-designer-{timestamp}.md
           Read PRD: .spc/docs/prd/{feature}.md
           Create design specifications.
           Write marker: .spc/markers/designer-{feature}-complete.yaml",
  run_in_background: true
)

Task(
  subagent_type: "spc-architect",
  prompt: "Read handoff: .spc/handoffs/pm-to-architect-{timestamp}.md
           Read PRD: .spc/docs/prd/{feature}.md
           Create architecture documents.
           Write marker: .spc/markers/architect-{feature}-complete.yaml",
  run_in_background: true
)

# Step 3: Wait for both markers (polling loop)
Bash("
  timeout=900  # 15 minutes
  elapsed=0
  while [[ ! -f .spc/markers/designer-{feature}-complete.yaml ]] || \
        [[ ! -f .spc/markers/architect-{feature}-complete.yaml ]]; do
    sleep 30
    elapsed=$((elapsed + 30))
    if [[ $elapsed -ge $timeout ]]; then
      echo 'TIMEOUT: Agents did not complete in 15 minutes'
      exit 1
    fi
  done
  echo 'Both agents completed successfully'
")

# Step 4: Read markers to verify
Read(.spc/markers/designer-{feature}-complete.yaml)
Read(.spc/markers/architect-{feature}-complete.yaml)
```

## Pattern 3: Marker Polling

Wait until marker files are created:

```bash
# Single marker check
while [[ ! -f .spc/markers/{agent}-{task}-complete.yaml ]]; do
  sleep 30
done

# Multiple markers check
while [[ ! -f marker1.yaml ]] || [[ ! -f marker2.yaml ]]; do
  sleep 30
done

# With timeout
timeout=600
elapsed=0
while [[ ! -f marker.yaml ]]; do
  sleep 30
  elapsed=$((elapsed + 30))
  if [[ $elapsed -ge $timeout ]]; then
    echo "TIMEOUT"
    exit 1
  fi
done
```

## Pattern 4: Error Handling

Check and handle error markers:

```
# Check for error marker after timeout
if [[ -f .spc/markers/{agent}-{task}-error.yaml ]]; then
  Read(.spc/markers/{agent}-{task}-error.yaml)
  # Log blocker in STATES.md
  # Notify user
fi
```

## Pattern 5: Handoff Generation Before Invocation

Generate handoff **before** invoking the Task tool:

```
# Step 1: Reflect on what you completed
{self_reflection}

# Step 2: Translate for recipient using inter-agent communication protocols
{audience_aware_translation}

# Step 3: Write handoff file
Write(.spc/handoffs/{from}-to-{to}-{timestamp}.md, "
# Handoff: {From} -> {To}

## Context
{what you did, why it matters to recipient}

## Your Focus Areas
{specific tasks for recipient}

## Referenced Files
- {file1}
- {file2}
")

# Step 4: Include handoff path in Task prompt
Task(
  subagent_type: "{agent}",
  prompt: "Read handoff: .spc/handoffs/{from}-to-{to}-{timestamp}.md
           {rest of instructions}"
)
```

---

## Agent Reference Table

| Agent ID | Subagent Type | Prerequisites |
|----------|---------------|---------------|
| PM | `spc-pm` | None |
| Architect | `spc-architect` | PRD |
| Designer | `spc-designer` | PRD |
| Developer | `spc-developer` | PRD + Architecture + Design |
| QA | `spc-qa` | Implementation complete |
| Writer | `spc-writer` | QA passed |

---

## Complete Workflow Example

```
# Phase 1: PRD (PM)
create_prd()
Write(.spc/markers/pm-prd-complete.yaml, {marker})

# Phase 2: Design + Architecture (PARALLEL)
Write(.spc/handoffs/pm-to-designer-{ts}.md, {handoff})
Write(.spc/handoffs/pm-to-architect-{ts}.md, {handoff})

Task(subagent_type: "spc-designer", ..., run_in_background: true)
Task(subagent_type: "spc-architect", ..., run_in_background: true)

Bash("while [[ ! -f marker1 ]] || [[ ! -f marker2 ]]; do sleep 30; done")

# Phase 3: Implementation (Sequential)
Write(.spc/handoffs/architect-to-developer-{ts}.md, {handoff})
Task(subagent_type: "spc-developer", ...)
Read(.spc/markers/developer-{task}-complete.yaml)

# Phase 4: QA + Docs (PARALLEL)
Write(.spc/handoffs/developer-to-qa-{ts}.md, {handoff})
Write(.spc/handoffs/developer-to-writer-{ts}.md, {handoff})

Task(subagent_type: "spc-qa", ..., run_in_background: true)
Task(subagent_type: "spc-writer", ..., run_in_background: true)

Bash("while [[ ! -f marker3 ]] || [[ ! -f marker4 ]]; do sleep 30; done")

# Final: Validation (PM)
validate_all_deliverables()
```
