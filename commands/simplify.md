---
name: simplify
description: Simplify and refine code for clarity, consistency, and maintainability
---

Use the Task tool with subagent_type "code-simplifier:code-simplifier" to simplify code.

Analyze recently modified code (check git status and recent commits) and apply simplifications:
1. Replace nested ternaries with switch statements or if/else chains
2. Extract reusable helper functions
3. Remove duplicate code (DRY principle)
4. Improve variable and function naming
5. Eliminate redundant abstractions

Preserve all functionality - only improve how code is written, not what it does.

$ARGUMENTS
