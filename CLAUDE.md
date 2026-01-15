# Single Person Company (SPC) Plugin Development

## 경로 주의사항

이 프로젝트는 Claude Code 플러그인 개발 프로젝트입니다.

### 개발 경로 vs 설치 경로

| 구분 | 경로 | 용도 |
|------|------|------|
| **개발 경로 (소스)** | `/Users/sungmancho/projects/single-person-company/` | 코드 수정은 여기서! |
| **설치 경로** | `~/.claude/plugins/spc-ai-team/` | 테스트용 (수정 금지) |

### 절대 하면 안 되는 것

- `~/.claude/plugins/` 안의 파일을 직접 수정하지 마세요
- 설치된 플러그인 폴더 안에서 코드를 편집하지 마세요
- 설치 경로의 변경사항은 다음 설치 시 덮어씌워집니다

### 올바른 개발 워크플로우

1. **코드 수정**: 항상 이 디렉토리 (`/Users/sungmancho/projects/single-person-company/`)에서 수정
2. **설치**: `npm run install:plugin` 또는 해당 설치 스크립트 실행
3. **테스트**: 새 Claude Code 세션에서 테스트
4. **반복**: 1번부터 다시

### 파일 수정 전 확인

파일을 수정하기 전에 항상 현재 경로를 확인하세요:
- `/Users/sungmancho/projects/single-person-company/` 로 시작하면 OK
- `~/.claude/` 또는 `/Users/sungmancho/.claude/` 로 시작하면 STOP

## 빠른 참조

```bash
# 현재 경로 확인
pwd

# 올바른 개발 경로로 이동
cd /Users/sungmancho/projects/single-person-company/
```
