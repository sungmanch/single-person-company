# SPC-Sisyphus Implementation Comparison

> Comparing SPC-Sisyphus orchestration system vs oh-my-opencode's Sisyphus

**Research Date:** 2026-01-15

---

## Executive Summary

Both implementations share the core "Sisyphus" philosophy—work until completion—but differ fundamentally in implementation approach. **Ours is a Claude Code plugin using markdown**, while **oh-my-opencode's is a TypeScript-based platform with 1,486 lines of code**.

---

## 1. Core Architecture

### Our Implementation

**Technology Stack:**
```
Claude Code CLI Plugin (Markdown-based)
  └─ ~/.claude/
      ├─ skills/spc-sisyphus/SKILL.md       # Core skill definition
      ├─ commands/
      │   ├─ spc-sisyphus.md                # /spc-sisyphus command
      │   ├─ orchestrator.md                # /orchestrator command
      │   └─ ultrawork.md                   # /ultrawork command
      ├─ agents/
      │   └─ spc-sisyphus-junior.md         # Execution agent
      └─ protocols/
          └─ orchestration-patterns.md      # Delegation patterns
```

**Total Code:** ~300-400 lines of markdown

**Nature:** Plugin enhancement to Claude Code

### oh-my-opencode's Implementation

**Technology Stack:**
```
TypeScript Agent Framework (Complete Platform)
  └─ oh-my-opencode/
      ├─ src/agents/sisyphus.ts             # 1,486 lines of TypeScript
      ├─ src/tools/                         # 11+ LSP tools
      ├─ src/session/                       # State management
      └─ oh-my-opencode.json                # Configuration
```

**Total Code:** 1,486+ lines for Sisyphus alone, 5,000+ total

**Nature:** Complete OpenCode platform replacement

**Key Difference:** We extend; they replace.

---

## 2. Sisyphus Core Philosophy (Shared)

Both implementations share the foundational philosophy:

> "Like Sisyphus condemned to roll his boulder eternally, you are BOUND to your task list. You do not stop. You do not quit. The boulder rolls until it reaches the top - until EVERY task is COMPLETE."

**Shared Principles:**
- ✅ Continue until ALL tasks complete
- ✅ Delegate to specialized subagents
- ✅ Verify completion before stopping
- ✅ Never leave work incomplete

---

## 3. Available Subagents

### Our Subagent Lineup

| Agent | Model | Purpose |
|-------|-------|---------|
| `oracle` | Opus | Complex debugging, architecture, root cause analysis |
| `librarian` | Sonnet | Documentation research, codebase understanding |
| `explore` | Haiku | Fast pattern matching, file/code searches |
| `frontend-engineer` | Sonnet | UI/UX, components, styling, accessibility |
| `document-writer` | Haiku | README, API docs, technical writing |
| `multimodal-looker` | Sonnet | Screenshot/diagram/mockup analysis |
| `momus` | Opus | Critical plan review, find flaws |
| `metis` | Opus | Pre-planning analysis, hidden requirements |
| `prometheus` | Opus | Strategic planning, interview workflow |
| `sisyphus-junior` | Sonnet | Focused task execution (no delegation) |
| `orchestrator-sisyphus` | Sonnet | Todo coordination |

**Total:** 11 specialized agents
**Provider:** Anthropic only (Claude models)

### oh-my-opencode's Agent Lineup

| Agent | Model | Purpose |
|-------|-------|---------|
| **Sisyphus** | Claude Opus 4.5 | Primary orchestrator with extended thinking (32k) |
| **Oracle** | GPT-5.2 | Architecture, debugging, strategic reasoning |
| **Librarian** | GLM-4.7-Free | Multi-repo analysis, documentation lookup |
| **Explore** | Grok Code/Gemini 3 Flash | Fast codebase exploration |
| **Frontend-UI-UX-Engineer** | Gemini 3 Pro | Beautiful UI development |
| **Document-Writer** | Gemini 3 Flash | Technical prose generation |
| **Multimodal-Looker** | Gemini 3 Flash | Visual content analysis (PDF/images) |
| **Prometheus** | Claude Opus 4.5 | Strategic planning |
| **Metis** | Claude Sonnet 4.5 | Pre-planning analysis |
| **Momus** | Claude Sonnet 4.5 | Plan validation |

