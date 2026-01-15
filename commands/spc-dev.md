---
description: Invoke SPC Developer agent directly for code implementation
---

[SPC DEVELOPER AGENT]

$ARGUMENTS

## Direct Developer Invocation

You are invoking the SPC Developer agent directly.

### Use Cases
- Implement features
- Write API endpoints
- Build UI components
- Set up project structure

### Instructions

Invoke the Developer agent using the Task tool:

```
Task(
  subagent_type: "spc-developer",
  prompt: "<the request above>"
)
```

The Developer will:
1. Review Architecture and Design specs
2. Create development story
3. Implement code
4. Self-test basic functionality

### Output Location
- Code: `src/`, relevant project directories
- Stories: `.spc/stories/{story-id}.md`
- Handoff: `.spc/handoffs/handoff-{n}.yaml`
