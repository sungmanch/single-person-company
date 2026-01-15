---
description: Show SPC project status and artifacts
---

[SPC STATUS] 📊

## Project Status Check

Check the current state of the SPC project.

### Instructions

1. **Check Directory Structure**
   ```bash
   ls -la .spc/ 2>/dev/null || echo "No .spc/ directory found"
   ```

2. **List Artifacts**
   ```bash
   find .spc/ -name "*.md" -o -name "*.yaml" 2>/dev/null | sort
   ```

3. **Show Recent Handoffs**
   ```bash
   ls -lt .spc/handoffs/ 2>/dev/null | head -5
   ```

4. **Check Todo List**
   Review the current todo list for pending SPC tasks

### Expected Structure
```
.spc/
├── docs/
│   ├── prd/           # Product Requirements
│   ├── architecture/  # Technical Design
│   └── design/        # UI/UX Specs
├── stories/           # Development Stories
├── qa-reports/        # QA Reports
└── handoffs/          # Agent Handoff Records
```

### Status Indicators
- 📋 PRD exists: `.spc/docs/prd/*.md`
- 🏗️ Architecture exists: `.spc/docs/architecture/*.md`
- 🎨 Design exists: `.spc/docs/design/*.md`
- 💻 Stories exist: `.spc/stories/*.md`
- 🧪 QA reports exist: `.spc/qa-reports/*.md`
- 📝 README updated: Check `README.md` modification time

Run the bash commands above to check current status.
