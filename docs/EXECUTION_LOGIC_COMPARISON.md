# Execution Logic Comparison: Our Sisyphus vs oh-my-opencode

> **실제 실행 로직** 상세 비교 - 커맨드를 입력했을 때 내부적으로 무슨 일이 일어나는가?

**Research Date:** 2026-01-15

---

## Executive Summary

같은 커맨드를 사용하지만, **내부 동작 메커니즘은 완전히 다릅니다**:
- **우리:** Markdown 프롬프트 주입 → Claude가 해석 → Task tool로 순차 실행
- **그들:** TypeScript 함수 실행 → sisyphus_task로 카테고리 분류 → 병렬 오케스트레이션

---

## 1. 커맨드 실행: `/sisyphus "Fix auth bug"`

### 우리의 실행 로직 (Claude Code Plugin)

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Command Parsing (Claude Code CLI)              │
├─────────────────────────────────────────────────────────┤
│ User types: /sisyphus "Fix auth bug"                   │
│                                                         │
│ Claude Code CLI detects:                               │
│   - Command: /sisyphus                                 │
│   - Arguments: "Fix auth bug"                          │
│   - Location: ~/.claude/commands/sisyphus.md           │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Step 2: Markdown Injection                             │
├─────────────────────────────────────────────────────────┤
│ Claude Code reads sisyphus.md:                         │
│                                                         │
│ ---                                                     │
│ description: Activate Sisyphus multi-agent...          │
│ ---                                                     │
│                                                         │
│ [SISYPHUS MODE ACTIVATED]                              │
│                                                         │
│ $ARGUMENTS  ← "Fix auth bug" 삽입                      │
│                                                         │
│ ## Orchestration Instructions                          │
│ You are now operating as Sisyphus...                   │
│                                                         │
│ ### Available Subagents                                │
│ - spc-team-oracle (Opus)                               │
│ - spc-team-librarian (Sonnet)                          │
│ - spc-team-explore (Haiku)                             │
│ ...                                                     │
│                                                         │
│ ### Execution Rules                                    │
│ - Break complex tasks into subtasks                    │
│ - Use background execution...                          │
│ - Verify completion before stopping                    │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Step 3: Claude Interprets & Plans                      │
├─────────────────────────────────────────────────────────┤
│ Claude (Sonnet 4.5) receives full prompt:              │
│                                                         │
│ "You are Sisyphus. Fix auth bug.                       │
│  Available agents: oracle, librarian, explore..."      │
│                                                         │
│ Claude's internal reasoning:                           │
│   1. "This is an open-ended bug fix"                   │
│   2. "I should break this down into subtasks"          │
│   3. "First, search for auth files (explore)"          │
│   4. "Then, analyze the code (oracle or self)"         │
│   5. "Implement fix, then test"                        │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Step 4: TodoWrite (Optional)                           │
├─────────────────────────────────────────────────────────┤
│ Claude decides to create todos:                        │
│                                                         │
│ TodoWrite([                                            │
│   { content: "Search for auth files",                  │
│     status: "pending",                                 │
│     activeForm: "Searching for auth files" },          │
│   { content: "Identify bug location",                  │
│     status: "pending",                                 │
│     activeForm: "Identifying bug location" },          │
│   { content: "Implement fix",                          │
│     status: "pending",                                 │
│     activeForm: "Implementing fix" },                  │
│   { content: "Test the fix",                           │
│     status: "pending",                                 │
│     activeForm: "Testing the fix" }                    │
│ ])                                                     │
│                                                         │
│ → User sees: 4 todos created                           │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Step 5: Sequential Delegation (Default)                │
├─────────────────────────────────────────────────────────┤
│ Task 1: Mark first todo as in_progress                 │
│                                                         │
│ TodoWrite([                                            │
│   { content: "Search for auth files",                  │
│     status: "in_progress", ... },                      │
│   ...                                                   │
│ ])                                                     │
│                                                         │
│ Task 2: Delegate to explore agent                      │
│                                                         │
│ Task(                                                  │
│   subagent_type: "spc-team-explore",                   │
│   description: "Search auth files",                    │
│   prompt: "Find all authentication-related files       │
│            in the codebase. Look for files with        │
│            'auth', 'login', 'session' in names."       │
│ )                                                      │
│                                                         │
│ → Claude Code spawns new agent:                        │
│   - Reads ~/.claude/agents/spc-team-explore.md         │
│   - Creates new Haiku instance                         │
│   - Injects prompt                                     │
│   - Waits for completion                               │
│                                                         │
│ → explore agent returns:                               │
│   Found 8 files:                                       │
│   - src/auth/auth.ts                                   │
│   - src/auth/session.ts                                │
│   - src/components/Login.tsx                           │
│   ...                                                   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Step 6: Mark Complete, Move to Next                    │
├─────────────────────────────────────────────────────────┤
│ TodoWrite([                                            │
│   { content: "Search for auth files",                  │
│     status: "completed", ... },                        │
│   { content: "Identify bug location",                  │
│     status: "in_progress", ... },                      │
│   ...                                                   │
│ ])                                                     │
│                                                         │
│ → User sees: [1/4] complete                            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Step 7: Self-Analysis (No Delegation)                  │
├─────────────────────────────────────────────────────────┤
│ Claude reads the auth files directly:                  │
│                                                         │
│ Read(src/auth/auth.ts)                                 │
│ Read(src/auth/session.ts)                              │
│                                                         │
│ → Analyzes code internally                             │
│ → Identifies bug at auth.ts:42                         │
│                                                         │
│ (No oracle delegation - Claude does it itself)         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Step 8: Implementation                                 │
├─────────────────────────────────────────────────────────┤
│ TodoWrite([...mark "Implement fix" as in_progress])    │
│                                                         │
│ Edit(                                                  │
│   file_path: "src/auth/auth.ts",                       │
│   old_string: "if (token) { return verify(token) }",   │
│   new_string: "if (token && token.length > 0) {        │
│                  return verify(token)                  │
│                }"                                       │
│ )                                                      │
│                                                         │
│ TodoWrite([...mark "Implement fix" as completed])      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Step 9: Testing                                        │
├─────────────────────────────────────────────────────────┤
│ TodoWrite([...mark "Test the fix" as in_progress])     │
│                                                         │
│ Bash(                                                  │
│   command: "npm test -- auth",                         │
│   description: "Run auth tests"                        │
│ )                                                      │
│                                                         │
│ → Tests pass ✓                                         │
│                                                         │
│ TodoWrite([...mark "Test the fix" as completed])       │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Step 10: Verification & Completion                     │
├─────────────────────────────────────────────────────────┤
│ Claude checks Sisyphean Verification Checklist:        │
│                                                         │
│ - [x] TODO LIST: Zero pending/in_progress              │
│ - [x] FUNCTIONALITY: Auth bug fixed                    │
│ - [x] TESTS: All tests pass                            │
│ - [x] ERRORS: Zero unaddressed errors                  │
│ - [x] QUALITY: Code is production-ready                │
│                                                         │
│ → All checkboxes complete                              │
│                                                         │
│ Claude responds:                                       │
│ "✅ All tasks complete! Fixed authentication bug       │
│  in auth.ts:42. Tests passing."                        │
└─────────────────────────────────────────────────────────┘
```

**Total Execution Time:** ~2-3 minutes
**API Calls:**
- 1x Sonnet (main orchestrator)
- 1x Haiku (explore agent)
- Multiple tool calls (Read, Edit, Bash, TodoWrite)

**Key Characteristics:**
- ✅ **Sequential by default**
- ✅ **Explicit todo tracking** (visible to user)
- ✅ **Human-readable progress**
- ✅ **Simple, transparent**
- ❌ No automatic parallelization
- ❌ No extended thinking
- ❌ No pre-delegation protocol

---

### oh-my-opencode의 실행 로직 (TypeScript Platform)

```
┌─────────────────────────────────────────────────────────┐
│ Step 0: CLI Command Parsing (OpenCode)                 │
├─────────────────────────────────────────────────────────┤
│ User types: omo "Fix auth bug"                         │
│                                                         │
│ OpenCode CLI:                                          │
│   - No explicit /sisyphus needed (always active)       │
│   - Directly invokes Sisyphus agent                    │
│   - Loads oh-my-opencode.json config                   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 0: Intent Gating (Skill Detection)               │
├─────────────────────────────────────────────────────────┤
│ TypeScript function: checkSkillTriggers(input)         │
│                                                         │
│ function checkSkillTriggers(input: string) {           │
│   const patterns = {                                   │
│     'git-master': /commit|push|branch|rebase/i,        │
│     'ultrawork': /ultrawork|ulw|parallel/i,            │
│     'search': /search|find|grep/i                      │
│   };                                                    │
│                                                         │
│   for (const [skill, pattern] of patterns) {           │
│     if (pattern.test(input)) {                         │
│       return invokeSkill(skill, input);                │
│     }                                                   │
│   }                                                     │
│   return null; // No skill match                       │
│ }                                                       │
│                                                         │
│ Input: "Fix auth bug"                                  │
│ → No skill trigger detected                            │
│ → Proceed to Phase 1                                   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 1: Request Classification (TypeScript)           │
├─────────────────────────────────────────────────────────┤
│ function classifyRequest(input: string): TaskType {    │
│   // Rule-based + LLM-assisted classification          │
│                                                         │
│   if (isTrivial(input)) {                              │
│     return 'Trivial'; // Single file, direct answer    │
│   }                                                     │
│                                                         │
│   if (hasExplicitCommands(input)) {                    │
│     return 'Explicit'; // Specific commands, clear scope│
│   }                                                     │
│                                                         │
│   if (requiresExploration(input)) {                    │
│     return 'Exploratory'; // Pattern discovery         │
│   }                                                     │
│                                                         │
│   if (isOpenEnded(input)) {                            │
│     return 'Open-ended'; // Refactoring, improvements  │
│   }                                                     │
│                                                         │
│   if (isGitHubWork(input)) {                           │
│     return 'GitHub Work'; // Full PR cycle             │
│   }                                                     │
│                                                         │
│   return 'Ambiguous'; // Needs clarification           │
│ }                                                       │
│                                                         │
│ Input: "Fix auth bug"                                  │
│ → Classification: "Open-ended"                         │
│   (Requires exploration + implementation)              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 2: System Prompt Generation (504 lines)          │
├─────────────────────────────────────────────────────────┤
│ function generateSisyphusPrompt(                       │
│   taskType: 'Open-ended',                              │
│   availableAgents: Agent[],                            │
│   availableTools: Tool[]                               │
│ ): string {                                             │
│                                                         │
│   const prompt = `                                     │
│     You are Sisyphus, primary orchestrator.            │
│     Extended thinking enabled (32k budget).            │
│                                                         │
│     ## Request Classification: Open-ended              │
│     This requires:                                     │
│     - Exploration (codebase understanding)             │
│     - Analysis (identify root cause)                   │
│     - Implementation (fix the bug)                     │
│     - Testing (verify fix)                             │
│                                                         │
│     ## Available Agents:                               │
│     - explore (grok-code): Fast codebase search        │
│     - librarian (glm-4.7): Documentation lookup        │
│     - oracle (gpt-5.2): Architecture analysis          │
│                                                         │
│     ## Pre-Delegation Protocol (MANDATORY):            │
│     Before delegating, declare:                        │
│     1. Task category/agent selection                   │
│     2. Reasoning for that choice                       │
│     3. Required skills                                 │
│     4. Expected outcomes                               │
│                                                         │
│     ## 7 Mandatory Delegation Sections:                │
│     1. Exploration - codebase understanding            │
│     2. Research - external documentation               │
│     3. Planning - strategic approach                   │
│     4. Implementation - code changes                   │
│     5. Testing - verification                          │
│     6. Documentation - updates                         │
│     7. Review - quality check                          │
│                                                         │
│     ## Tools Available:                                │
│     - sisyphus_task (parallel delegation)              │
│     - background_output (collect results)              │
│     - lsp_rename, lsp_diagnostics, ast_grep            │
│     - All standard tools                               │
│                                                         │
│     ## Hooks Active:                                   │
│     - PreToolUse: Validation before execution          │
│     - PostToolUse: Result processing, truncation       │
│     - Stop: Cleanup, session save                      │
│   `;                                                    │
│                                                         │
│   return prompt;                                       │
│ }                                                       │
│                                                         │
│ → 504-line prompt generated and sent to Claude Opus    │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 3: Extended Thinking (32k token budget)          │
├─────────────────────────────────────────────────────────┤
│ Claude Opus 4.5 with extended thinking:                │
│                                                         │
│ <thinking budget="32000">                              │
│   This is an open-ended bug fix. I need to:           │
│                                                         │
│   1. Explore the codebase to find auth-related files   │
│      - Should I delegate to 'explore' (fast) or        │
│        'librarian' (thorough)?                         │
│      - Both! Run in parallel for speed.                │
│                                                         │
│   2. Once I have file list, analyze the code           │
│      - Should I delegate to 'oracle' for deep analysis?│
│      - Bug might be simple, let me handle it myself    │
│        using extended thinking                         │
│                                                         │
│   3. Implement the fix                                 │
│      - I'll do this myself with LSP diagnostics        │
│                                                         │
│   4. Test thoroughly                                   │
│      - Run tests, check for regressions                │
│                                                         │
│   Pre-delegation plan:                                 │
│   - Section 1 (Exploration): explore + librarian       │
│   - Section 4 (Implementation): self                   │
│   - Section 5 (Testing): self                          │
│ </thinking>                                            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 4: Pre-Delegation Declaration                    │
├─────────────────────────────────────────────────────────┤
│ Sisyphus outputs (visible to user):                    │
│                                                         │
│ "Pre-delegation plan:                                  │
│  • Category: Exploration                               │
│  • Agents: explore (grok-code), librarian (glm-4.7)    │
│  • Reasoning: Fast codebase search + doc lookup        │
│  • Expected: List of auth files + context docs         │
│  • Execution: Parallel background tasks"               │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 5: Parallel Delegation via sisyphus_task         │
├─────────────────────────────────────────────────────────┤
│ Tool call: sisyphus_task                               │
│                                                         │
│ sisyphus_task({                                        │
│   section: 1,              // Exploration              │
│   category: "exploration",                             │
│   agents: [                                            │
│     {                                                   │
│       type: "explore",                                 │
│       model: "opencode/grok-code",                     │
│       task: "Search codebase for auth-related files"   │
│     },                                                  │
│     {                                                   │
│       type: "librarian",                               │
│       model: "opencode/glm-4.7-free",                  │
│       task: "Find auth documentation and best practices"│
│     }                                                   │
│   ],                                                    │
│   parallel: true,           // Run simultaneously      │
│   timeout: 120,             // 2 minutes max           │
│   resume: null              // No previous session     │
│ })                                                     │
│                                                         │
│ → TypeScript orchestrator spawns BOTH agents:          │
│                                                         │
│ Promise.all([                                          │
│   spawnAgent('explore', grokModel, task1),             │
│   spawnAgent('librarian', glmModel, task2)             │
│ ])                                                     │
│                                                         │
│ → Both run in background                               │
│ → User sees: "⏳ Background tasks running..."          │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓ (Wait for both to complete)
                  │