**Total:** 10 specialized agents
**Providers:** Multi-model (Anthropic, OpenAI, Google, xAI)

**Key Difference:**
- We use single provider (Anthropic) with model tiers
- They use multi-provider routing by task strength

---

## 4. Orchestration Approach

### Our Delegation Pattern

**Style:** Sequential-first with optional parallelization

**Example Workflow:**
```markdown
# Step 1: Create todos
TodoWrite([
  { content: "Research codebase", status: "pending" },
  { content: "Implement feature", status: "pending" },
  { content: "Write tests", status: "pending" }
])

# Step 2: Delegate to agents
Task(
  subagent_type: "explore",
  prompt: "Find all authentication-related files"
)

# Step 3: Wait for completion
# (automatic - no explicit wait needed)

# Step 4: Next agent
Task(
  subagent_type: "oracle",
  prompt: "Analyze security implications of auth flow"
)

# For parallel execution:
Task(subagent_type: "frontend-engineer", ..., run_in_background: true)
Task(subagent_type: "document-writer", ..., run_in_background: true)
# Then check results with TaskOutput
```

**Characteristics:**
- Task tool with explicit `subagent_type`
- Sequential by default
- Manual parallelization via `run_in_background: true`
- TodoWrite for task tracking
- Simple, straightforward

### oh-my-opencode's Delegation Pattern

**Style:** Parallel-first with category-based routing

**Example Workflow:**
```typescript
// Phase 0: Intent Gating
if (matchesSkillTrigger(request)) {
  invokeSkill();
  return;
}

// Phase 1: Request Classification
const type = classifyRequest(request);
// Types: Trivial, Explicit, Exploratory, Open-ended, GitHub Work, Ambiguous

// Phase 2: Pre-Delegation Protocol (MANDATORY)
/*
 Declare:
 1. Task category/agent selection
 2. Reasoning for that choice
 3. Required skills
 4. Expected outcomes
*/

// Phase 3: Parallel Delegation via sisyphus_task
sisyphus_task({
  category: "exploration",  // 7 mandatory sections
  agents: ["explore", "librarian"],
  parallel: true,
  resume: previousSessionId  // Resume with preserved context
});

// Phase 4: Background Collection
const results = await background_output(task_ids);

// Phase 5: Implementation with extended thinking
// (32k token budget for complex reasoning)
```

**Characteristics:**
- `sisyphus_task` tool (not generic Task tool)
- 7 mandatory delegation sections
- Parallel by default
- Resume capability (preserve agent context)
- Pre-delegation protocol (declare intent first)
- Automatic background orchestration
- 504-line system prompt with decision trees

**Key Difference:**
- We delegate explicitly; they delegate by category
- We're sequential-first; they're parallel-first
- We use simple Task tool; they use specialized sisyphus_task

---

## 5. Commands & Activation

### Our Commands

| Command | What It Does |
|---------|-------------|
| `/sisyphus <task>` | Activate Sisyphus orchestration mode |
| `/sisyphus-default` | Set Sisyphus as default for all sessions |
| `/orchestrator <task>` | Orchestrator-Sisyphus (master coordinator) |
| `/ultrawork <task>` | Maximum performance with aggressive parallelization |

**Activation Method:**
- Explicit slash commands
- Magic keywords in CLAUDE.md ("ultrawork", "search", "analyze")
- User invokes directly

### oh-my-opencode's Activation

| Method | How It Works |
|--------|--------------|
| **Always Active** | Sisyphus is the default primary agent |
| **Automatic Skill Detection** | Phase 0 checks for skill triggers |
| **Keyword Detection** | "ultrawork", "search", "analyze" auto-activate modes |
| **@-mentions** | "@oracle", "@librarian" invoke agents directly |

**Activation Method:**
- Always running (no explicit activation needed)
- Automatic intent gating (Phase 0)
- User mentions agents directly

**Key Difference:**
- We require explicit activation
- They're always active by default

---

## 6. Features Comparison

### Features Both Have

