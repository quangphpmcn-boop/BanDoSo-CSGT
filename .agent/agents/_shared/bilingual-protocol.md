# Bilingual Protocol — Vỏ Việt, Ruột Anh

## Purpose
Maximize AI performance by keeping technical artifacts in English while communicating with users in their preferred language.

## Configuration
Read from `nexus.json → bilingual`:
- `user_language`: Language for user-facing communication (default: `vi`)
- `technical_language`: Language for technical artifacts (default: `en`)

## Rules

| Content Type | Language | Examples |
|---|---|---|
| Conversation, explanations, guidance | `user_language` | "Phase 2 đã hoàn thành. Tiếp theo bạn nên..." |
| Code, variable/function/class names | `technical_language` | `getUserProfile()`, `OrderService` |
| XML plan content (task names, descriptions) | `technical_language` | `<task><name>Create auth endpoint</name></task>` |
| Commit messages | `technical_language` | `feat(auth): add JWT token refresh` |
| File and directory names | `technical_language` | `user-service.ts`, `api-routes/` |
| STATE.md, ROADMAP.md, PLAN.md content | `technical_language` | Internal docs readable by any agent/session |
| project.md technical sections | `technical_language` | Tech stack, constraints, decisions |
| User-facing summaries and guides | `user_language` | Progress bars, guide block, status reports |
| Error messages to user | `user_language` | "Đã xảy ra lỗi khi tạo file..." |

## Why This Matters
- AI models perform best with English technical content
- User comprehension is best in their native language
- Internal artifacts (plans, state) should be agent-readable → English
- Explanations and guides should build user confidence → native language

## How to Apply
1. Read `nexus.json → bilingual` at the start of every task
2. All `console.log`/`print`/output TO USER → `user_language`
3. All file creation, code, commit → `technical_language`
4. When quoting code in conversation, keep code in English, wrap with native language explanation