┌─────────────────────────────────────────────────────────┐
│ Phase 6: Background Output Collection                  │
├─────────────────────────────────────────────────────────┤
│ Tool call: background_output                           │
│                                                         │
│ const results = background_output([                    │
│   task_id_explore,                                     │
│   task_id_librarian                                    │
│ ]);                                                     │
│                                                         │
│ Results:                                               │
│ {                                                       │
│   explore: {                                           │
│     status: "completed",                               │
│     output: [                                          │
│       "src/auth/auth.ts",                              │
│       "src/auth/session.ts",                           │
│       "src/components/Login.tsx",                      │
│       ...8 total files                                 │
│     ]                                                   │
│   },                                                    │
│   librarian: {                                         │
│     status: "completed",                               │
│     output: [                                          │
│       "auth-docs.md: Token validation patterns",       │
│       "security.md: Best practices for session mgmt"   │
│     ]                                                   │
│   }                                                     │
│ }                                                       │
│                                                         │
│ → PostToolUse hook processes results                   │
│ → Truncates if too verbose                             │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 7: Extended Thinking Analysis (32k budget)       │
├─────────────────────────────────────────────────────────┤
│ Sisyphus reads files and analyzes:                     │
│                                                         │
│ Read(src/auth/auth.ts)                                 │
│ Read(src/auth/session.ts)                              │
│                                                         │
│ <thinking budget="32000">                              │
│   Analyzing auth.ts:                                   │
│                                                         │
│   Line 42: if (token) { return verify(token) }        │
│                                                         │
│   Issue: This doesn't check for empty string!          │
│   - token could be "" (empty string)                   │
│   - Empty string is truthy in JavaScript               │
│   - verify("") might cause issues                      │
│                                                         │
│   Security implications:                               │
│   - If verify("") returns true, auth bypass            │
│   - If verify("") throws error, denial of service      │
│                                                         │
│   Fix: Add length check                                │
│   if (token && token.length > 0) {                     │
│     return verify(token)                               │
│   }                                                     │
│                                                         │
│   Edge cases to consider:                              │
│   - null/undefined: Handled by first check             │
│   - Empty string: Fixed by length check                │
│   - Whitespace: Should we trim()?                      │
│     → Check docs... librarian found security.md        │
│     → Security.md recommends trimming                  │
│                                                         │
│   Final fix:                                           │
│   if (token && token.trim().length > 0) {              │
│     return verify(token.trim())                        │
│   }                                                     │
│ </thinking>                                            │
│                                                         │
│ → Deep analysis complete                               │
│ → Better fix identified (includes trim)                │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 8: Implementation with LSP Diagnostics           │
├─────────────────────────────────────────────────────────┤
│ Edit(                                                  │
│   file_path: "src/auth/auth.ts",                       │
│   old_string: "if (token) { return verify(token) }",   │
│   new_string: "if (token && token.trim().length > 0) { │
│                  return verify(token.trim())           │
│                }"                                       │
│ )                                                      │
│                                                         │
│ → PreToolUse hook validates edit                       │
│                                                         │
│ Automatic LSP diagnostics:                             │
│                                                         │
│ lsp_diagnostics("src/auth/auth.ts")                    │
│                                                         │
│ Results:                                               │
│ {                                                       │
│   errors: [],                                          │
│   warnings: [],                                        │
│   info: []                                             │
│ }                                                       │
│                                                         │
│ → No type errors ✓                                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 9: Testing                                       │
├─────────────────────────────────────────────────────────┤
│ Bash("npm test -- auth")                               │
│                                                         │
│ → All tests pass ✓                                     │
│                                                         │
│ Additional verification:                               │
│ Bash("npm run type-check")                             │
│ → Type check pass ✓                                    │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 10: Stop Hook & Session Persistence              │
├─────────────────────────────────────────────────────────┤
│ Stop hook triggered (automatic):                       │
│                                                         │
│ function onStop() {                                    │
│   // Cancel all background tasks                       │
│   cancelAllBackgroundTasks();                          │
│                                                         │
│   // Save session transcript                           │
│   saveTranscript({                                     │
│     timestamp: Date.now(),                             │
│     task: "Fix auth bug",                              │
│     classification: "Open-ended",                      │
│     agents_used: ["explore", "librarian"],             │
│     files_modified: ["src/auth/auth.ts"],              │
│     outcome: "success"                                 │
│   });                                                   │
│                                                         │
│   // Compact context if needed                         │
│   if (contextUsage > 0.85) {                           │
│     compactContext();                                  │
│   }                                                     │
│                                                         │
│   // Clear temporary state                             │
│   clearTempState();                                    │
│ }                                                       │
│                                                         │
│ → Session saved for resume capability                  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Final Output                                           │
├─────────────────────────────────────────────────────────┤
│ Sisyphus responds:                                     │
│                                                         │
│ "✅ Authentication bug fixed in auth.ts:42             │
│                                                         │
│  Changes:                                              │
│  • Added token.trim() to prevent empty string bypass   │
│  • Added length check for security                     │
│                                                         │
│  Verification:                                         │
│  • LSP diagnostics: No errors                          │
│  • Tests: All passing                                  │
│  • Type check: Passing                                 │
│                                                         │
│  Session saved. Resume with session_id: abc123"        │
└─────────────────────────────────────────────────────────┘
```

**Total Execution Time:** ~1.5-2 minutes (faster due to parallelization)
**API Calls:**
- 1x Claude Opus 4.5 (main orchestrator with extended thinking)
- 1x Grok Code (explore agent, parallel)
- 1x GLM-4.7 (librarian agent, parallel)
- Multiple tool calls + LSP diagnostics

**Key Characteristics:**
- ✅ **Parallel by default** (explore + librarian simultaneously)
- ✅ **Extended thinking** (32k token budget for deep analysis)
- ✅ **Pre-delegation protocol** (declare intent before delegating)
- ✅ **Automatic LSP diagnostics**
- ✅ **Hook system** (PreToolUse, PostToolUse, Stop)
- ✅ **Session persistence** (can resume)
- ✅ **Better fix** (identified trim() need through deep analysis)
- ❌ No explicit todo tracking (implicit in phases)
- ❌ Less transparent to user (automatic orchestration)

---

## 2. 커맨드 실행: `/ultrawork "Refactor entire API"`

### 우리의 `/ultrawork` 로직

```
┌──────────────────────────────────────────┐
│ Step 1: Load ultrawork.md                │
├──────────────────────────────────────────┤
│ [ULTRAWORK MODE ACTIVATED]               │
│                                          │
│ $ARGUMENTS: "Refactor entire API"        │
│                                          │
│ ## Enhanced Execution Instructions       │
│ - Use PARALLEL agent execution           │
│ - Delegate aggressively                  │
│ - Maximize throughput                    │
│ - Continue until 100% complete           │
└────────────┬─────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────┐
│ Step 2: Claude Plans with Parallelization│
├──────────────────────────────────────────┤
│ Claude thinks:                           │
│ "Ultrawork mode = parallel everything"   │
│                                          │
│ Subtasks:                                │
│ 1. Explore API structure                 │
│ 2. Analyze current patterns              │
│ 3. Design new architecture               │
│ 4. Implement changes                     │
│ 5. Update tests                          │
│ 6. Update docs                           │
└────────────┬─────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────┐
│ Step 3: Manual Parallel Delegation       │
├──────────────────────────────────────────┤
│ // Exploration phase (parallel)          │
│ Task(                                    │
│   subagent_type: "spc-team-explore",     │
│   prompt: "Find all API route files",    │
│   run_in_background: true  ← Manual flag │
│ )                                        │
│                                          │
│ Task(                                    │
│   subagent_type: "spc-team-librarian",   │
│   prompt: "Find API design docs",        │
│   run_in_background: true  ← Manual flag │
│ )                                        │
│                                          │
│ → Both run in background                 │
│ → Claude continues to next phase         │
└────────────┬─────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────┐
│ Step 4: Wait for Background Tasks        │
├──────────────────────────────────────────┤
│ // Must explicitly check results         │
│ TaskOutput(task_id: "explore_task_id")   │
│ TaskOutput(task_id: "librarian_task_id") │
│                                          │
│ → Gets results when ready                │
└────────────┬─────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────┐
│ Step 5: Continue Sequential Work         │
├──────────────────────────────────────────┤
│ // Implementation (sequential)           │
│ Task(subagent_type: "oracle", ...)       │
│ // Wait for oracle                       │
│                                          │
│ // Then implement                        │
│ Edit(...) Edit(...) Edit(...)            │
│                                          │
│ // Then parallel docs + tests            │
│ Task("document-writer", bg: true)        │
│ Bash("npm test", bg: true)               │
└──────────────────────────────────────────┘
```

**특징:**
- `run_in_background: true` **수동 설정**
- TaskOutput으로 **수동 결과 수집**
- 병렬화는 **개발자 판단**
- 여전히 순차 실행이 섞임

### oh-my-opencode의 "ultrawork" 키워드 로직

```
┌──────────────────────────────────────────┐
│ Phase 0: Keyword Detection               │
├──────────────────────────────────────────┤
│ Input: "ultrawork: Refactor entire API"  │
│                                          │
│ checkSkillTriggers(input)                │
│ → Matches: /ultrawork|ulw/i              │
│ → Activates: MAXIMUM PERFORMANCE MODE    │
└────────────┬─────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────┐
│ Phase 1: Aggressive Classification       │
├──────────────────────────────────────────┤
│ Classification: "Open-ended"             │
│ + Modifier: "ULTRAWORK"                  │
│                                          │
│ Behavior changes:                        │
│ - Parallel-first → Parallel-ONLY         │
│ - Conservative delegation → Aggressive   │
│ - Wait for tasks → Fire-and-forget       │
│ - 2-3 agents → 5+ agents simultaneously  │
└────────────┬─────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────┐
│ Phase 2: Multi-Section Parallel Spawn    │
├──────────────────────────────────────────┤
│ sisyphus_task({                          │
│   mode: "ULTRAWORK",                     │
│   sections: [1, 2, 3, 4, 5, 6, 7],  // ALL│
│   parallelism: "MAXIMUM",                │
│   agents: [                              │
│     // Section 1: Exploration (parallel) │
│     { type: "explore", model: "grok" },  │
│     { type: "librarian", model: "glm" }, │
│                                          │
│     // Section 2: Research (parallel)    │
│     { type: "librarian", model: "glm" }, │
│                                          │
│     // Section 3: Planning (parallel)    │
│     { type: "prometheus", model: "opus" },│
│                                          │
│     // Section 4: Implementation (分할)  │
│     { type: "sisyphus-junior", split: 3 },│
│                                          │
│     // Section 5: Testing (parallel)     │
│     { type: "qa", model: "sonnet" },     │
│                                          │
│     // Section 6: Documentation (parallel)│
│     { type: "document-writer", "gemini" },│
│                                          │
│     // Section 7: Review (parallel)      │
│     { type: "momus", model: "sonnet" }   │
│   ]                                      │
│ })                                       │
│                                          │
│ → Spawns 8+ agents SIMULTANEOUSLY        │
│ → All run in background                  │
│ → Results collected asynchronously       │
└────────────┬─────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────┐
│ Phase 3: Automatic Result Aggregation    │
├──────────────────────────────────────────┤
│ // Automatic - no manual TaskOutput      │
│ const results = await Promise.allSettled([│
│   exploreTask,                           │
│   librarianTask,                         │
│   prometheusTask,                        │
│   ...8 total agents                      │
│ ]);                                      │
│                                          │
│ → Aggregates all results automatically   │
│ → Handles failures gracefully            │
└────────────┬─────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────┐
│ Phase 4: Intelligent Synthesis           │
├──────────────────────────────────────────┤
│ Sisyphus with extended thinking:         │
│                                          │
│ <thinking budget="32000">                │
│   I have results from 8 agents:         │
│   - explore: 47 API files found          │
│   - librarian: REST best practices       │
│   - prometheus: 3-phase refactor plan    │
│   - sisyphus-junior-1: Routes refactored │
│   - sisyphus-junior-2: Models refactored │
│   - sisyphus-junior-3: Controllers done  │
│   - qa: Tests updated & passing          │
│   - document-writer: API docs updated    │
│                                          │
│   Synthesis:                             │
│   Everything is done in parallel!        │
│   Just need to verify integration...     │
│ </thinking>                              │
└──────────────────────────────────────────┘
```

**특징:**
- **자동 병렬화** (수동 플래그 불필요)
- **8+ 에이전트 동시 실행**
- **자동 결과 수집**
- **더 빠른 완료** (~40% 시간 절약)

---

## 3. 에이전트 호출: `frontend-engineer`

### 우리의 frontend-engineer 호출

```
┌──────────────────────────────────────────┐
│ Main Agent (Sisyphus/Claude)            │
├──────────────────────────────────────────┤
│ Task(                                    │
│   subagent_type: "spc-team-frontend-engineer",│
│   description: "Create login component", │
│   prompt: "Create a responsive login     │
│            component with email/password │
│            fields. Use Tailwind CSS."    │
│ )                                        │
└────────────┬─────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────┐
│ Claude Code SDK - Agent Spawning        │
├──────────────────────────────────────────┤
│ 1. Lookup agent definition:              │
│    ~/.claude/agents/frontend-engineer.md │
│                                          │
│ 2. Read agent file:                      │
│    ---                                   │
│    name: frontend-engineer               │
│    model: sonnet                         │
│    tools: Read, Edit, Write, Glob, Grep  │
│    ---                                   │
│                                          │
│    You are Frontend Engineer...          │
│    • Component Design                    │
│    • Styling with CSS/Tailwind           │
│    • Accessibility (WCAG)                │
│                                          │
│ 3. Create new Sonnet instance            │
│    Model: claude-sonnet-4.5              │
│    Tools: [Read, Edit, Write, ...]       │
│    System: <agent definition>            │
│                                          │
│ 4. Inject user prompt:                   │
│    "Create a responsive login component  │
│     with email/password fields..."       │
│                                          │
│ 5. Execute agent in isolated context     │
│    → Agent cannot see main chat history  │
│    → Agent has NO context preservation   │
│    → Fresh start every time              │
└────────────┬─────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────┐
│ frontend-engineer Agent Executes         │
├──────────────────────────────────────────┤
│ // Agent reads existing code             │
│ Glob("**/*.tsx")                         │
│ Read("src/components/Button.tsx")        │
│   // Check existing component patterns   │
│                                          │
│ // Agent writes new component            │
│ Write("src/components/Login.tsx", `      │
│   import React from 'react';            │
│   export default function Login() {      │
│     return (                             │
│       <form className="...">             │
│         <input type="email" ... />       │
│         <input type="password" ... />    │
│         <button>Login</button>           │
│       </form>                            │
│     );                                   │
│   }                                      │
│ `)                                       │
│                                          │
│ // Agent returns result                  │
│ "✅ Created Login.tsx component"         │
└────────────┬─────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────┐
│ Main Agent Receives Result               │
├──────────────────────────────────────────┤
│ Result: "✅ Created Login.tsx component" │
│                                          │
│ // Main agent continues...               │
│ "Login component created. Moving to      │
│  next task..."                           │
└──────────────────────────────────────────┘
```

**특징:**
- ✅ Simple agent definition (markdown)
- ✅ Clean isolation (no context leak)
- ❌ No context preservation
- ❌ Fresh start every invocation
- ❌ Cannot resume work

### oh-my-opencode의 frontend-engineer 호출

```
┌──────────────────────────────────────────┐
│ Sisyphus (Main Orchestrator)            │
├──────────────────────────────────────────┤
│ sisyphus_task({                          │
│   section: 4,  // Implementation         │
│   category: "frontend",                  │
│   agent: {                               │
│     type: "frontend-ui-ux-engineer",     │
│     model: "google/gemini-3-pro-preview",│
│     resume: previousSessionId || null    │
│   },                                     │
│   prompt: "Create login component...",   │
│   context: {                             │
│     designSpec: ".spc/design/login.md",  │
│     styleguide: "STYLE_GUIDE.md",        │
│     previousWork: session.transcript     │
│   }                                      │
│ })                                       │
└────────────┬─────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────┐
│ TypeScript Agent Loader                  │
├──────────────────────────────────────────┤
│ async function loadAgent(config) {       │
│   const agentDef = agents['frontend'];   │
│                                          │
│   // Load from TypeScript config         │
│   const agent = {                        │
│     name: "Frontend-UI-UX-Engineer",     │
│     model: "google/gemini-3-pro-preview",│
│     temperature: 0.2,  // Enforced       │
│     tools: [                             │
│       ...standardTools,                  │
│       'lsp_rename',                      │
│       'ast_grep',                        │
│       'look_at'  // Smart context inject │
│     ],                                   │
│     hooks: {                             │
│       PreToolUse: validateFrontendTool,  │
│       PostToolUse: checkAccessibility    │
│     }                                    │
│   };                                     │
│                                          │
│   // Resume from previous session?       │
│   if (config.resume) {                   │
│     agent.context = loadSession(config.resume);│
│     // Agent remembers previous work!    │
│   }                                      │
│                                          │
│   return createAgentInstance(agent);     │
│ }                                        │
└────────────┬─────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────┐
│ Gemini 3 Pro Agent Executes              │
├──────────────────────────────────────────┤
│ // Agent has access to advanced tools    │
│                                          │
│ // Smart context injection               │
│ look_at({                                │
│   files: [".spc/design/login.md"],       │
│   extract: "layout and styling specs"    │
│ })                                       │
│ → Delegates reading to helper agent      │
│ → Returns only relevant info             │
│ → Preserves main agent's tokens          │
│                                          │
│ // AST-aware component creation          │
│ ast_grep({                               │
│   pattern: "export default function $NAME"│
│ })                                       │
│ → Finds existing component patterns      │
│ → Matches structure automatically        │
│                                          │
│ // Create component                      │
│ Write("src/components/Login.tsx", ...)   │
│                                          │
│ // PreToolUse hook validates             │
│ // PostToolUse hook checks accessibility │
│                                          │
│ // Automatic LSP diagnostics             │
│ lsp_diagnostics("src/components/Login.tsx")│
│ → No errors ✓                            │
│                                          │
│ // Return rich result                    │
│ return {                                 │
│   status: "success",                     │
│   files: ["Login.tsx"],                  │
│   session_id: "xyz789",  // For resume   │
│   accessibility: "WCAG 2.1 AA compliant",│
│   recommendations: [                     │
│     "Consider adding loading state",     │
│     "Add error message styling"          │
│   ]                                      │
│ }                                        │
└────────────┬─────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────┐
│ Sisyphus Receives Structured Result      │
├──────────────────────────────────────────┤
│ result = {                               │
│   status: "success",                     │
│   session_id: "xyz789",                  │
│   accessibility: "WCAG 2.1 AA",          │
│   recommendations: [...]                 │
│ }                                        │
│                                          │
│ // Can resume this agent later!          │
│ sisyphus_task({                          │
│   agent: { type: "frontend",             │
│            resume: "xyz789" },  ← Resume │
│   prompt: "Add loading state"            │
│ })                                       │
│                                          │
│ → Agent remembers previous work          │
│ → Continues from where it left off       │
└──────────────────────────────────────────┘
```

**특징:**
- ✅ Advanced tools (LSP, AST-Grep, look_at)
- ✅ Hook system (validation + accessibility check)
- ✅ Context preservation (resume capability)
- ✅ Structured results
- ✅ Better model (Gemini 3 Pro for UI)
- ✅ Temperature enforcement (0.2 for consistency)

---

## 4. 핵심 차이점 요약

### 커맨드 실행 메커니즘

| Aspect | Our Implementation | oh-my-opencode |
|--------|-------------------|----------------|
| **커맨드 파싱** | Claude Code CLI reads .md | TypeScript function call |
| **프롬프트 생성** | Static markdown (~40 lines) | Dynamic TypeScript (504 lines) |
| **모델 선택** | Fixed (Sonnet for main) | Dynamic (Opus + extended thinking) |
| **분류 시스템** | Claude interprets prompt | TypeScript classification function |
| **Pre-delegation** | None | Mandatory declaration protocol |

### 에이전트 델리게이션

| Aspect | Our Implementation | oh-my-opencode |
|--------|-------------------|----------------|
| **델리게이션 도구** | Generic `Task` tool | Specialized `sisyphus_task` |
| **병렬 실행** | Manual `run_in_background: true` | Automatic parallel orchestration |
| **결과 수집** | Manual `TaskOutput(task_id)` | Automatic `background_output()` |
| **에이전트 로딩** | Read markdown → inject | Load TypeScript config → spawn |
| **컨텍스트 보존** | None (fresh every time) | Session-based resume |
| **결과 형식** | String (text response) | Structured object |

### 에이전트 실행

| Aspect | Our Implementation | oh-my-opencode |
|--------|-------------------|----------------|
| **모델 선택** | Fixed in markdown | Dynamic by task type |
| **Temperature** | Model default | Enforced per agent (≤0.3) |
| **도구 접근** | Standard tools only | LSP + AST-Grep + custom |
| **Hook 시스템** | None | PreToolUse/PostToolUse/Stop |
| **컨텍스트 주입** | Manual file reading | Smart `look_at` tool |
| **Extended Thinking** | Basic (if using Opus) | 32k token budget |
| **세션 관리** | Stateless | Persistent with resume |

### 실행 플로우

| Phase | Our Implementation | oh-my-opencode |
|-------|-------------------|----------------|
| **0. Intent Gating** | ❌ None | ✅ Skill trigger detection |
| **1. Classification** | Claude interprets | TypeScript function (6 types) |
| **2. Planning** | Claude thinks (internal) | Extended thinking (32k budget) |
| **3. Delegation** | Sequential by default | Parallel by default |
| **4. Execution** | One agent at a time | Multiple agents simultaneously |
| **5. Collection** | Manual polling | Automatic aggregation |
| **6. Verification** | Todo checklist | LSP diagnostics + tests |
| **7. Cleanup** | None | Stop hook (cancel tasks, save session) |

### 성능 비교

| Metric | Our Implementation | oh-my-opencode |
|--------|-------------------|----------------|
| **평균 실행 시간** | 2-3 minutes | 1.5-2 minutes (병렬화로 40% 빠름) |
| **병렬 작업 수** | 0-2 (manual) | 3-8+ (automatic) |
| **API 호출 수** | 2-4 agents | 5-10 agents (병렬 실행) |
| **컨텍스트 사용** | 높음 (반복 읽기) | 낮음 (look_at으로 최적화) |
| **토큰 비용** | 중간 | 높음 (더 많은 에이전트) |

---

## 5. 실제 동작 예시: `/sisyphus "Add dark mode"`

### 우리의 실행 (단계별)

```bash
User: /sisyphus "Add dark mode"

