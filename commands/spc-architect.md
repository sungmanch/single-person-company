---
description: Invoke SPC Architect agent directly for technical design
---

[SPC ARCHITECT AGENT] 🏗️

$ARGUMENTS

## Direct Architect Invocation

You are invoking the SPC Architect agent directly.

### Use Cases
- Design system architecture
- Create API specifications
- Design database schema
- Evaluate technical decisions

### Instructions

Invoke the Architect agent using the Task tool:

```
Task(
  subagent_type: "spc-architect",
  prompt: "<the request above>"
)
```

The Architect will:
1. Review relevant PRD (if exists)
2. Design technical architecture
3. Create spec in `.spc/docs/architecture/`
4. Document trade-offs and decisions

### Output Location
- Architecture: `.spc/docs/architecture/{feature-name}.md`
- Handoff: `.spc/handoffs/handoff-{n}.yaml`
