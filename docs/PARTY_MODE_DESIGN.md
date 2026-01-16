# Party Mode Design

## Overview

Party Mode transforms SPC from a verbose orchestration tool into a real-time team conversation display. Users see agents chatting naturally, not tool calls.

## Before vs After

### Before (Verbose Mode)
```
Great! Now it's time to hand off implementation to 💻 Sam!

Task:Sam: Implement the app
IN
You are **Sam 💻**, the Developer for the SPC AI Team.
## Your Mission...

Write index.html
16 lines
<!doctype html>...

Bash: npm install
OUT: added 234 packages...

Write App.tsx
159 lines
import { useState }...
```

### After (Party Mode)
```
📐 Jamie: PRD checked! Going with timedtext endpoint for API
🎨 Morgan: @Jamie 👍 Any CORS issues?
📐 Jamie: @Morgan Yes, need a proxy
🎨 Morgan: Adding loading state to FAB
📐 Jamie: Architecture complete! → .spc/docs/architecture/
🎨 Morgan: Design complete! Green FAB is the key
💻 Sam: Checked the specs! Looking clean 👏
💻 Sam: Setting up project...
💻 Sam: Working on hooks... useYouTubePlayer ✅
💻 Sam: Working on components...
💻 Sam: Build successful! 🎉
🧪 Taylor: @Sam Starting code review
🧪 Taylor: Build passed ✅ Starting tests
📝 Riley: Writing README...
🧪 Taylor: QA complete! APPROVED ✅
📝 Riley: Documentation complete!
🧑‍💼 Alex: Great work team! 🎉
```

## Key Changes

### 1. Message Frequency
| Mode | Frequency | Message Length |
|------|-----------|----------------|
| Verbose | 2-3 min | Long (multi-paragraph) |
| **Party** | **15-30 sec** | **Short (1-2 lines)** |

### 2. Message Format

**Party Mode Message Template:**
```
{emoji} {name}: {short_message}
```

Examples:
```
📐 Jamie: Starting architecture design!
📐 Jamie: @Morgan YouTube iframe needs 16:9 aspect ratio
🎨 Morgan: @Jamie Got it, will apply aspect-ratio
💻 Sam: useSubtitles hook complete ✅
🧪 Taylor: Build passed! Running tests...
```

### 3. Interaction Patterns

**Direct mentions:** `@Name` for targeted messages
```
🎨 Morgan: @Jamie How much delay for subtitle loading?
📐 Jamie: @Morgan About 100-500ms
```

**Status indicators:**
- ✅ = Complete
- 🔄 = In progress
- ❌ = Problem occurred
- 👏 = Praise

**Short completions:**
```
📐 Jamie: Architecture complete! → .spc/docs/architecture/feature.md
```

### 4. PM (Alex) Streaming Behavior

In Party Mode, Alex should:
1. **Hide all tool invocations** from user
2. **Stream conversation log updates** to terminal in real-time
3. **Only show agent chat messages**

```python
# Pseudocode for PM streaming
while not all_complete:
    new_messages = poll_conversation_log()

    for msg in new_messages:
        # Format: emoji + name + short message only
        print(f"{msg.emoji} {msg.name}: {msg.text}")

    sleep(5)  # Poll every 5 seconds
```

### 5. Agent Conversation Templates (Short Form)

#### Starting Work
```
📐 Jamie: Reading PRD...
📐 Jamie: Starting architecture design!
```

#### Progress Updates (every 15-30 sec)
```
📐 Jamie: Analyzing YouTube API options...
📐 Jamie: Decided on timedtext endpoint!
📐 Jamie: Designing component structure...
```

#### Questions & Answers
```
🎨 Morgan: @Jamie How do we handle CORS?
📐 Jamie: @Morgan We'll use a proxy
🎨 Morgan: 👍 Will add loading state
```

#### Completions
```
📐 Jamie: Architecture complete! ✅
📐 Jamie: @Sam TypeScript interfaces are all defined
```

#### Reactions & Acknowledgments
```
💻 Sam: @Jamie @Morgan Specs look clean! 👏
🧪 Taylor: @Sam Nice code!
```

## Implementation Changes

### Agent Files to Update

1. **spc-architect.md** - Add short message templates
2. **spc-designer.md** - Add short message templates
3. **spc-developer.md** - Add short message templates
4. **spc-qa.md** - Add short message templates
5. **spc-writer.md** - Add short message templates
6. **spc-pm.md** - Add streaming logic

### New Sections to Add to Each Agent

```markdown
<party_mode_messages>
## Short Message Templates (Party Mode)

Use these short formats when posting to conversation log:

### Starting
{emoji} {name}: Starting {task}!

### Progress (every 15-30 sec)
{emoji} {name}: {what_doing}...
{emoji} {name}: {item} ✅

### Questions
{emoji} {name}: @{other} {short_question}?

### Answers
{emoji} {name}: @{asker} {short_answer}

### Completion
{emoji} {name}: {task} complete! ✅
{emoji} {name}: → {artifact_path}

### Reactions
{emoji} {name}: @{other} {praise} 👏
{emoji} {name}: 👍
</party_mode_messages>
```

### PM Streaming Section

```markdown
<party_mode_streaming>
## Party Mode Output

In Party Mode, you stream the conversation to the user:

1. After spawning agents, enter streaming loop
2. Poll `.spc/conversation/{feature}-log.md` every 5 seconds
3. Print ONLY new messages in short format
4. Do NOT print tool invocations, file writes, or bash outputs
5. Continue until all markers exist

### Output Format
Print each new message exactly as:
```
{emoji} {name}: {message}
```

No headers, no status boxes, no separators.
</party_mode_streaming>
```

## Migration Path

1. **Phase 1**: Add `<party_mode_messages>` section to all agents
2. **Phase 2**: Add `<party_mode_streaming>` to PM
3. **Phase 3**: Create `/spc:party` command variant
4. **Phase 4**: Make Party Mode default, verbose becomes opt-in

## Open Questions

- [ ] Should we show file creation at all? (e.g., `→ created src/App.tsx`)
- [ ] How to handle errors in party mode? (keep short or expand?)
- [ ] Should PM interject with its own messages?