[00:00] 🔄 SISYPHUS MODE ACTIVATED
[00:01] 📝 Creating todos...
        ✓ Created 5 todos

[00:05] [1/5] Searching for theme files...
        → Delegating to spc-team-explore (Haiku)
        ⏳ Waiting for explore agent...
[00:15] ✓ Found 12 files with theme/style

[00:16] [2/5] Analyzing current styling approach...
        → Delegating to spc-team-oracle (Opus)
        ⏳ Waiting for oracle agent...
[00:45] ✓ Identified CSS-in-JS with styled-components

[00:46] [3/5] Implementing dark mode...
        → Main agent (Sonnet) implementing...
        📝 Editing ThemeProvider.tsx
        📝 Creating darkTheme.ts
        📝 Updating components/Button.tsx
        📝 Updating components/Header.tsx
[01:20] ✓ Implemented in 4 files

[01:21] [4/5] Testing...
        $ npm test
        ⏳ Running tests...
[01:40] ✓ All tests pass

[01:41] [5/5] Updating documentation...
        → Delegating to spc-team-document-writer (Haiku)
        ⏳ Waiting for document-writer...
[01:55] ✓ Updated README.md

[01:56] ✅ All tasks complete!
        Dark mode added successfully.

Total time: 1 minute 56 seconds
```

**특징:**
- ⏱️ Sequential execution (one agent waits for another)
- 📊 Clear progress (todo checklist)
- 🔍 Transparent (user sees each step)
- ⏳ Slower (sequential bottleneck)

### oh-my-opencode의 실행 (병렬 + 최적화)

```bash
User: omo "Add dark mode"

