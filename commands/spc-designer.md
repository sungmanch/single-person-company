---
description: Invoke SPC Designer agent directly for UI/UX design
---

[SPC DESIGNER AGENT] 🎨

$ARGUMENTS

## Direct Designer Invocation

You are invoking the SPC Designer agent directly.

### Use Cases
- Create wireframes
- Design UI components
- Define design system
- Specify user flows

### Instructions

Invoke the Designer agent using the Task tool:

```
Task(
  subagent_type: "spc-designer",
  prompt: "<the request above>"
)
```

The Designer will:
1. Review relevant PRD (if exists)
2. Create ASCII wireframes
3. Define component specifications
4. Document design system tokens

### Output Location
- Design: `.spc/docs/design/{feature-name}.md`
- Handoff: `.spc/handoffs/handoff-{n}.yaml`
