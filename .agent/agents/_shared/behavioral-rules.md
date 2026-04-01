# Behavioral Rules (Bắt buộc)

> Lấy cảm hứng từ Ruflo v3.5 behavioral protocol, adapted cho Nexus/Antigravity.

## File Discipline
1. **ALWAYS read a file before editing it** — hiểu context trước khi sửa
2. **NEVER create files unless absolutely necessary** — prefer editing existing files
3. **Keep files under 500 lines** — split nếu vượt ngưỡng
4. **NEVER save working files to project root** — dùng thư mục phù hợp
5. **NEVER create backup/duplicate files** — dùng Git cho version control

## Security
6. **NEVER commit secrets, credentials, API keys, or .env files**
7. **NEVER log sensitive data** (passwords, tokens) trong reasoning-bank hoặc usage-log
8. **Validate inputs at system boundaries** — check trước khi process

> Chi tiết bảo mật: đọc `security-protocol.md` — input validation, secrets detection, pre-commit scan.

## Quality
9. **Do what has been asked — nothing more, nothing less** — tránh scope creep
10. **One task, one commit, conventional format** — atomic commits
11. **Always verify changes compile/build before marking complete**
12. **NEVER skip verification step** — mọi task có bước verify

## Verification & Evidence (v2.0)
13. **Evidence before claims** — đọc `evidence-first.md`, KHÔNG claim mà chưa run verification
14. **No fix without root cause** — debugger PHẢI trace root cause trước khi fix
15. **3+ fixes failed = architecture problem** — STOP, question fundamentals, discuss with user

## Skills & Memory (v2.0)
16. **Check skills before every task** — đọc `skill-enforcement.md`, 1% chance → read skill first
17. **Structured memory types** — ghi memory theo types (DECISION/PATTERN/ERROR/INSIGHT/CONVENTION), xem `memory-protocol.md` § Memory Types

## Code Integrity (v2.1 — inspired by Rune)
18. **Critical functions protection** — nếu `.nexus/critical-functions.md` tồn tại → đọc trước khi edit listed files → liệt kê functions sẽ giữ nguyên → hỏi user trước khi xóa/rename
19. **Verify imports exist** — sau khi tạo file mới với import statements → verify: internal file exists, external package in manifest (xem `quality/import-guard.md`)
20. **Scope awareness** — sau mỗi wave → so sánh actual changes vs plan → warn nếu out-of-scope files detected

## Áp dụng
- Rules này áp dụng **sau khi `.nexus/` đã tồn tại** (post-init)
- `/init` workflow được exempt khỏi Rule #2 (cần tạo project files)
- Mỗi agent PHẢI đọc file này trước khi thực thi task
- Vi phạm rules → ghi vào reasoning-bank để tránh lặp lại
