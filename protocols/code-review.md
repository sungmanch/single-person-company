# Code Review Protocol

This protocol defines how code review works between Senior Developer (Sam) and Junior Developer (Casey) in the SPC AI Team.

## Overview

```
Casey implements → Casey submits for review → Sam reviews →
    ├── Approved → Ready for QA
    └── Changes Requested → Casey fixes → Re-submit → Sam re-reviews
```

## Participants

| Role | Name | Emoji | Responsibility |
|------|------|-------|----------------|
| Reviewer | Sam | 💻 | Review code, provide feedback, approve/request changes |
| Submitter | Casey | 🐣 | Submit code, address feedback, iterate until approved |

---

## Review Request (Casey → Sam)

### File Structure
```yaml
# .spc/reviews/review-request-{timestamp}.yaml
id: review-request-{timestamp}
from: junior-developer
to: senior-developer
timestamp: {ISO timestamp}
files:
  - path: src/components/UserCard.tsx
    description: "User card component with avatar and info display"
    lines_added: 85
    lines_modified: 0
  - path: src/components/ProfileHeader.tsx
    description: "Profile header with responsive layout"
    lines_added: 62
    lines_modified: 0
summary: |
  Implemented UserCard and ProfileHeader components per design spec.
  Added hover animations and responsive breakpoints.
self_review_checklist:
  - [x] Code follows TypeScript strict mode
  - [x] No `any` types used
  - [x] Error states handled
  - [x] Loading states handled
  - [x] Unit tests included
  - [x] Linter passes
questions:
  - "Is my error handling approach correct? (UserCard line 45)"
  - "Should I add useMemo for the filter?"
tests_passing: true
lint_passing: true
status: pending
```

### Conversation Log Post
```markdown
### [{timestamp}] 🐣 Casey (Junior)
**To:** Sam
**Status:** review-request

@Sam Ready for review! 🙋

**Files:**
- `src/components/UserCard.tsx` - User card with avatar
- `src/components/ProfileHeader.tsx` - Responsive header

**Summary:**
Implemented components per Morgan's design spec. Added hover states
and responsive breakpoints.

**Questions:**
1. Line 45 error handling - is this approach correct?
2. Should I add useMemo for the filter?

Let me know what you think! 🙏

---
```

---

## Code Review (Sam → Casey)

### Review Checklist

Sam should check each file for:

- [ ] **Type Safety**
  - No `any` types
  - Proper interface definitions
  - Correct prop types

- [ ] **Performance**
  - useMemo/useCallback where needed
  - No unnecessary re-renders
  - Efficient data structures

- [ ] **Error Handling**
  - All error cases covered
  - User-friendly error messages
  - Proper error boundaries

- [ ] **Accessibility**
  - Semantic HTML
  - ARIA labels
  - Keyboard navigation

- [ ] **Code Style**
  - Consistent with codebase
  - Meaningful variable names
  - Appropriate comments

- [ ] **Tests**
  - Adequate coverage
  - Edge cases tested
  - Mocks used appropriately

### Review File Structure
```yaml
# .spc/reviews/review-{timestamp}.yaml
id: review-{timestamp}
reviewer: senior-developer
reviewee: junior-developer
request_id: review-request-{original-timestamp}
timestamp: {ISO timestamp}
verdict: approved | changes_requested | needs_discussion

overall_feedback: |
  Great work on the component structure, Casey!
  Clean use of TypeScript and good error handling overall.
  A few performance improvements needed before QA.

files:
  - path: src/components/UserCard.tsx
    status: changes_requested
    comments:
      - line: 23
        type: improvement  # improvement | bug | nit | question | praise
        severity: medium   # low | medium | high
        message: |
          Consider using useMemo here - the filter runs on every render.
          ```tsx
          const filteredItems = useMemo(
            () => items.filter(item => item.active),
            [items]
          );
          ```
      - line: 45
        type: praise
        message: "Nice error handling! This covers all the edge cases."
      - line: 67
        type: nit
        message: "Optional: could extract this magic number to a constant"

  - path: src/components/ProfileHeader.tsx
    status: approved
    comments:
      - line: 12
        type: nit
        message: "Optional cleanup: could use destructuring here"

summary:
  total_comments: 4
  improvements_required: 1
  bugs_found: 0
  nits: 2
  praise: 1

status: pending_changes  # pending_changes | approved | blocked
```