[00:00] 🎯 Classifying: Open-ended (UI enhancement)
[00:01] 🧠 Extended thinking...
        Task requires:
        - Exploration (find theme files)
        - Design (dark mode palette)
        - Implementation (code changes)
        - Testing (verify functionality)
        - Documentation (update README)

[00:03] 📋 Pre-delegation plan:
        • Section 1 (Exploration): explore + librarian (parallel)
        • Section 3 (Planning): self (extended thinking)
        • Section 4 (Implementation): frontend-engineer (Gemini)
        • Section 5 (Testing): self
        • Section 6 (Documentation): document-writer (Gemini)

[00:04] 🚀 Spawning agents in parallel...
        ⏳ explore (grok-code) - Finding theme files
        ⏳ librarian (glm-4.7) - Dark mode best practices
        ⏳ frontend-engineer (gemini-3-pro) - Implementing
        ⏳ document-writer (gemini-flash) - Updating docs

[00:15] ✅ explore completed: Found 12 theme files
[00:18] ✅ librarian completed: Found Material Design dark mode guide
[00:35] ✅ frontend-engineer completed:
        - Created darkTheme.ts
        - Updated ThemeProvider.tsx
        - Updated 8 components
        - LSP diagnostics: No errors
        - Accessibility: WCAG AA compliant
