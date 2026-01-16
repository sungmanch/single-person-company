---
description: Invoke SPC Developer team (Senior + Junior) for code implementation
---

[SPC DEVELOPER TEAM]

$ARGUMENTS

## Developer Team Overview

The SPC Developer team consists of two developers:

| Name | Role | Emoji | Specialty |
|------|------|-------|-----------|
| **Sam** | Senior Developer | 💻 | Complex logic, API, code review |
| **Casey** | Junior Developer | 🐣 | UI components, styling |

### Development Flow
```
Sam (Senior) → Sets up structure, implements complex parts
     ↓
Casey (Junior) → Implements UI components
     ↓
Sam → Reviews Casey's code
     ↓
Ready for QA
```

## Quick Commands

| Command | Description |
|---------|-------------|
| `/spc:senior-dev` | Invoke Sam directly (complex work) |
| `/spc:junior-dev` | Invoke Casey directly (UI work) |

## Default Behavior

By default, this command invokes Sam (Senior Developer) who will:
1. Review Architecture and Design specs
2. Set up project structure and types
3. Implement complex features (API, state management)
4. Delegate UI tasks to Casey
5. Review Casey's code before QA

### Instructions

Invoke the Senior Developer using the Task tool:

```
Task(
  subagent_type: "spc-senior-developer",
  prompt: "<the request above>"
)
```

### Output Location
- Code: `src/`, relevant project directories
- Stories: `.spc/stories/{story-id}.md`
- Reviews: `.spc/reviews/review-{id}.yaml`
- Delegations: `.spc/delegations/delegation-{id}.yaml`
- Handoff: `.spc/handoffs/handoff-{n}.yaml`
