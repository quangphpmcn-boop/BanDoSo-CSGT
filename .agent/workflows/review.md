---
description: Kiểm tra chất lượng — bảo mật, hiệu năng, khả năng truy cập, đánh giá code
---

# /nexus:review [scope] — Quality Review

## Scope Options
- `all` — full audit
- `security` — OWASP Top 10 scan
- `performance` — performance bottleneck analysis
- `accessibility` — WCAG compliance check
- `code` — code quality and patterns review
- `[file_path]` — review specific files

## Prerequisites
- Read `.nexus/state.md`
- Read `.agent/agents/_shared/evidence-first.md` → **evidence protocol**
- Read `.agent/agents/_shared/skill-enforcement.md` → **skill check**
- Read `.agent/agents/_shared/bilingual-protocol.md` → language rules
- Read `.agent/agents/_shared/behavioral-rules.md` → file discipline, security, quality rules
- Read `.agent/agents/_shared/security-protocol.md` → security scan patterns (for security scope)
- Read `.agent/agents/_shared/mcp-protocol.md` → Context7 for API checks, Serena symbolic for code analysis

## Steps

### Step 1: Determine Scope
Based on argument, load appropriate checklist:
- Security → OWASP Top 10, auth patterns, input validation
- Performance → N+1 queries, bundle size, caching
- Accessibility → WCAG 2.1 AA, screen readers, keyboard nav
- Code → naming, patterns, complexity, test coverage

**Initialize tracking:**
```
TRACKING: Agents: [reviewer] | Skills: [] ⛔ KHÔNG "nexus" | MCP Tools: [] | Sự cố: []
```

### Step 2: File Discovery
Identify files to review:
- Changed files since last review
- Or all files in scope
- Exclude generated/vendor files

### Step 3: Execute Review

**Context7 Best Practices Check** (BẮT BUỘC nếu code dùng thư viện ngoài):
- Với thư viện chính trong scope → gọi `resolve-library-id` + `query-docs`
- So sánh patterns trong code vs best practices từ docs → phát hiện anti-patterns
- Track vào MCP Tools: `context7 ({library}: best practices review)`

For each file, check against loaded checklist → **track skills/MCP tools used**.
Generate findings:

| Severity | Description | File | Line | Suggestion |
|----------|------------|------|------|------------|
| 🔴 Critical | | | | |
| 🟡 Warning | | | | |
| 🔵 Info | | | | |

> **Nếu phát hiện pattern lỗi lặp lại** (cùng loại lỗi ở nhiều files) → ghi nhận vào findings report để user review.

### Step 4: Summary Report
Present to user (in `user_language`):
- Total findings by severity
- Top 3 most important issues
- Recommended actions

### Step 4.5: Finalize Usage Log (BẮT BUỘC)

Ghi vào `.nexus/logs/usage-log.md`.

> **Format**: Theo ĐÚNG format trong `.agent/maintenance/usage-logger.md`.
> **Self-check**: 6 fields bảng? Bảng Chi tiết? Không prose? Skills ≠ "nexus"?

### Step 5: Guide → Next Steps
Based on findings:
- Critical issues → suggest fixing immediately
- Warnings → suggest addressing in next phase
- Clean → congratulate and suggest next workflow
- Recurring pattern errors (same error type across files) → suggest `/learn` to extract reusable patterns
- Reasoning-bank has ≥ 3 skill candidates → suggest `/evolve` to update skills

## Output
- Review report with actionable findings
- Severity-sorted issue list
- Usage logged (full format)
