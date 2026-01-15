# Orchestration Patterns

This document provides the **actual Task tool syntax** used when SPC agents invoke each other.

## IMPORTANT: File Operations

**ALWAYS use the Claude Code `Write` tool for creating files.** DO NOT use bash commands like `cat << EOF` or `echo >`.

```
# Correct: Use the Write tool
Use the Write tool:
- file_path: /absolute/path/to/.spc/handoffs/file.md
- content: |
    file content here

# WRONG: Do not use bash for file creation
cat << EOF > file.md  # ❌ Requires permission prompts
echo "content" > file.md  # ❌ Requires permission prompts
```

## Pattern 1: Sequential Agent Invocation

Invoke one agent, wait for completion, then proceed to the next:

```
# Step 1: Generate handoff using the Write tool
Use the Write tool:
- file_path: {project_root}/.spc/handoffs/pm-to-designer-{timestamp}.md
- content: {handoff_content}

# Step 2: Invoke agent
Task(
  subagent_type: "spc-designer",
  prompt: "You are the UI/UX Designer for the SPC AI Team.

           Read handoff: .spc/handoffs/pm-to-designer-{timestamp}.md
           Read PRD: .spc/docs/prd/{feature}.md

           Create design specifications and enhanced userflows.

           Use the Write tool to create completion marker: .spc/markers/designer-{feature}-complete.yaml"
)

# Step 3: Verify completion
Read(.spc/markers/designer-{feature}-complete.yaml)

# Step 4: Proceed to next agent
```

## Pattern 2: Parallel Agent Invocation

Run multiple agents simultaneously in the background:

```
# Step 1: Generate handoffs for both agents using the Write tool
Use the Write tool for each handoff:
- file_path: {project_root}/.spc/handoffs/pm-to-designer-{timestamp}.md
- content: {designer_handoff}

Use the Write tool:
- file_path: {project_root}/.spc/handoffs/pm-to-architect-{timestamp}.md
- content: {architect_handoff}

# Step 2: Spawn both in background (single message, multiple tool calls)
Task(
  subagent_type: "spc-designer",
  prompt: "Read handoff: .spc/handoffs/pm-to-designer-{timestamp}.md
           Read PRD: .spc/docs/prd/{feature}.md
           Create design specifications.
           Use the Write tool to create marker: .spc/markers/designer-{feature}-complete.yaml",
  run_in_background: true
)

Task(
  subagent_type: "spc-architect",
  prompt: "Read handoff: .spc/handoffs/pm-to-architect-{timestamp}.md
           Read PRD: .spc/docs/prd/{feature}.md
           Create architecture documents.
           Use the Write tool to create marker: .spc/markers/architect-{feature}-complete.yaml",
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

## Pattern 5: Conversation-Based Parallel Execution

Run multiple agents in parallel with real-time conversation via shared log:

```
# Step 1: Initialize conversation log
Use the Write tool:
- file_path: .spc/conversation/{feature}-log.md
- content: |
    # Conversation Log: {Feature Name}

    **Started:** {timestamp}
    **Project:** {feature}

    ---

    ### [{timestamp}] 🧑‍💼 Alex
    **To:** Team
    **Status:** working

    PRD is complete! Starting the team workflow.

    📐 Jamie, 🎨 Morgan - you're both starting now.
    Coordinate via this log!

    ---

# Step 2: Spawn parallel agents (SINGLE message, multiple tool calls)
Task(
  subagent_type: "spc-architect",
  prompt: "You are Jamie. Working IN PARALLEL with Morgan.
           IMPORTANT: Post to conversation log every 2-3 minutes!
           Log: .spc/conversation/{feature}-log.md
           [rest of instructions]",
  run_in_background: true
)

Task(
  subagent_type: "spc-designer",
  prompt: "You are Morgan. Working IN PARALLEL with Jamie.
           IMPORTANT: Post to conversation log every 2-3 minutes!
           Log: .spc/conversation/{feature}-log.md
           [rest of instructions]",
  run_in_background: true
)

# Step 3: Poll conversation log and relay to terminal
last_line = 0
while not (all_markers_exist):
    log = Read(.spc/conversation/{feature}-log.md)
    new_messages = parse_messages_after(log, last_line)
    last_line = current_line

    for msg in new_messages:
        output_to_terminal(format_message(msg))

        # Respond to PM questions
        if msg.to == "Alex" and msg.status == "question":
            response = generate_response(msg)
            append_to_log(response)
            output_to_terminal(response)

    # Check markers
    check_completion_markers()

    sleep(30)  # Poll every 30 seconds

# Step 4: Continue to next phase
```

### Conversation Log Format

Each message in the log follows this format:
```markdown
### [{timestamp}] {Emoji} {Agent Name}
**To:** {recipient or Team}
**Status:** {working|update|question|complete}

{Message content}

---
```

### When Agents Should Post

| Event | Frequency | Status |
|-------|-----------|--------|
| Starting work | Once | `working` |
| Making decisions | Every 2-3 min | `update` |
| Asking questions | As needed | `question` |
| Responding to others | As needed | `update` |
| Completing work | Once | `complete` |

---

## Pattern 6: Handoff Generation Before Invocation

Generate handoff **before** invoking the Task tool:

```
# Step 1: Reflect on what you completed
{self_reflection}

# Step 2: Translate for recipient using inter-agent communication protocols
{audience_aware_translation}

# Step 3: Write handoff file using the Write tool
Use the Write tool:
- file_path: {project_root}/.spc/handoffs/{from}-to-{to}-{timestamp}.md
- content: |
    # Handoff: {From} -> {To}

    ## Context
    {what you did, why it matters to recipient}

    ## Your Focus Areas
    {specific tasks for recipient}

    ## Referenced Files
    - {file1}
    - {file2}

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
Write tool → .spc/markers/pm-prd-complete.yaml

# Initialize conversation log
Write tool → .spc/conversation/{feature}-log.md

# Phase 2: Design + Architecture (PARALLEL with Conversation)
Write tool → .spc/handoffs/pm-to-designer-{ts}.md
Write tool → .spc/handoffs/pm-to-architect-{ts}.md

Task(subagent_type: "spc-architect",
     prompt: "...Post to .spc/conversation/{feature}-log.md every 2-3 min...",
     run_in_background: true)
Task(subagent_type: "spc-designer",
     prompt: "...Post to .spc/conversation/{feature}-log.md every 2-3 min...",
     run_in_background: true)

# PM polls conversation log every 30 seconds
# - Relay new messages to terminal
# - Respond to @Alex questions
# - Check for completion markers

# Phase 3: Implementation (with Conversation)
Task(subagent_type: "spc-developer",
     prompt: "...Post to conversation log...brief QA on test areas...")
Read(.spc/markers/developer-{feature}-complete.yaml)

# Phase 4: QA + Docs (PARALLEL with Conversation)
Task(subagent_type: "spc-qa",
     prompt: "...Post bugs immediately to log...discuss with Sam...",
     run_in_background: true)
Task(subagent_type: "spc-writer",
     prompt: "...Ask clarifications via log...coordinate with Taylor...",
     run_in_background: true)

# PM continues polling - handles bug fix coordination via log

# Final: Team Celebration
output("🎉 We did it, team! Project complete!")
validate_all_deliverables()
```
