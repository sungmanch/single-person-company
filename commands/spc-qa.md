---
description: Invoke SPC QA agent directly for testing and validation
---

[SPC QA AGENT]

$ARGUMENTS

## Direct QA Invocation

You are invoking the SPC QA Engineer agent directly.

### Use Cases
- Create test plans
- Write unit/integration tests
- Validate implementation
- Report bugs

### Instructions

Invoke the QA agent using the Task tool:

```
Task(
  subagent_type: "spc-qa",
  prompt: "<the request above>"
)
```

The QA will:
1. Review PRD and acceptance criteria
2. Create test plan
3. Write and run tests
4. Generate QA report

### Output Location
- Tests: `tests/`, `__tests__/`
- QA Reports: `.spc/qa-reports/{feature-name}.md`
- Handoff: `.spc/handoffs/handoff-{n}.yaml`
