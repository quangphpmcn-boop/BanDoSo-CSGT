---
description: Kiểm tra toàn diện — orchestrate audit skills (security, code quality, accessibility) với risk scoring
---

# /nexus:audit [scope] — Comprehensive Audit

## Scope Options
- `security` — Security audit (OWASP, auth, secrets, API security)
- `code` — Code quality audit (AI-code 7 dimensions, tech debt, patterns)
- `accessibility` — Accessibility audit (WCAG 2.1 AA compliance)
- `full` — Chạy cả 3 scope trên

> **Khác `/review`**: `/review` tập trung vào code quality từng file với severity table. `/audit` toàn diện hơn — quét toàn bộ codebase, risk scoring, priority matrix, và action plan.

## Prerequisites
- Read `.nexus/state.md`
- Read `.agent/agents/_shared/evidence-first.md` → **evidence protocol**
- Read `.agent/agents/_shared/skill-enforcement.md` → **skill check**
- Read `.agent/agents/_shared/bilingual-protocol.md` → language rules
- Read `.agent/agents/_shared/behavioral-rules.md` → file discipline, security, quality rules
- Read `.agent/agents/_shared/mcp-protocol.md` → Context7 for API checks, Serena symbolic for code analysis

## Steps

### Step 1: Determine Scope & Load Skills

Based on argument, load appropriate **skill** (PHẢI đọc SKILL.md):

| Scope | Skill | Focus |
|-------|-------|-------|
| `security` | `security/security-auditor` | DevSecOps, zero-trust, compliance, OWASP |
| `code` | `testing/vibe-code-auditor` | AI-code audit 7 dimensions |
| `accessibility` | `quality/wcag-audit-patterns` | WCAG 2.1 AA |
| `full` | All 3 above | Combined |

**Initialize tracking:**
```
TRACKING: Agents: [reviewer] | Skills: [] ⛔ KHÔNG "nexus" | MCP Tools: [] | Sự cố: []
```

### Step 2: Codebase Discovery

Identify audit targets:

1. **File inventory**: List all source files (exclude generated/vendor/node_modules)
2. **Dependency scan**: Check `package.json`, `pubspec.yaml`, `requirements.txt`, `Cargo.toml`
3. **Config scan**: Check `.env`, auth config, CORS, API keys exposure
4. **Scope prioritization**: Focus on high-risk areas first (auth, payment, data, API endpoints)

> Dùng Serena `search_for_pattern` nếu available để quét patterns nhanh hơn.

### Step 3: Execute Audit

**Per-scope execution:**

#### Security Scope
Theo checklist từ `security-auditor` skill:
- [ ] Input validation patterns (SQL injection, XSS, command injection)
- [ ] Authentication & authorization (token handling, session, RBAC)
- [ ] Secrets exposure (hardcoded keys, .env in git, API keys in client)
- [ ] API security (CORS, rate limiting, input sanitization)
- [ ] Dependency vulnerabilities (outdated packages, known CVEs)

#### Code Quality Scope
Theo 7 dimensions từ `vibe-code-auditor` skill:
- [ ] Correctness (logic errors, edge cases, error handling)
- [ ] Security (overlap with security scope — deduplicate)
- [ ] Performance (N+1 queries, memory leaks, unnecessary re-renders)
- [ ] Maintainability (complexity, duplication, naming, structure)
- [ ] Testing (coverage gaps, missing edge case tests)
- [ ] Documentation (inline docs, API docs, README accuracy)
- [ ] Architecture (separation of concerns, coupling, cohesion)

#### Accessibility Scope
Theo WCAG 2.1 AA từ `wcag-audit-patterns` skill:
- [ ] Perceivable (alt text, color contrast, text sizing)
- [ ] Operable (keyboard navigation, focus management, timing)
- [ ] Understandable (labels, error messages, consistent navigation)
- [ ] Robust (semantic HTML, ARIA, screen reader compatibility)

**Context7 Check** (nếu code dùng thư viện ngoài):
- Verify API usage patterns vs latest docs → phát hiện deprecated APIs
- Track vào MCP Tools: `context7 ({library}: audit verification)`

### Step 4: Risk Scoring

Tổng hợp findings thành **Risk Score Matrix**:

```
┌─────────────────────────────────────────────────┐
│           RISK SCORE MATRIX                     │
├──────────────┬──────┬────────┬─────────┬────────┤
│ Dimension    │ Pass │ Warn   │ Fail    │ Score  │
├──────────────┼──────┼────────┼─────────┼────────┤
│ Security     │  12  │   3    │   1     │ 7.2/10 │
│ Code Quality │  18  │   5    │   2     │ 6.8/10 │
│ Accessibility│   8  │   2    │   0     │ 8.5/10 │
├──────────────┼──────┼────────┼─────────┼────────┤
│ OVERALL      │  38  │  10    │   3     │ 7.5/10 │
└──────────────┴──────┴────────┴─────────┴────────┘
```

**Score calculation:**
- Pass = 1.0, Warn = 0.5, Fail = 0.0
- Score = (sum / total_checks) × 10
- Overall = weighted average (security × 1.5, code × 1.0, a11y × 0.8)

### Step 5: Audit Report

Present to user (in `user_language`):

```
━━━ 🔍 AUDIT REPORT ━━━

Scope: [security | code | accessibility | full]
Files scanned: [N] | Checks: [M] | Duration: [T]

## Risk Score Matrix
[Step 4 matrix]

## 🔴 Critical Findings ([N])
| # | Scope | Finding | File | Remediation |
|---|-------|---------|------|-------------|
| 1 | Security | Hardcoded API key | config.ts:15 | Move to .env |

## 🟡 Warnings ([N])
[Table format]

## ✅ Passed Checks ([N])
[Summary only — no detail needed]

## 📋 Priority Actions (Top 5)
1. [Critical] Fix X → estimated effort: 30 min
2. [Critical] Fix Y → estimated effort: 1 hour
3. [Warning] Improve Z → estimated effort: 15 min
...

━━━━━━━━━━━━━━━━━━━━
```

> Nếu pattern lỗi lặp lại (cùng loại ở nhiều files) → ghi nhận riêng trong "Recurring Patterns" section.

### Step 5.5: Finalize Usage Log (BẮT BUỘC)

Ghi vào `.nexus/logs/usage-log.md`.

> **Format**: Theo ĐÚNG format trong `.agent/maintenance/usage-logger.md`.
> **Self-check**: 6 fields bảng? Bảng Chi tiết? Không prose? Skills ≠ "nexus"?

### Step 6: Guide → Next Steps

Based on audit results:

| Overall Score | Recommendation |
|---------------|----------------|
| 9-10 | 🎉 Excellent — tiếp tục roadmap bình thường |
| 7-8 | ⚠️ Good — fix warnings khi convenient |
| 5-6 | 🟡 Fair — suggest `/quick` để fix critical trước khi tiếp phase |
| < 5 | 🔴 Poor — suggest `/plan` refactor phase riêng |

- Critical issues → suggest fixing immediately via `/quick`
- Many code quality issues → suggest `/plan` refactor phase
- Recurring patterns → suggest `/learn` to extract patterns
- Reasoning-bank has ≥ 3 skill candidates → suggest `/evolve`

## Output
- Audit report với Risk Score Matrix
- Priority Actions list (top 5)
- Usage logged (full format)
- User guided to next action based on score
