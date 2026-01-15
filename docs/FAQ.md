# FAQ & Troubleshooting

## Frequently Asked Questions

### General Questions

#### Q: What is SPC AI Team?
**A:** SPC (Single Person Company) AI Team is a Claude Code plugin that provides **6 specialized SPC agents** (PM, Architect, Designer, Developer, QA, Writer) plus **11 Sisyphus specialist agents** (Oracle, Prometheus, Momus, etc.) to help solo founders build products with full-team efficiency.

#### Q: Do I need to pay extra to use SPC AI Team?
**A:** No. SPC AI Team is a free plugin. However, you need an active Claude Code subscription since the agents use Claude's AI capabilities.

#### Q: What's the difference between `/spc` and `/spc:pm` and `/sisyphus`?
**A:**
- `/spc` activates the **full SPC team workflow** - PM analyzes first, then delegates to other agents
- `/spc:pm` invokes **only the PM agent** directly
- `/sisyphus` activates **Sisyphus multi-agent orchestration** with the 11 specialist agents
- `/ultrawork` activates **maximum performance mode** with parallel execution

Use `/spc` for complete product features. Use `/sisyphus` for complex technical tasks. Use individual commands for focused work.

#### Q: What is BMAD methodology?
**A:** BMAD stands for Build-Measure-Analyze-Decide. It's a product development methodology that SPC AI Team follows:
1. **Build** - Create the feature based on requirements
2. **Measure** - Test and validate quality
3. **Analyze** - Review results and feedback
4. **Decide** - Iterate or ship

#### Q: Can I use SPC AI Team for existing projects?
**A:** Yes! SPC AI Team works with any project. The agents analyze your existing codebase and follow your established patterns.

---

### Installation & Setup

#### Q: The installer says "command not found"
**A:** Ensure you have proper permissions:
```bash
chmod +x install.sh
./install.sh
```

If still failing, try running with bash directly:
```bash
bash install.sh
```

#### Q: Commands aren't available after installation
**A:**
1. **Restart Claude Code** - Close and reopen your Claude Code session
2. **Verify files exist:**
   ```bash
   ls ~/.claude/commands/spc*.md
   # Should show 9 SPC command files

   ls ~/.claude/commands/{sisyphus,ultrawork,plan,review}.md
   # Should show Sisyphus command files

   ls ~/.claude/agents/spc-team-*.md
   # Should show 11 Sisyphus team agent files
   ```
3. **Check Claude Code configuration** - Ensure Claude Code is reading from `~/.claude/commands/`

#### Q: How do I update SPC AI Team?
**A:**
```bash
cd spc-ai-team
git pull
./install.sh
```

The installer backs up existing files before updating.

#### Q: How do I uninstall SPC AI Team?
**A:**
```bash
cd spc-ai-team
./uninstall.sh
```

Your previous configurations are backed up to `~/.claude/backup/`.

---

### Usage Questions

#### Q: Where are the generated artifacts stored?
**A:** All artifacts are stored in the `.spc/` directory at your project root:

```
.spc/
├── docs/
│   ├── prd/           # PRDs from PM
│   ├── architecture/  # Tech specs from Architect
│   └── design/        # UI specs from Designer
├── stories/           # Development stories
├── qa-reports/        # Test results from QA
└── handoffs/          # Agent communication records
```

#### Q: How do I clear previous artifacts?
**A:** Remove the `.spc/` directory:
```bash
rm -rf .spc/
```

Or remove specific artifacts:
```bash
rm .spc/docs/prd/old-feature.md
```

#### Q: Can I modify the generated artifacts?
**A:** Yes! The artifacts are plain markdown files. Feel free to edit them. When you invoke SPC again, agents will read your modified versions.

#### Q: How do I see what artifacts exist?
**A:** Use the status command:
```
/spc:artifacts
```

Or list files directly:
```bash
ls -la .spc/
```

#### Q: Can multiple features be built simultaneously?
**A:** It's recommended to complete one feature before starting another. Each `/spc` invocation creates its own artifact files, but working on multiple complex features simultaneously can cause context confusion.

---

### Agent-Specific Questions

#### Q: Why does PM always run first?
**A:** The PM agent acts as the "product owner" who:
1. Analyzes requirements thoroughly
2. Creates the PRD that all other agents reference
3. Decides which agents are needed
4. Coordinates the workflow

Without a PRD, other agents lack clear requirements to work from.

#### Q: Can I skip certain agents?
**A:** When using `/spc`, the PM decides which agents are needed. For simple tasks, PM might skip Designer or use fewer agents.

To completely bypass this, use individual agent commands:
```
/spc:architect "Design API endpoints for user service"
```

#### Q: What's the difference between Opus and Sonnet agents?
**A:**
- **Opus (PM, Architect)**: Used for complex reasoning tasks like requirements analysis and architecture design
- **Sonnet (Designer, Developer, QA, Writer)**: Used for execution-focused tasks that need speed

This balances quality with efficiency.

#### Q: The Developer agent created files in the wrong location
**A:** The Developer agent uses the architecture spec to determine file locations. To fix:
1. Update the architecture spec in `.spc/docs/architecture/`
2. Re-run `/spc:dev` with clear instructions:
   ```
   /spc:dev "Move components to src/features/todo/ following our feature-based structure"
   ```

---

### Troubleshooting

#### Issue: Agents not completing tasks

**Symptoms:** Agent starts but doesn't finish or produce output.

**Solutions:**
1. **Check context length** - Very large codebases can exceed context limits. Try:
   - Working in a subdirectory
   - Being more specific in your request

