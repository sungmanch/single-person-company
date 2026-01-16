# Party Mode Design

## Overview

Party Mode transforms SPC from a verbose orchestration tool into a real-time team conversation display. Users see agents chatting naturally, not tool calls.

## Before vs After

### Before (Verbose Mode)
```
좋아요! 이제 💻 Sam에게 구현을 맡길 차례에요!

Task:Sam: Implement the app
IN
You are **Sam 💻**, the Developer for the SPC AI Team.
## Your Mission...

Write index.html
16 lines
<!doctype html>...

Bash: npm install
OUT: added 234 packages...

Write App.tsx
159 lines
import { useState }...
```

### After (Party Mode)
```
📐 Jamie: PRD 확인! API는 timedtext 엔드포인트로 갈게요
🎨 Morgan: @Jamie 👍 CORS 이슈 있나요?
📐 Jamie: @Morgan 네, proxy 필요해요
🎨 Morgan: 로딩 상태 FAB에 추가할게요
📐 Jamie: 아키텍처 완료! → .spc/docs/architecture/
🎨 Morgan: 디자인 완료! 초록색 FAB가 핵심이에요
💻 Sam: 스펙 봤어요! 깔끔하네요 👏
💻 Sam: 프로젝트 세팅 중...
💻 Sam: hooks 작업 중... useYouTubePlayer ✅
💻 Sam: 컴포넌트 작업 중...
💻 Sam: 빌드 성공! 🎉
🧪 Taylor: @Sam 코드 리뷰 시작할게요
🧪 Taylor: 빌드 통과 ✅ 테스트 시작
📝 Riley: README 작성 중...
🧪 Taylor: QA 완료! APPROVED ✅
📝 Riley: 문서 완료!
🧑‍💼 Alex: 팀 수고했어요! 🎉
```

## Key Changes

### 1. Message Frequency
| Mode | Frequency | Message Length |
|------|-----------|----------------|
| Verbose | 2-3 min | Long (multi-paragraph) |
| **Party** | **15-30 sec** | **Short (1-2 lines)** |

### 2. Message Format

**Party Mode Message Template:**
```
{emoji} {name}: {short_message}
```

Examples:
```
📐 Jamie: 아키텍처 설계 시작!
📐 Jamie: @Morgan YouTube iframe은 16:9 비율 필수에요
🎨 Morgan: @Jamie 알겠어요, aspect-ratio 적용할게요
💻 Sam: useSubtitles hook 완성 ✅
🧪 Taylor: 빌드 통과! 테스트 돌리는 중...
```

### 3. Interaction Patterns

**Direct mentions:** `@Name` for targeted messages
```
🎨 Morgan: @Jamie 자막 로딩 딜레이 얼마나 되나요?
📐 Jamie: @Morgan 100-500ms 정도요
```

**Status indicators:**
- ✅ = 완료
- 🔄 = 진행중
- ❌ = 문제발생
- 👏 = 칭찬

**Short completions:**
```
📐 Jamie: 아키텍처 완료! → .spc/docs/architecture/feature.md
```

### 4. PM (Alex) Streaming Behavior

In Party Mode, Alex should:
1. **Hide all tool invocations** from user
2. **Stream conversation log updates** to terminal in real-time
3. **Only show agent chat messages**

```python
# Pseudocode for PM streaming
while not all_complete:
    new_messages = poll_conversation_log()

    for msg in new_messages:
        # Format: emoji + name + short message only
        print(f"{msg.emoji} {msg.name}: {msg.text}")

    sleep(5)  # Poll every 5 seconds
```

### 5. Agent Conversation Templates (Short Form)

#### Starting Work
```
📐 Jamie: PRD 읽는 중...
📐 Jamie: 아키텍처 설계 시작!
```

#### Progress Updates (every 15-30 sec)
```
📐 Jamie: YouTube API 옵션 분석 중...
📐 Jamie: timedtext 엔드포인트로 결정!
📐 Jamie: 컴포넌트 구조 설계 중...
```

#### Questions & Answers
```
🎨 Morgan: @Jamie CORS 어떻게 처리하나요?
📐 Jamie: @Morgan proxy 사용할 거예요
🎨 Morgan: 👍 로딩 상태 추가할게요
```

#### Completions
```
📐 Jamie: 아키텍처 완료! ✅
📐 Jamie: @Sam TypeScript 인터페이스 다 정의해뒀어요
```

#### Reactions & Acknowledgments
```
💻 Sam: @Jamie @Morgan 스펙 깔끔하네요! 👏
🧪 Taylor: @Sam 코드 잘 짰어요!
```

## Implementation Changes

### Agent Files to Update

1. **spc-architect.md** - Add short message templates
2. **spc-designer.md** - Add short message templates
3. **spc-developer.md** - Add short message templates
4. **spc-qa.md** - Add short message templates
5. **spc-writer.md** - Add short message templates
6. **spc-pm.md** - Add streaming logic

### New Sections to Add to Each Agent

```markdown
<party_mode_messages>
## Short Message Templates (Party Mode)

Use these short formats when posting to conversation log:

### Starting
{emoji} {name}: {task} 시작!

### Progress (every 15-30 sec)
{emoji} {name}: {what_doing}...
{emoji} {name}: {item} ✅

### Questions
{emoji} {name}: @{other} {short_question}?

### Answers
{emoji} {name}: @{asker} {short_answer}

### Completion
{emoji} {name}: {task} 완료! ✅
{emoji} {name}: → {artifact_path}

### Reactions
{emoji} {name}: @{other} {praise} 👏
{emoji} {name}: 👍
</party_mode_messages>
```

### PM Streaming Section

```markdown
<party_mode_streaming>
## Party Mode Output

In Party Mode, you stream the conversation to the user:

1. After spawning agents, enter streaming loop
2. Poll `.spc/conversation/{feature}-log.md` every 5 seconds
3. Print ONLY new messages in short format
4. Do NOT print tool invocations, file writes, or bash outputs
5. Continue until all markers exist

### Output Format
Print each new message exactly as:
```
{emoji} {name}: {message}
```

No headers, no status boxes, no separators.
</party_mode_streaming>
```

## Migration Path

1. **Phase 1**: Add `<party_mode_messages>` section to all agents
2. **Phase 2**: Add `<party_mode_streaming>` to PM
3. **Phase 3**: Create `/spc:party` command variant
4. **Phase 4**: Make Party Mode default, verbose becomes opt-in

## Open Questions

- [ ] Should we show file creation at all? (e.g., `→ created src/App.tsx`)
- [ ] How to handle errors in party mode? (keep short or expand?)
- [ ] Should PM interject with its own messages?