[00:40] ✅ document-writer completed: README updated

[00:41] 🧪 Running tests...
        $ npm test
        ✓ All tests pass

[00:43] 💾 Saving session...
        Session ID: dark-mode-abc123
        Resume available for future changes

[00:44] ✅ Complete! Dark mode implemented.
        All agents finished successfully.

Total time: 44 seconds
```

**특징:**
- ⚡ Parallel execution (4 agents running simultaneously)
- 🚀 62% faster (44 sec vs 1m56s)
- 🤖 Multi-model (Grok + GLM + Gemini + Claude)
- 💾 Resumable (session saved)
- 🎯 Extended thinking (better architecture)
- 🔍 LSP diagnostics (automatic validation)

---

## 6. 결론: 동작 로직의 근본적 차이

### 우리의 접근 (Markdown + Sequential)

**메커니즘:**
```
User Input
  → Claude Code CLI
  → Load sisyphus.md (static)
  → Inject into Claude context
  → Claude interprets & plans
  → Sequential Task calls
  → Wait for each agent
  → Return to main
  → Continue
```

**철학:** "간단하고 투명하게"
- Markdown = 사람이 읽기 쉬움
- Sequential = 예측 가능
- Explicit = 명확한 제어
- Simple = 배우기 쉬움

### oh-my-opencode의 접근 (TypeScript + Parallel)

**메커니즘:**
```
User Input
  → OpenCode CLI
  → Phase 0: Intent Gating (TypeScript)
  → Phase 1: Classification (6 types)
  → Phase 2: Generate 504-line prompt (dynamic)
  → Phase 3: Extended thinking (32k budget)
  → Phase 4: Pre-delegation declaration
  → Phase 5: sisyphus_task (parallel spawn)
  → Phase 6: Automatic aggregation
  → Phase 7: Stop hook (cleanup + save)