2. **Simplify the request** - Break complex features into smaller pieces:
   ```
   # Instead of:
   /spc "Build complete authentication system"

   # Try:
   /spc "Add login form component"
   /spc "Add authentication API endpoint"
   ```

3. **Verify Claude Code is working:**
   ```
   /spc:status
   ```
   If this doesn't respond, there's a Claude Code issue, not SPC issue.

#### Issue: Agents produce incorrect output

**Symptoms:** Generated code doesn't match your codebase patterns.

**Solutions:**
1. **Provide more context:**
   ```
   /spc "Add todo feature following our existing pattern in src/features/user/"
   ```

2. **Reference existing files:**
   ```
   /spc "Add API endpoint similar to src/api/users.ts"
   ```

3. **Update CLAUDE.md** - Add project-specific instructions that agents will follow.

#### Issue: `.spc/` directory not created

**Symptoms:** After running `/spc`, no artifacts appear.

**Solutions:**
1. **Check permissions:**
   ```bash
   touch .spc/test.txt
   # If this fails, you have permission issues
   ```

2. **Create manually:**
   ```bash
   mkdir -p .spc/{docs/{prd,architecture,design},stories,qa-reports,handoffs}
   ```

3. **Check if agents completed** - Look at Claude Code output for errors.

#### Issue: Handoff protocol not working

**Symptoms:** Agents don't seem to communicate or read each other's work.

**Solutions:**
1. **Verify handoff files exist:**
   ```bash
   ls .spc/handoffs/
   ```

2. **Re-run with explicit handoff:**
   ```
   /spc:dev "Read the architecture spec at .spc/docs/architecture/feature.md and implement"
   ```

3. **Use full workflow** - `/spc` handles handoffs automatically. Individual agent commands may miss handoffs.

#### Issue: QA reports failures but code looks correct

**Symptoms:** QA agent reports test failures that don't seem accurate.

**Solutions:**
1. **QA works from acceptance criteria** - Check if the PRD accurately reflects what you want:
   ```bash
   cat .spc/docs/prd/feature.md
   ```

2. **Update the PRD:**
   ```
   /spc:pm "Update the todo feature PRD to clarify that empty todos should be allowed"
   ```

3. **Re-run QA:**
   ```
   /spc:qa "Re-validate todo feature against updated acceptance criteria"
   ```

---

### Integration Questions

#### Q: How does SPC work with Sisyphus?
**A:** SPC AI Team now **includes full Sisyphus integration**! No separate installation needed.

When you install SPC AI Team:
- You get **6 SPC core agents** for product development
- You get **11 Sisyphus specialist agents** for deep technical work
- You get **22 slash commands** including both SPC and Sisyphus commands
- Sisyphus provides the multi-agent orchestration backbone
- SPC agents use Sisyphus's Task tool for delegation
- Todo tracking integrates with Sisyphus's task management

Use `/sisyphus` for technical orchestration and `/spc` for product development.

#### Q: Can I use SPC with other Claude Code plugins?
**A:** Yes! SPC AI Team is designed to coexist with other plugins. Common combinations:
- **SPC + Sisyphus**: Enhanced orchestration
- **SPC + Git plugins**: Better commit workflows
- **SPC + Testing plugins**: Extended test coverage

#### Q: How do I customize agent behavior?
**A:**
1. **Edit agent definitions** in `~/.claude/agents/`:
   ```bash
   vim ~/.claude/agents/spc-developer.md
   ```

2. **Add project rules** in your CLAUDE.md:
   ```markdown
   # Project Rules for SPC Agents
   - Always use TypeScript
   - Follow existing naming conventions
   - Never use `any` type
   ```

---

### Best Practices

#### Q: What makes a good SPC request?
**A:** Good requests are:
1. **Specific**: "Add login form with email/password fields" vs "Add login"
2. **Contextual**: "Following our existing auth pattern"
3. **Scoped**: One feature at a time

#### Q: How detailed should my requests be?
**A:** Start simple, add detail if results aren't right:

```
# Start simple:
/spc "Add user profile page"

# If not enough, add detail:
/spc "Add user profile page showing name, email, avatar. Allow editing name. Use our existing form components."
```

#### Q: Should I review every artifact?
**A:** For important features, yes. Quick review flow:
1. Check PRD acceptance criteria match your intent
2. Skim architecture for major decisions
3. Review generated code thoroughly
4. Read QA report for any issues

---

## Still Have Questions?

1. **Check the Getting Started guide**: [GETTING_STARTED.md](./GETTING_STARTED.md)
2. **See a complete example**: [EXAMPLE_WORKFLOW.md](./EXAMPLE_WORKFLOW.md)
3. **Read agent specifications**: See `agents/` directory
4. **File an issue**: [GitHub Issues](https://github.com/yourusername/spc-ai-team/issues)

---

#### Q: What are the Sisyphus commands?
**A:** The integrated Sisyphus commands are:

| Command | Purpose |
|---------|---------|
| `/sisyphus` | Multi-agent orchestration mode |
| `/ultrawork` | Maximum performance with parallel agents |
| `/plan` | Start planning session with Prometheus |
| `/prometheus` | Strategic planning with interviews |
| `/review` | Critical plan review with Momus |
| `/orchestrator` | Complex multi-step task coordination |
| `/deepsearch` | Thorough codebase search |
| `/analyze` | Deep analysis and investigation |
| `/simplify` | Code simplification and cleanup |
| `/ralph-loop` | Self-referential loop until completion |
| `/cancel-ralph` | Cancel active Ralph Loop |
| `/update` | Check for updates |
| `/sisyphus-default` | Set Sisyphus as default mode |

---

*Last updated: 2025*