### Verdict Types

| Verdict | Meaning | Next Step |
|---------|---------|-----------|
| `approved` | Code is ready for QA | Casey marks task complete |
| `changes_requested` | Issues need fixing | Casey addresses feedback |
| `needs_discussion` | Architectural concerns | Sync conversation needed |

### Conversation Log Post
```markdown
### [{timestamp}] 💻 Sam (Senior)
**To:** Casey
**Status:** review-complete

@Casey Code review done!

**Verdict:** Changes Requested

**Overall:** Nice work! Clean component structure. Just one performance fix needed.

**UserCard.tsx:**
- Line 23 (improvement): Add `useMemo` for the filter - it runs every render
- Line 45 (praise): Great error handling! 👏
- Line 67 (nit): Optional - extract magic number to constant

**ProfileHeader.tsx:**
- ✅ Looks good!

Make the changes and tag me for re-review!

---
```

---

## Addressing Feedback (Casey)

### Update Review Request Status
```yaml
# Update .spc/reviews/review-request-{id}.yaml
status: revised
revision_number: 1
changes_made:
  - "Added useMemo for filter (line 23)"
  - "Extracted magic number to constant (line 67)"
```

### Conversation Log Post
```markdown
### [{timestamp}] 🐣 Casey (Junior)
**To:** Sam
**Status:** revision

@Sam Thanks for the review! Made the changes:

✅ Added useMemo for the filter (good catch!)
✅ Extracted magic number to constant

Ready for re-review when you have a moment! 🙏

---
```

---

## Re-Review (Sam)

### Quick Re-Review
For revisions, Sam only needs to check:
1. Original issues are fixed
2. No new issues introduced
3. Tests still pass

### Approval
```yaml
# Update .spc/reviews/review-{id}.yaml
status: approved
final_verdict: approved
approved_at: {ISO timestamp}
```

### Conversation Log Post
```markdown
### [{timestamp}] 💻 Sam (Senior)
**To:** Casey
**Status:** approved

@Casey LGTM! 👍

Changes look great. Nice work on the useMemo implementation.

Code is approved and ready for QA! 🎉

---
```

---

## Review Best Practices

### For Sam (Reviewer)

1. **Be Constructive**
   - Explain *why* not just *what*
   - Provide code examples when helpful
   - Balance criticism with praise

2. **Prioritize Feedback**
   - Mark severity (low/medium/high)
   - Distinguish blockers from nits
   - Don't block on style preferences

3. **Teach, Don't Just Correct**
   - Share relevant patterns
   - Link to documentation
   - Explain trade-offs

4. **Be Timely**
   - Review within conversation flow
   - Don't block Casey unnecessarily
   - Quick re-reviews for small changes

### For Casey (Submitter)

1. **Self-Review First**
   - Run linter before submitting
   - Check your own code
   - Note areas you're unsure about

2. **Ask Questions**
   - Flag uncertain areas
   - Ask for clarification
   - Request examples if needed

3. **Learn from Feedback**
   - Document learnings
   - Apply patterns to future work
   - Don't make same mistakes twice

4. **Respond Professionally**
   - Thank for feedback
   - Ask if unclear
   - Don't take criticism personally

---

## Integration with SPC Workflow

### During Development Phase

```
Jamie + Morgan complete specs
          ↓
Sam starts (complex logic, API)
          ↓
Sam delegates UI to Casey
          ↓
Casey implements
          ↓
Casey submits for review ←──┐
          ↓                 │
Sam reviews                 │
          ↓                 │
Changes needed? ────Yes─────┘
          ↓ No
Approved!
          ↓
Ready for QA (Taylor)
```

### Markers

When both developers complete:
- `.spc/markers/senior-developer-{feature}-complete.yaml`
- `.spc/markers/junior-developer-{feature}-complete.yaml`

Sam's marker should include review approval status:
```yaml
reviews_approved:
  - review-request-{id-1}: approved
  - review-request-{id-2}: approved
```
