---
description: List all SPC artifacts in the current project
---

[SPC ARTIFACTS]

## List All SPC Artifacts

### Instructions

Execute these commands to see all SPC artifacts:

```bash
echo "=== PRD Documents ===" && ls -la .spc/docs/prd/ 2>/dev/null || echo "None"
echo ""
echo "=== Architecture Documents ===" && ls -la .spc/docs/architecture/ 2>/dev/null || echo "None"
echo ""
echo "=== Design Documents ===" && ls -la .spc/docs/design/ 2>/dev/null || echo "None"
echo ""
echo "=== Development Stories ===" && ls -la .spc/stories/ 2>/dev/null || echo "None"
echo ""
echo "=== QA Reports ===" && ls -la .spc/qa-reports/ 2>/dev/null || echo "None"
echo ""
echo "=== Handoffs ===" && ls -la .spc/handoffs/ 2>/dev/null || echo "None"
```

### Artifact Types

| Type | Location | Created By |
|------|----------|------------|
| PRD | `.spc/docs/prd/` | Product Manager |
| Architecture | `.spc/docs/architecture/` | Architect |
| Design | `.spc/docs/design/` | Designer |
| Stories | `.spc/stories/` | Developer |
| QA Reports | `.spc/qa-reports/` | QA Engineer |
| Handoffs | `.spc/handoffs/` | All Agents |

### Reading Artifacts

To read a specific artifact:
```bash
cat .spc/docs/prd/{feature-name}.md
```

Or use the Read tool for better formatting.
