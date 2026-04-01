---
description: Chế độ nhanh — xử lý tác vụ đột xuất không cần quy trình phase đầy đủ
---

# /nexus:quick — Quick Task Execution

## When to Use
- Bug fix that doesn't fit current phase
- Small feature request (< 1 plan worth of work)
- Configuration change
- Documentation update
- User-requested deviation from roadmap

## Prerequisites
- Read `.nexus/state.md` → note current position
- Read `.agent/agents/_shared/evidence-first.md` → **evidence protocol**
- Read `.agent/agents/_shared/skill-enforcement.md` → **skill check**
- Read `.agent/agents/_shared/bilingual-protocol.md`
- Read `.agent/agents/_shared/behavioral-rules.md` → file discipline, security, quality rules
- Read `.agent/agents/_shared/mcp-protocol.md` → Context7 for library docs, Serena for symbolic editing

## Steps

### Step 1: Understand Request
Ask user what they need (if not already clear).
Classify:
- **Fix**: bug or error → invoke Debugger agent
- **Add**: small feature → invoke Executor agent
- **Change**: config change → invoke Executor agent
- **Review**: check something → invoke Reviewer agent
- **Refactor**: code restructuring → see Refactor Classification below

**Refactor Classification** (v3.0):

| Factor | Small Refactor (→ `/quick`) | Large Refactor (→ `/plan`) |
|--------|---------------------------|---------------------------|
| Files | ≤ 3 files | > 3 files |
| Type | Cosmetic, naming, extract method | Architectural, module restructuring |
| Risk | Low (no behavior change) | High (cross-module, breaking changes) |
| Tests | Existing tests sufficient | Cần viết tests mới hoặc update nhiều |

**Nếu Large Refactor detected:**
1. Gợi ý: "Refactor này ảnh hưởng nhiều files/modules → nên dùng `/plan` với skill `codebase-cleanup-tech-debt`"
2. Redirect user sang `/plan` (với `task_type: refactor` trong reasoning-bank)
3. KHÔNG xử lý inline trong `/quick`

**Pre-refactor checklist** (áp dụng cho MỌI refactor):
- [ ] Tests tồn tại cho code sẽ refactor?
- [ ] Git working tree clean? (`git status`)
- [ ] Backup plan? (có thể `git stash` hoặc branch riêng)

**Fast Mode Detection** (v2.1 — inspired by Rune cook):
Nếu task đáp ứng TẤT CẢ điều kiện sau → chạy Fast Mode:
- Ảnh hưởng ≤ 2 files
- Thay đổi ≤ 30 LOC
- Không liên quan security/auth/payment
- Không tạo file mới (chỉ edit)

Fast Mode skip: reasoning-bank lookup, verbose tracking, detailed usage log.
Fast Mode giữ: evidence-first, atomic commit, verify step.

**Initialize tracking:**
```
TRACKING: Agents: [] | Skills: [] ⛔ KHÔNG "nexus" | MCP Tools: [] | Sự cố: []
```

### Step 2: Execute

**Context7 Gate** (BẮT BUỘC nếu task liên quan thư viện ngoài):
- Scan task cho import/dependency thư viện ngoài
- Nếu có → gọi `resolve-library-id` + `query-docs` trước khi code
- Track vào MCP Tools: `context7 ({library}: {query})`

- No formal plan creation needed
- Apply reasoning-bank patterns (if available)
- Commit atomically
- **Track** agents/skills/MCP tools used during execution

> **ON ERROR** → Thêm vào tracking "Sự cố", retry hoặc hỏi user.

### Step 3: Finalize Usage Log (BẮT BUỘC)

Ghi vào `.nexus/logs/usage-log.md`.

> **Format**: Theo ĐÚNG format trong `.agent/maintenance/usage-logger.md`.
> **Self-check**: 6 fields bảng? Bảng Chi tiết Tasks? Không prose? Skills ≠ "nexus"?

### Step 4: Guide → Next Steps
Return user to their roadmap position:
- "Bạn đang ở Phase X, plan Y. Tiếp tục?"
- Suggest resuming normal workflow

## Output
- Ad-hoc task completed
- Logged for maintenance tracking (full format)
- User guided back to roadmap
