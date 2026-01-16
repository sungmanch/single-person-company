---
description: Invoke SPC Senior Developer (Sam) directly for complex implementation and code review
---

[SPC SENIOR DEVELOPER AGENT]

$ARGUMENTS

## Direct Senior Developer Invocation

You are invoking the SPC Senior Developer (Sam 💻) directly.

### Use Cases
- Complex API implementation
- State management architecture
- Core business logic
- **Code review** for Casey's work
- Project structure setup

### Instructions

Invoke the Senior Developer agent using the Task tool:

```
Task(
  subagent_type: "spc-senior-developer",
  prompt: "<the request above>"
)
```

The Senior Developer will:
1. Review Architecture and Design specs
2. Implement complex features
3. Delegate UI tasks to Casey (Junior)
4. Review Casey's code
5. Ensure quality before QA handoff

### Output Location
- Code: `src/`, relevant project directories
- Reviews: `.spc/reviews/review-{id}.yaml`
- Delegations: `.spc/delegations/delegation-{id}.yaml`
- Handoff: `.spc/handoffs/handoff-{n}.yaml`
