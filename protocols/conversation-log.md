# Conversation Log Protocol

## Purpose

Enable **real-time, visible dialogue** between agents during work - not just at handoffs.
Based on the Blackboard Architecture pattern for multi-agent collaboration.

## Key Principles

1. **Frequent communication**: Post updates every 2-3 minutes
2. **Visible to all**: All agents can read all messages
3. **PM relays to terminal**: User sees the conversation in real-time
4. **Conversational tone**: Talk like teammates, not processes

---

## File Location

```
.spc/conversation/{feature}-log.md
```

The PM initializes this file at the start of each project.

---

## Message Format

Each message follows this structure:

```markdown
### [{timestamp}] {Emoji} {Agent Name}
**To:** {recipient(s) or "Team"}
**Status:** {working|update|question|complete}

{Message content - conversational, human tone}

---
```

### Status Types

| Status | When to Use | Urgency |
|--------|-------------|---------|
| `working` | Starting a task or acknowledging handoff | Low |
| `update` | Progress, decisions, FYI, responses | Medium |
| `question` | Need answer to proceed (blocks progress) | High |
| `complete` | Task finished, ready for handoff | Low |

---

## When to Post (2-3 Minute Frequency)

Agents MUST post messages at these moments:

### 1. **Starting Work**
```markdown
### [2026-01-16T10:00:00Z] 📐 Jamie
**To:** Team
**Status:** working

Thanks Alex! Reading the PRD now.
Initial thoughts: This looks like a data-heavy feature -
I'll need to think carefully about the API structure.

---
```

### 2. **Making Decisions (Every 2-3 minutes)**
```markdown
### [2026-01-16T10:03:00Z] 📐 Jamie
**To:** Morgan, Team
**Status:** update

🤔 For real-time updates, I'm considering:
- SSE: Simpler, one-way, good browser support
- WebSocket: More complex, bidirectional

Leaning toward SSE since we only need server→client push.
@Morgan - does this affect your notification design?

---
```

### 3. **Asking Questions**
```markdown
### [2026-01-16T10:05:00Z] 🎨 Morgan
**To:** Jamie
**Status:** question

@Jamie Quick question: If notifications stack up, should they:
1. Stack vertically (up to 3, then collapse)
2. Replace each other (only latest visible)
3. Queue with auto-dismiss

I'm thinking option 1, but want your input on performance.

---
```

### 4. **Responding to Questions**
```markdown
### [2026-01-16T10:07:00Z] 📐 Jamie
**To:** Morgan
**Status:** update

@Morgan Great question! Option 1 is perfect.

From a technical standpoint:
- 3 DOM elements is trivial
- Auto-collapse keeps it clean
- We can use CSS transitions for smooth UX

Go for it!

---
```

### 5. **Completing Work**
```markdown
### [2026-01-16T10:30:00Z] 📐 Jamie
**To:** Team
**Status:** complete

Architecture done! 🎉

Key decisions:
- Tech: Next.js 14 + PostgreSQL + Drizzle ORM
- Real-time: SSE for notifications
- Auth: Better-auth with JWT

@Morgan - I left notes about API constraints in the spec.
@Sam - Types are fully defined, should make implementation smooth.

Full spec: .spc/docs/architecture/{feature}.md

---
```

---

## Addressing Other Agents

Use `@AgentName` to direct messages:

| Address | Meaning |
|---------|---------|
| `@Jamie` | Direct message to Architect |
| `@Morgan` | Direct message to Designer |
| `@Sam` | Direct message to Developer |
| `@Taylor` | Direct message to QA |
| `@Riley` | Direct message to Writer |
| `@Alex` | Direct message to PM |
| `Team` | Broadcast to everyone |

---

## PM Monitoring Behavior

The PM (Alex) monitors the conversation log during parallel execution:

### Polling Loop
```
while (parallel_agents_working):
    new_messages = read_conversation_log_since(last_timestamp)

    for message in new_messages:
        # Output to user's terminal
        output_to_terminal(format_message(message))

        # If question is directed to PM, respond
        if message.to == "Alex" and message.status == "question":
            response = generate_pm_response(message)
            post_to_conversation_log(response)
            output_to_terminal(format_message(response))

    # Check completion markers
    check_agent_markers()

    sleep(30)  # Poll every 30 seconds
```

### PM Response Format
```markdown
### [2026-01-16T10:08:00Z] 🧑‍💼 Alex
**To:** Jamie
**Status:** update

@Jamie Good question! Let me clarify:

The PRD says "fast load" but doesn't specify a target.
Based on the user's context (dashboard for busy professionals),
I'd recommend < 2 seconds initial load.

Does that help with your caching strategy?

---
```

