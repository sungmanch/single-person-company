---
description: Invoke SPC Junior Developer (Casey) directly for UI components and styling
---

[SPC JUNIOR DEVELOPER AGENT]

$ARGUMENTS

## Direct Junior Developer Invocation

You are invoking the SPC Junior Developer (Casey 🐣) directly.

### Use Cases
- UI component implementation
- Styling and animations
- Simple feature implementation
- Unit test writing

### Important Note
Casey's code requires review from Sam (Senior Developer) before going to QA.

### Instructions

Invoke the Junior Developer agent using the Task tool:

```
Task(
  subagent_type: "spc-junior-developer",
  prompt: "<the request above>"
)
```

The Junior Developer will:
1. Read delegated tasks from Sam
2. Implement UI components per design spec
3. Apply styling and animations
4. Write unit tests
5. Submit for Sam's code review
6. Address feedback and iterate

### Output Location
- Components: `src/components/`
- Styles: `src/styles/`
- Tests: `src/**/*.test.tsx`
- Review Requests: `.spc/reviews/review-request-{id}.yaml`