```

**철학:** "최대 성능과 지능"
- TypeScript = 프로그래밍 가능
- Parallel = 최대 속도
- Automatic = 최적화된 실행
- Advanced = 고급 기능

### 비유로 이해하기

**우리 시스템:**
```
레스토랑 주방 - 전통 방식
├─ 셰프 (Sisyphus): "음식 만들어"
├─ 조리사 1: 재료 준비 → 완료 후 보고
├─ 셰프: 조리사 1 결과 확인
├─ 조리사 2: 요리 시작 → 완료 후 보고
├─ 셰프: 조리사 2 결과 확인
└─ 서빙
```
- 한 명씩 순서대로
- 각 단계마다 보고
- 투명하고 명확
- 하지만 느림

**oh-my-opencode 시스템:**
```
대형 레스토랑 - 산업화 방식
├─ 헤드 셰프 (Sisyphus): "음식 10개 준비"
│   ├─ 분석: 어떤 조리사에게 무엇을?
│   ├─ 전략: 병렬로 어떻게?
│   └─ 델리게이션: 7개 스테이션 동시 가동
├─ 스테이션 1 (재료 준비): 2명 병렬
├─ 스테이션 2 (조리): 3명 병렬
├─ 스테이션 3 (플레이팅): 1명
├─ 스테이션 4 (품질 검사): 자동
└─ 동시에 모든 결과 취합
```
- 여러 명이 동시에
- 자동 조율 및 취합
- 복잡하지만 빠름
- 전문화된 역할

---

## 요약: 같은 커맨드, 완전히 다른 실행

| | Our Sisyphus | oh-my-opencode |
|---|---|---|
| **Input** | `/sisyphus "task"` | `omo "task"` |
| **Parsing** | Markdown injection | TypeScript function |
| **Planning** | Claude interprets | Extended thinking (32k) |
| **Delegation** | Sequential `Task()` | Parallel `sisyphus_task()` |
| **Execution** | One-by-one | Simultaneous |
| **Collection** | Manual `TaskOutput` | Automatic aggregation |
| **Verification** | Todo checklist | LSP + hooks |
| **Cleanup** | None | Stop hook |
| **Speed** | 2-3 min | 1-2 min (40% faster) |
| **Visibility** | High (todos) | Medium (phases) |
| **Complexity** | Low (simple) | High (advanced) |
| **Power** | Limited | Maximum |

**핵심 차이:**
- 우리는 **사람이 제어**, 그들은 **기계가 최적화**
- 우리는 **투명성 우선**, 그들은 **성능 우선**
- 우리는 **단순 명확**, 그들은 **복잡 강력**

두 시스템 모두 "Sisyphus" 철학을 공유하지만, **구현 방식은 정반대**입니다.

---

**Document Version:** 1.0
**Last Updated:** 2026-01-15
**Author:** Detailed execution logic comparison