---

## Conversation Log Initialization

PM creates the log file at project start:

```markdown
# Conversation Log: {Feature Name}

**Started:** {timestamp}
**Project:** {feature-name}
**Participants:**
- 🧑‍💼 Alex (PM) - Orchestrator
- 📐 Jamie (Architect) - Technical design
- 🎨 Morgan (Designer) - UI/UX
- 💻 Sam (Developer) - Implementation
- 🧪 Taylor (QA) - Testing
- 📝 Riley (Writer) - Documentation

---

### [{timestamp}] 🧑‍💼 Alex
**To:** Team
**Status:** working

PRD is complete! Starting the team workflow.

📐 Jamie, 🎨 Morgan - you're both starting now.
Coordinate via this log - I'll be monitoring and can answer questions!

---
```

---

## Reading the Conversation Log

Agents should read the log:

1. **At task start**: Catch up on any messages from parallel agents
2. **Before posting**: See if anyone already answered their question
3. **When blocked**: Check if relevant info was shared by others

### How to Read
```
Read(.spc/conversation/{feature}-log.md)
```

Look for:
- Messages addressed to you (`@YourName`)
- Relevant technical decisions from other agents
- Questions you can help answer

---

## Example Full Conversation

```markdown
# Conversation Log: Task Dashboard

**Started:** 2026-01-16T10:00:00Z
**Project:** task-dashboard

---

### [2026-01-16T10:00:00Z] 🧑‍💼 Alex
**To:** Team
**Status:** working

PRD complete! Building a task dashboard with real-time updates.

📐 Jamie, 🎨 Morgan - start now!
Post updates here, I'm watching.

---

### [2026-01-16T10:01:00Z] 📐 Jamie
**To:** Team
**Status:** working

On it! Reading PRD... Real-time updates is the core challenge.
Let me think about the transport layer.

---

### [2026-01-16T10:01:30Z] 🎨 Morgan
**To:** Team
**Status:** working

Starting wireframes! The dashboard layout is interesting.
@Jamie let me know about any tech constraints.

---

### [2026-01-16T10:05:00Z] 📐 Jamie
**To:** Morgan, Team
**Status:** update

@Morgan Heads up: Going with SSE for real-time.
It's simpler than WebSockets and perfect for server→client push.

Does this affect your notification design?

---

### [2026-01-16T10:07:00Z] 🎨 Morgan
**To:** Jamie
**Status:** update

@Jamie SSE works great! I was planning toast-style notifications.

Question: Should notifications stack or replace each other?

---

### [2026-01-16T10:09:00Z] 📐 Jamie
**To:** Morgan
**Status:** update

@Morgan Stack up to 3, then collapse into "X more".
That way users don't miss important ones but don't get overwhelmed.

---

### [2026-01-16T10:11:00Z] 🎨 Morgan
**To:** Jamie
**Status:** update

@Jamie Love it! Adding to the spec now.

---

### [2026-01-16T10:25:00Z] 📐 Jamie
**To:** Team
**Status:** complete

Architecture done!
- Next.js 14 + PostgreSQL + Drizzle
- SSE for notifications
- JWT auth

Spec at: .spc/docs/architecture/task-dashboard.md

---

### [2026-01-16T10:28:00Z] 🎨 Morgan
**To:** Team
**Status:** complete

Design done!
- Clean card-based layout
- Bold blue accent (#2563EB)
- Toast notifications with stack behavior

Spec at: .spc/docs/design/task-dashboard.md

---
```

---

## Integration with Agent Prompts

Each agent's prompt should include:

```markdown
## Conversation Behavior

You MUST post to the conversation log frequently (every 2-3 minutes):

1. **Start**: Acknowledge handoff and share initial thoughts
2. **Decisions**: Share your reasoning as you make choices
3. **Questions**: Ask other agents when you need input
4. **Responses**: Answer questions from other agents
5. **Complete**: Summarize what you did and handoff notes

**Log location**: .spc/conversation/{feature}-log.md

Use the Write tool to APPEND messages (read existing content first):
1. Read the current log
2. Append your new message at the end
3. Write the updated content
```

---

## Benefits

1. **Visible collaboration**: Users see agents working together
2. **Real-time coordination**: Parallel agents stay in sync
3. **Better decisions**: Cross-functional input during work
4. **Reduced rework**: Issues caught early through dialogue
5. **Human-like feel**: Resembles real team communication