✅ Multi-agent delegation
✅ Specialized subagents (oracle, librarian, explore, etc.)
✅ Background task execution
✅ Continuation enforcement (must complete all tasks)
✅ Verification checklist before stopping
✅ Strategic planning (Prometheus)
✅ Plan review (Momus)
✅ Pre-planning analysis (Metis)

### Features Only We Have

**Skill Composition System:**
```
[Execution Layer] + [Enhancement Layer] + [Guarantee Layer]
- sisyphus (execution)
- + ultrawork (enhancement)
- + ralph-loop (guarantee completion)
```

**Simple Installation:**
- One-liner: `curl -fsSL https://... | sh`
- Auto-detects existing plugins
- No complex dependencies

**Claude Code Native:**
- Works seamlessly with existing Claude Code
- Plugin-based (doesn't replace)
- Markdown configuration (human-readable)

### Features Only They Have

**Multi-Model Orchestration:**
- GPT-5.2 for logical reasoning
- Gemini 3 Pro for creative UI
- GLM-4.7 for documentation
- Grok Code for fast search
- Strategic routing by model strengths

**Extended Thinking:**
- 32k token budget for Sisyphus
- Configurable reasoning depth
- Pre-delegation protocol (declare intent)

**11+ LSP Tools:**
- Rename across codebase
- Code actions (extract, inline, refactor)
- Real-time diagnostics
- Symbol search

**AST-Grep Integration:**
- Pattern-aware code search
- Structural refactoring
- Semantic code manipulation

**Hook System:**
```typescript
{
  PreToolUse: (tool) => {
    // Validation before tool execution
  },
  PostToolUse: (result) => {
    // Process results, truncate verbose output
  },
  Stop: () => {
    // Cleanup, cancel background tasks
  }
}
```

**Session Persistence:**
- Automatic transcript saving
- Resume agents with full context
- Recovery from failures
- Session compaction at 85% context

**Advanced Context Management:**
- AGENTS.md auto-discovery (walk file → root)
- `look_at` tool (delegate reading to preserve tokens)
- Smart context injection
- Preemptive compaction

**Temperature Control:**
- Enforced ≤0.3 for code agents
- Per-agent temperature configuration

**Todo Continuation Enforcer:**
- Prevents quitting halfway
- Automatic reminders for incomplete tasks
- System-level enforcement

**Comment Checker:**
- Demands justification for excessive comments
- Keeps generated code human-readable

**Tmux Integration:**
- Interactive bash sessions
- Persistent terminal state

**Testing Infrastructure:**
- 82 test files
- 2,559+ assertions
- TDD workflow (RED-GREEN-REFACTOR)
- BDD-style test comments

---

## 7. Technical Comparison

| Dimension | Our Sisyphus | oh-my-opencode Sisyphus |
|-----------|--------------|------------------------|
| **Implementation** | Markdown (~400 lines) | TypeScript (1,486 lines) |
| **Platform** | Claude Code plugin | OpenCode platform |
| **Configuration** | Markdown frontmatter | oh-my-opencode.json + TypeScript |
| **Agent Definition** | Human-readable markdown | Programmatic TypeScript |
| **Model Support** | Anthropic only | Multi-provider |
| **Extended Thinking** | Basic (Claude default) | 32k token budget |
| **Delegation Tool** | Generic `Task` tool | Specialized `sisyphus_task` |
| **Delegation Style** | Sequential-first | Parallel-first |
| **Background Execution** | Manual (`run_in_background`) | Automatic orchestration |
| **Resume Capability** | ❌ None | ✅ Preserve context |
| **LSP Integration** | ❌ None | ✅ 11+ tools |
| **AST-Grep** | ❌ None | ✅ Pattern-aware search |
| **Hook System** | ❌ None | ✅ Pre/Post/Stop hooks |
| **Session Recovery** | Basic | Advanced persistence |
| **Context Management** | Manual file references | AGENTS.md auto-discovery |
| **Temperature Control** | Model defaults | Enforced per agent |
| **Installation** | 30 seconds (curl) | 2 minutes (npm/bun) |
| **Dependencies** | Claude Code only | Bun runtime + tooling |
| **Activation** | Explicit (/sisyphus) | Always active |
| **Test Coverage** | N/A (plugin) | 82 files, 2,559+ assertions |

---

## 8. Workflow Example Comparison

### Scenario: "Fix the authentication bug"

**Our Sisyphus Workflow:**

```
User: /sisyphus "Fix the authentication bug"

[SISYPHUS MODE ACTIVATED]

Step 1: Break down task
TodoWrite([
  { content: "Search for auth-related files", status: "pending" },
  { content: "Identify bug location", status: "pending" },
  { content: "Implement fix", status: "pending" },
  { content: "Test the fix", status: "pending" }
])

Step 2: Delegate to explore agent
Task(
  subagent_type: "explore",
  description: "Search for auth files",
  prompt: "Find all authentication-related files in the codebase"
)
→ Returns: [auth.ts, login.tsx, session.ts]

Step 3: Mark first todo complete, start second
TodoWrite([
  { content: "Search for auth-related files", status: "completed" },
  { content: "Identify bug location", status: "in_progress" },
  ...
])

Step 4: Analyze files directly (Sisyphus reads them)
Read(auth.ts)
Read(login.tsx)
→ Identifies bug in auth.ts:42

Step 5: Implement fix
Edit(auth.ts, old_string: "...", new_string: "...")

Step 6: Run tests
Bash("npm test", run_in_background: false)
→ Tests pass

Step 7: Mark all todos complete
TodoWrite([all completed])

✅ Task complete!
```

**oh-my-opencode's Sisyphus Workflow:**

```
User: "Fix the authentication bug"

[Sisyphus always active - no activation needed]

// Phase 0: Intent Gating
Check skill triggers... no match, proceed to Phase 1

// Phase 1: Request Classification
Type: "Open-ended" (requires exploration + implementation)
Complexity: Multi-step

// Phase 2: Pre-Delegation Protocol
Declare intent:
"I will delegate exploration to fast agents (explore + librarian)
to identify the bug location, then implement the fix myself
using extended thinking for complex logic."

// Phase 3: Parallel Exploration
sisyphus_task({
  category: "exploration",
  agents: [
    { type: "explore", model: "grok-code" },
    { type: "librarian", model: "glm-4.7" }
  ],
  parallel: true,
  tasks: [
    "Search codebase for auth-related files",
    "Find documentation on auth implementation"
  ]
});

// (Both agents run in background)

// Phase 4: Collect Results
const results = await background_output([task1_id, task2_id]);
→ explore found: [auth.ts, login.tsx, session.ts]
→ librarian found: [auth-docs.md, security-guidelines.md]

// Phase 5: Extended Thinking (32k budget)
Analyze with deep reasoning...
→ Identifies bug in auth.ts:42
→ Security implications analyzed
→ Edge cases considered

// Phase 6: Implementation
Edit(auth.ts, ...)

// Phase 7: LSP Diagnostics (automatic)
lsp_diagnostics(auth.ts)
→ No type errors

// Phase 8: Verification
Bash("npm test")
→ Tests pass

// Phase 9: Cleanup Hook (automatic)
Stop hook:
  - Cancel all background tasks
  - Save session transcript
  - Clear temporary context

✅ Task complete!
```

**Key Differences:**
- **Ours:** Sequential, explicit todos, manual coordination
- **Theirs:** Parallel-first, automatic orchestration, built-in hooks

---

## 9. Orchestration Patterns

### Our Pattern (from protocols/orchestration-patterns.md)

**Sequential Pattern:**
```markdown
Write(handoff.md)
Task(subagent_type: "agent1", ...)
Read(marker-complete.yaml)
Task(subagent_type: "agent2", ...)
```

**Parallel Pattern:**
```markdown
Write(handoff1.md)
Write(handoff2.md)
Task(agent1, run_in_background: true)
Task(agent2, run_in_background: true)
Bash("while [[ ! -f marker1 ]] || [[ ! -f marker2 ]]; do sleep 30; done")
Read(marker1.yaml)
Read(marker2.yaml)
```

**Characteristics:**
- Explicit marker files for synchronization
- Manual polling for completion
- File-based coordination
- Simple, transparent

### Their Pattern (from sisyphus.ts)

**Category-Based Delegation:**
```typescript
// 7 Mandatory Delegation Sections:
1. Exploration (codebase understanding)
2. Research (external documentation)
3. Planning (strategic approach)
4. Implementation (code changes)
5. Testing (verification)
6. Documentation (updates)
7. Review (quality check)

// Delegation via sisyphus_task:
sisyphus_task({
  section: 1,  // Exploration
  category: "exploration",
  agents: ["explore", "librarian"],
  parallel: true,
  resume: session_id,  // Resume with context
  timeout: 300
});
```

**Characteristics:**
- Category-based routing (7 sections)
- Built-in parallelization
- Resume capability
- Automatic synchronization
- No manual polling needed

**Key Difference:**
- We coordinate via files; they coordinate via internal state
- We poll; they await
- We're explicit; they're implicit

---

## 10. Philosophy & Design Goals

### Our Philosophy

**Goal:** Make multi-agent orchestration accessible via Claude Code

**Design Principles:**
1. **Simplicity First** - Markdown over code
2. **Explicit > Implicit** - Clear activation, visible coordination
3. **Plugin, Not Platform** - Enhance, don't replace
4. **Human-Readable** - Markdown configs anyone can edit
5. **Easy Installation** - One-liner setup
6. **Single Provider** - Leverage Anthropic's model tiers

**Target User:** Claude Code users who want multi-agent capabilities

**Value Prop:** "Add Sisyphus orchestration to your Claude Code with one command"

### Their Philosophy

**Goal:** Build the best agent harness possible

**Design Principles:**
1. **Power First** - TypeScript for maximum control
2. **Implicit > Explicit** - Automatic orchestration, smart defaults
3. **Platform Replacement** - Complete OpenCode fork
4. **Programmatic** - TypeScript configs for flexibility
5. **Advanced Tooling** - LSP, AST-Grep, hooks
6. **Multi-Provider** - Use best model for each task

**Target User:** Power users who want maximum capabilities

**Value Prop:** "The best agent harness. Mix and match models. Orchestrate by purpose."

**Key Difference:**
- We optimize for **accessibility**
- They optimize for **capability**

---

## 11. Strengths & Weaknesses

### Our Sisyphus Strengths

✅ **Simple to Install** - One-liner, no dependencies
✅ **Easy to Understand** - Markdown configs, visible patterns
✅ **Claude Code Native** - Works with existing workflows
✅ **Explicit Control** - Clear activation, predictable behavior
✅ **Low Maintenance** - No complex tooling to manage
✅ **Quick to Customize** - Edit markdown files directly
✅ **Transparent Orchestration** - TodoWrite shows progress

### Our Sisyphus Weaknesses

❌ **No Multi-Model Support** - Anthropic only
❌ **No LSP Tools** - Can't rename/refactor across files
❌ **No AST-Grep** - Pattern-aware search unavailable
❌ **Limited Extended Thinking** - Uses Claude defaults
❌ **Manual Parallelization** - Requires explicit flags
❌ **No Resume** - Can't preserve agent context
❌ **No Hooks** - Can't intercept tool calls
❌ **Basic Session Recovery** - Relies on marker files

### Their Sisyphus Strengths

✅ **Multi-Model Power** - GPT, Claude, Gemini, Grok
✅ **Advanced Tooling** - LSP, AST-Grep, refactoring
✅ **Extended Thinking** - 32k token budget
✅ **Automatic Orchestration** - Parallel-first, smart routing
✅ **Resume Capability** - Preserve agent context
✅ **Hook System** - Intercept and process tool calls
✅ **Advanced Recovery** - Session persistence, auto-retry
✅ **Production-Grade** - 2,559+ test assertions

### Their Sisyphus Weaknesses

❌ **Complex Installation** - Bun runtime, dependencies
❌ **Steep Learning Curve** - TypeScript, hooks, config
❌ **Platform Lock-In** - Must use oh-my-opencode
❌ **Opaque Behavior** - Automatic decisions may surprise
❌ **Higher Maintenance** - More moving parts to manage
❌ **Cost Management** - Multi-model usage harder to predict

---

## 12. When to Use Which?

### Use Our Sisyphus If:

✅ You're a Claude Code user who wants multi-agent orchestration
✅ You prefer simplicity and transparency
✅ You want explicit control over agent invocation
✅ You're happy with Anthropic models (Opus/Sonnet/Haiku)
✅ You need quick installation (30 seconds)
✅ You want to customize via markdown
✅ You value visible task tracking (TodoWrite)

**Best For:** Adding orchestration to existing Claude Code workflows

### Use oh-my-opencode's Sisyphus If:

✅ You're a power user who wants maximum capabilities
✅ You need multi-model orchestration (GPT, Gemini, Grok, etc.)
✅ You want advanced tooling (LSP, AST-Grep)
✅ You need extended thinking (32k budget)
✅ You prefer automatic parallel execution
✅ You want session persistence and recovery
✅ You're willing to invest in platform setup
✅ You need programmatic hooks and customization

**Best For:** Building a production-grade multi-model agent platform

---

## 13. Convergence Opportunities

### What We Could Learn From Them

1. **Multi-Model Support**
   - Add GPT/Gemini for specialized tasks
   - Cost optimization through smart routing
   - Model selection by task type

2. **Enhanced Delegation**
   - Category-based routing (7 sections)
   - Built-in parallelization
   - Resume capability for agents

3. **Extended Thinking Configuration**
   - Configurable reasoning budget
   - Pre-delegation protocol

4. **LSP Integration**
   - Rename across files
   - Code actions (extract, inline)
   - Real-time diagnostics

5. **Hook System**
   - PreToolUse validation
   - PostToolUse processing
   - Stop cleanup handlers

6. **Better Session Management**
   - Automatic transcript saving
   - Recovery from failures
   - Context compaction

### What They Could Learn From Us

1. **Skill Composition**
   - Layer-based skill stacking
   - Composable behavioral enhancements
   - Intelligent skill activation

2. **Explicit Task Tracking**
   - TodoWrite for visible progress
   - User-facing task status
   - Clear completion criteria

3. **Simplified Installation**
   - Plugin-based architecture
   - One-liner installation
   - No complex dependencies

4. **Human-Readable Configuration**
   - Markdown over TypeScript
   - Easier customization for non-programmers
   - Lower barrier to entry

---

## 14. Code Size Comparison

| Component | Our Implementation | oh-my-opencode |
|-----------|-------------------|----------------|
| **Core Agent** | ~70 lines (SKILL.md) | 1,486 lines (sisyphus.ts) |
| **Commands** | ~100 lines (4 files) | Built into agent |
| **Orchestration Patterns** | ~200 lines (patterns.md) | Embedded in code |
| **Total Sisyphus Code** | ~400 lines (markdown) | ~1,500+ lines (TypeScript) |
| **Supporting Infrastructure** | Claude Code SDK | 5,000+ lines (platform) |

**Ratio:** They have ~4x more code for Sisyphus core alone

**Why the Difference?**
- They include 504-line system prompt generation
- Hook system implementation
- Session management code
- LSP tool integration
- Multi-model routing logic
- Recovery mechanisms

---

## 15. Real-World Usage

### Our Sisyphus in Action

```bash
# Terminal
$ claude

> /sisyphus "Refactor the authentication module"

[SISYPHUS MODE ACTIVATED]

Creating todos for this task...
✓ Created 4 todos

[1/4] Searching for auth files...
  Delegating to explore agent...
  ✓ Found 8 authentication-related files

[2/4] Analyzing current architecture...
  Delegating to oracle agent...
  ✓ Identified 3 security concerns

[3/4] Implementing refactoring...
  Reading auth.ts...
  Editing auth.ts...
  Editing session.ts...
  ✓ Refactored 3 files

[4/4] Running tests...
  $ npm test
  ✓ All tests pass

✅ All tasks complete! Authentication module refactored.
```

**User Experience:**
- Clear progress tracking
- Visible agent delegation
- Explicit completion markers
- Transparent workflow

### oh-my-opencode's Sisyphus in Action

```bash
# Terminal
$ omo

> "Refactor the authentication module"

Classifying request... Open-ended (refactoring)

Pre-delegation: Will explore codebase with fast agents,
consult Oracle for architecture, then implement with
extended thinking.

Spawning explore (grok-code) + librarian (glm-4.7)...
⏳ Background tasks running...

Collecting exploration results...
  • explore: Found 8 auth files
  • librarian: Found security best practices

Consulting Oracle (GPT-5.2) for architectural review...
  • Identified 3 security concerns
  • Recommended pattern: Strategy + Factory

Implementing with extended thinking (32k budget)...
  [Deep reasoning about auth patterns...]
  • Refactored auth.ts
  • Updated session.ts
  • Added auth-strategy.ts

Running LSP diagnostics...
  ✓ No type errors

Running tests...
  ✓ All pass

Session saved. Transcript available for resume.

✅ Complete! Authentication refactored to Strategy pattern.
```

**User Experience:**
- Automatic orchestration
- Parallel execution (faster)
- Deep reasoning visible
- Production-grade quality checks

**Key Difference:**
- Ours shows todos being checked off (explicit progress)
- Theirs shows intelligent orchestration (automatic optimization)

---

## 16. Conclusion

### Our Sisyphus (Claude Code Plugin)

**Nature:** Markdown-based plugin for Claude Code
**Philosophy:** Accessible multi-agent orchestration
**Strength:** Simplicity, transparency, easy customization
**Weakness:** Limited to Claude models, manual parallelization
**Best For:** Claude Code users wanting orchestration capabilities
**Installation:** 30 seconds
**Customization:** Edit markdown files
**Mental Model:** "Add multi-agent mode to Claude Code"

### oh-my-opencode's Sisyphus (Platform)

**Nature:** TypeScript-based platform replacement
**Philosophy:** Maximum capabilities through multi-model orchestration
**Strength:** Advanced tooling, automatic parallelization, production-grade
**Weakness:** Complex setup, steeper learning curve
**Best For:** Power users building production agent systems
**Installation:** 2 minutes + dependencies
**Customization:** TypeScript configuration
**Mental Model:** "Complete agent platform with multi-model intelligence"

---

## The Relationship

**They are complementary, not competing:**

```
┌─────────────────────────────────────────┐
│         oh-my-opencode Sisyphus         │
│                                         │
│  • Original implementation              │
│  • TypeScript platform                  │
│  • Multi-model orchestration            │
│  • Advanced tooling (LSP, AST-Grep)     │
│  • Production-grade infrastructure      │
│                                         │
│  Goal: Build the best agent harness     │
└─────────────────┬───────────────────────┘
                  │
                  │ Concepts & Philosophy
                  │ Inspiration
                  ↓
┌─────────────────────────────────────────┐
│         Our Sisyphus (SPC)              │
│                                         │
│  • Claude Code adaptation               │
│  • Markdown plugin                      │
│  • Single-provider (Anthropic)          │
│  • Simplified orchestration             │
│  • Accessible to more users             │
│                                         │
│  Goal: Bring Sisyphus to Claude Code    │
└─────────────────────────────────────────┘
```

**Both serve the same mission:** Better AI-powered development through intelligent agent orchestration.

**Key Takeaway:** We ported the Sisyphus philosophy to Claude Code with a focus on accessibility. They built a comprehensive platform for maximum capabilities. Different tools for different needs, both valuable.

---

## Sources

- [oh-my-opencode GitHub Repository](https://github.com/code-yeongyu/oh-my-opencode)
- [oh-my-opencode Sisyphus Implementation (TypeScript)](https://github.com/code-yeongyu/oh-my-opencode/blob/dev/src/agents/sisyphus.ts)
- [oh-my-opencode Agent Definitions](https://github.com/code-yeongyu/oh-my-opencode/blob/dev/AGENTS.md)
- [Sisyphus Orchestrator Documentation](https://deepwiki.com/code-yeongyu/oh-my-opencode/4.1-sisyphus-orchestrator)
- [Oh My OpenCode Official Website](https://ohmyopencode.com/)
- [Oh-My-Claude-Sisyphus (Claude Code Port)](https://github.com/Yeachan-Heo/oh-my-claude-sisyphus)
- [Vibe Sparking AI: Oh My OpenCode Review](https://www.vibesparking.com/en/blog/ai/claude-code/2026-01-04-oh-my-opencode-claude-code-on-steroids/)

---

**Document Version:** 2.0 (Focused on Sisyphus only)
**Last Updated:** 2026-01-15
**Author:** Research conducted via /deepsearch
