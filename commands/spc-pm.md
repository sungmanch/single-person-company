---
description: Invoke SPC PM agent directly for requirements analysis and PRD creation
---

[SPC PM AGENT] 🧑‍💼

$ARGUMENTS

## Direct PM Invocation

You are invoking the SPC Product Manager agent directly.

### Use Cases
- Analyze a new feature request
- Create or update a PRD
- Clarify requirements
- Plan project scope

### Instructions

Invoke the PM agent using the Task tool:

```
Task(
  subagent_type: "spc-pm",
  prompt: "<the request above>"
)
```

The PM will:
1. Analyze the request
2. Ask clarifying questions if needed
3. Create a PRD in `.spc/docs/prd/`
4. Suggest next steps (Architect, Designer delegation)

### Output Location
- PRD: `.spc/docs/prd/{feature-name}.md`
- Handoff: `.spc/handoffs/handoff-{n}.yaml`
