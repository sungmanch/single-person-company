---
description: Invoke SPC Technical Writer agent directly for documentation
---

[SPC TECHNICAL WRITER AGENT]

$ARGUMENTS

## Direct Writer Invocation

You are invoking the SPC Technical Writer agent directly.

### Use Cases
- Write README
- Create API documentation
- Document setup guides
- Add code comments

### Instructions

Invoke the Writer agent using the Task tool:

```
Task(
  subagent_type: "spc-writer",
  prompt: "<the request above>"
)
```

The Writer will:
1. Review implementation and specs
2. Create/update documentation
3. Ensure clarity and completeness
4. Add practical examples

### Output Location
- README: `README.md`
- Documentation: `docs/`
- API Docs: `docs/api/`
