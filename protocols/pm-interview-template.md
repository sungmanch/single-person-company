# PM Interview Template

This template guides the PM (Product Manager) through a structured interview with the user.

## Phase 1: Understanding the Request (2-3 questions)

### Question 1: Target User

```
Question: "Who is the primary target user for this application?"
Options:
  - Developers/Technical users → CLI-first, technical language OK
  - General users → Simple UI, clear instructions needed
  - Mixed audience → Progressive disclosure, accommodate both
```

### Question 2: Core Problem

```
Question: "What is the main problem this solves?"
Options:
  - Productivity/Efficiency → Focus on speed, automation
  - Learning/Education → Focus on clarity, guidance
  - Collaboration → Focus on sharing, communication
  - Data Management → Focus on organization, search
```

### Question 3: Success Criteria

```
Question: "How will we measure success?"
Options:
  - Feature completion → All specified features work
  - User satisfaction → Positive feedback, usability
  - Performance → Speed, efficiency metrics
  - Adoption → Usage numbers, retention
```

## Phase 2: Scope Definition (1-2 questions)

### Question 4: MVP vs Full Version

```
Question: "For this first version, should we prioritize:"
Options:
  - Minimal MVP → Core features only, ship fast
  - Polished experience → Fewer features but high quality
  - Feature-rich → More features even if takes longer
```

### Question 5: Technical Constraints (if applicable)

```
Question: "Any technical preferences or constraints?"
Options:
  - Use existing stack → Stick with current technologies
  - Modern/latest → Use cutting-edge tools
  - Simple/stable → Prioritize proven, stable technologies
```

## Phase 3: Confirmation

After collecting answers:

1. **Summarize understanding:**
   ```
   Thanks! Let me confirm what I understood:
   - Target users: [answer]
   - Core problem: [answer]
   - Success criteria: [answer]
   - Scope: [answer]
   - Technical approach: [answer]

   Does this capture your vision?
   ```

2. **Get explicit confirmation before proceeding to PRD creation**

## Interview Tips

- **DO:** Use structured options (AskUserQuestion tool)
- **DO:** Keep questions focused and specific
- **DO:** Acknowledge user's answers before next question
- **DON'T:** Ask open-ended "What do you want?" questions
- **DON'T:** Make assumptions, always clarify
- **DON'T:** Skip the interview even if request seems clear

## Example Interview Flow

```
Alex (PM): Hi! I'm Alex 🧑‍💼, your PM. I see you want to build [feature].
           Let me ask a few questions to understand your needs better.

[Uses AskUserQuestion with options]

User: [Selects options]

Alex: Great! So you're targeting [audience] and focusing on [problem].
      Let me ask about scope...

[More AskUserQuestion calls]

User: [Answers]

Alex: Perfect! Let me summarize:
      - Target: [summary]
      - Priority: [summary]
      - Approach: [summary]

      Does this capture everything?

User: Yes!

Alex: Excellent! Creating PRD now and kicking off the team...
```

## Adapting Questions to Context

Adjust questions based on the type of request:

| Request Type | Focus Questions On |
|--------------|-------------------|
| Web application | Users, features, deployment |
| CLI tool | Target users (devs/ops), integration, distribution |
| Library/SDK | API design, language ecosystem, documentation |
| Mobile app | Platform (iOS/Android/both), offline support, native features |
| Data pipeline | Scale, latency, data sources, transformation logic |

## Red Flags to Address

If user request contains these, ask clarifying questions:

- **Vague scope:** "Build a system..." → Ask: What specific features?
- **Ambiguous users:** "For people..." → Ask: What type of people? Technical level?
- **No success criteria:** → Ask: How will you know it's working well?
- **Conflicting constraints:** "Fast AND feature-rich" → Ask: What's the priority?
- **Missing technical context:** → Ask: Any existing systems to integrate with?
