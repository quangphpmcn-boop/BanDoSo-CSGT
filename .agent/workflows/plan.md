---
description: Lập kế hoạch phase — tạo kế hoạch thực thi nguyên tử với cấu trúc XML
---

# /nexus:plan [phase_number] — Phase Planning

## Prerequisites
- Read `.nexus/state.md` → confirm current position
- Read `.nexus/roadmap.md` → get phase requirements
- Read `.nexus/requirements.md` → get full requirement details
- Read `.agent/agents/_shared/bilingual-protocol.md` → language rules
- Read `.agent/agents/_shared/behavioral-rules.md` → file discipline, security, quality rules
- Read `.agent/agents/_shared/memory-protocol.md` → memory read/write rules
- Read `.nexus/phases/phase-{N}/design/design-brief.md` (if exists) → incorporate design specs
- Read `.agent/agents/_shared/mcp-protocol.md` → use Context7 for library API lookup
- Read `.nexus/memory/reasoning-bank.json` (if exists) → check similar patterns for approach suggestions
- Read `.nexus/phases/phase-{N}/clarifications.md` (if exists) → incorporate clarified requirements (v3.6)

## Steps

### Step 1: Research Phase Scope
Understand what this phase needs to deliver:
- Which requirements (REQ-xxx) map to this phase
- What exists already (if building on previous phases)
- Dependencies on external systems or prior work
- **ck semantic search (v3.6.1)**: nếu ck khả dụng → `semantic_search("similar to [feature]")` để tìm code patterns tương tự đã có

### Step 1.2: Generate Phase Spec & Research (v3.6)

> Inspired by spec-kit: tách biệt "what/why" (spec) vs "how" (plan).

1. **Generate** `.nexus/phases/phase-{N}/spec.md`:
   - Extract requirements thuộc phase từ `requirements.md`
   - Tóm tắt what (chức năng) và why (giá trị mang lại)
   - Include acceptance criteria cho mỗi requirement
   - Include clarifications (nếu đã chạy `/clarify`)
   - **KHÔNG chứa** tech stack decisions — chỉ functional specification

2. **Generate** `.nexus/phases/phase-{N}/research.md`:
   - Tech stack rationale (từ Step 1.5 Elicitation)
   - Context7 findings (từ Step 1.3)
   - Alternatives considered & rejected (với lý do)
   - Known constraints & risks

> Các plans PHẢI reference `spec.md` khi implement. `research.md` là tài liệu hỗ trợ.

### Step 1.3: Context7 Auto-Detect Gate (BẮT BUỘC)

> ⛔ **HARD RULE**: Nếu plan dùng thư viện ngoài mà KHÔNG tra Context7 → plan **KHÔNG ĐƯỢC lưu**.

**Auto-detect quy trình:**

1. **Scan dependency files** → lấy danh sách thư viện ngoài từ `requirements.txt`, `package.json`, `pubspec.yaml`, etc.
2. **Đọc checklist** từ `.nexus/memory/context7-checklist.md` (nếu có — tạo bởi `/start`)
3. **Với mỗi thư viện mức 🔴 BẮT BUỘC** → gọi `resolve-library-id` + `query-docs` ngay lập tức
4. **Với mỗi thư viện mức 🟡 NÊN** → gọi Context7 nếu plan dùng API phức tạp của thư viện đó
5. **Ghi kết quả** vào `<context7-checklist>` trong plan template (xem `templates/plan.md`)
6. **Cập nhật checklist** → mark ✅ cho thư viện đã tra trong `.nexus/memory/context7-checklist.md`

**Được bỏ qua KHI VÀ CHỈ KHI:**
- Logic nghiệp vụ nội bộ thuần, không dùng thư viện
- Context7 MCP unavailable → ghi note `⚠️ Context7 N/A, used training data for {library}`
- Thư viện mức 🔵 OPTIONAL với API đơn giản

> Kết quả tra cứu dùng để plan chính xác hơn — tránh plan sai API signatures.
> Kết quả PHẢI được ghi vào `<context7-checklist>` trong plan — không ghi = plan bị reject.

### Step 1.5: Implementation Choices (Elicitation)

Read `_shared/requirements-elicitation.md` → apply **Loại 2: Implementation Choice**.
Với các quyết định lớn (framework, thư viện, kiến trúc) → dùng **Multi-Option Comparison Format** (Rule 7).

1. Với mỗi requirement thuộc phase → xác định các quyết định AI phải tự quyết nếu user không nói rõ
2. Trình bày dạng bảng để user duyệt (hoặc user tự chỉ định)
3. Ghi kết quả vào `requirements.md` → section "Detail Decisions"

> CRITICAL: AI KHÔNG ĐƯỢC bỏ qua bước này. Nếu thông tin chưa rõ → hỏi lại, KHÔNG tự đoán.

### Step 2: Break into Plans
Each plan = one atomic unit of work:
- Can be executed independently
- Has clear definition of done
- Takes 10-30 minutes to execute
- One plan = one focused deliverable
- **Mỗi task PHẢI liệt kê exact file paths** sẽ tạo mới hoặc sửa đổi (giúp executor biết rõ scope, giảm ambiguity)

Rules:
- Plan MUST use XML structure from `.agent/templates/plan.md`
- Plans in same wave = can run in parallel (no dependencies)
- Plans across waves = sequential (wave 1 before wave 2)
- Maximum 3-5 plans per phase

**Resource Planning** — mỗi plan PHẢI khai báo `<resources>`:
- `<agents>`: agents dự kiến (executor, debugger, reviewer...)
- `<skills>`: domain skills cần thiết (frontend, database, testing...)
- `<mcp>`: MCP tools cần dùng (Context7 tra API, Serena symbolic analysis, Pencil design trong .pen...)

> Tham khảo danh sách agents tại `.agent/agents/`, skills tại `.agent/skills/SKILL-INDEX.md`, MCP tại `_shared/mcp-protocol.md`.

### Step 3: Assign Waves (with Dependencies)
Group plans by dependencies, sử dụng `depends_on` attribute:

```
Wave 1 (depends_on: none):  [Plans with no dependencies]      → Parallel
Wave 2 (depends_on: wave-1): [Plans depending on Wave 1]      → Parallel
Wave 3 (depends_on: wave-2): [Plans depending on Wave 2]      → Sequential
```

Trong `wave-structure.md`, ghi rõ dependency:
```markdown
# Wave Structure — Phase {N}

## Wave 1 (depends_on: none)
- Plan 1: [name] — [brief description]
- Plan 2: [name] — [brief description]

## Wave 2 (depends_on: wave-1)
- Plan 3: [name] — [brief description]

## Wave 3 (depends_on: wave-2)
- Verify: integration testing
```

> **Backward-compatible:** Nếu `depends_on` không ghi → mặc định sequential ordering (wave 1 → 2 → 3).

### Step 4: Plan Check (BẮT BUỘC — v3.7)

> ⛔ Plan Check luôn chạy. Config `workflow.plan_check` chỉ toggle Enhanced Validation (over-engineering, tech audit, principles) ở phần dưới.

Invoke Reviewer agent to verify:
- [ ] Every requirement has at least one plan covering it
- [ ] No plan is too large (> 5 tasks = split it)
- [ ] No circular dependencies between plans
- [ ] Verification steps defined for each plan
- [ ] Reasoning-bank patterns considered
- [ ] **Field coverage estimate (v3.7)**: nếu REQ khai báo N fields → plan phải liệt kê đủ N fields trong tasks. Thiếu fields = plan chưa hoàn chỉnh.

**Enhanced Validation (v3.6)** — 3 kiểm tra bổ sung:

1. **Over-engineering detection**: Scan mỗi plan cho:
   - Abstractions không cần thiết (abstract factory khi chỉ 1 implementation, caching khi chưa có performance req)
   - Components/services không được yêu cầu bởi requirements
   - Premature optimization → hỏi justification hoặc simplify
   - Output: `⚠️ Potential over-engineering: [component] — not required by any REQ-xxx`

2. **Technology audit**: Kiểm tra tech stack decisions:
   - Mọi framework/library choice có justification từ Step 1.5 Elicitation?
   - AI tự chọn tech mà user chưa specify? → flag `⚠️ Implicit tech choice: [lib] — verify with user`

3. **Principles compliance**: So sánh plan với `project.md` section Principles:
   - Plan vi phạm nguyên tắc đã định? (VD: principles nói "minimal dependencies" nhưng plan thêm 5 thư viện)
   - Output: `✅ Aligned` hoặc `⚠️ Tension: [principle] vs [plan decision]`

### Step 4.5: Quick Challenge (Opt-in — v2.1)

> Inspired by Rune `adversary`. Pre-implementation red-team nhẹ.

**Khi nào chạy** (CHỈ 1 trong các điều kiện sau):
- Phase có requirements liên quan: auth, crypto, payment, data migration
- User yêu cầu rõ ràng: "chạy adversary check cho plan" hoặc tương tự
- Plan ảnh hưởng > 10 files hoặc > 3 services

**KHÔNG chạy**: cho phases UI-only, documentation, config changes.

**Nếu trigger → challenge trên 3 chiều:**

1. **Edge Cases** (2 phút):
   - Empty/zero/null inputs cho mỗi feature trong plan?
   - Race conditions nếu concurrent operations?
   - Partial failure — step 3/5 fail thì rollback thế nào?

2. **Security** (2 phút):
   - Input trust boundaries — plan có specify validation?
   - Auth gaps — unprotected routes/actions?
   - Data exposure — API responses có leak sensitive fields?

3. **Integration Risk** (2 phút):
   - Breaking changes — shared interfaces bị ảnh hưởng?
   - Migration gaps — DB migration có reversible?
   - Test invalidation — existing tests sẽ break?

**Output** (max 5 findings):
```
### Quick Challenge — [Phase Name]
- Findings: [N] | Verdict: PROCEED / HARDEN
| # | Dimension | Finding | Severity | Remediation |
|---|-----------|---------|----------|-------------|
| 1 | Security | No auth on /api/export | HIGH | Add auth middleware |
```

**Verdict**:
- ANY CRITICAL → **HARDEN** (thêm remediation vào plan trước khi execute)
- Chỉ MEDIUM/LOW → **PROCEED** (ghi notes cho implementation)
- **KHÔNG CÓ REVISE** — Quick Challenge advisory, không block

### Step 5: User Approval
Present plan summary to user (in `user_language`):
- Plan count + wave structure
- Estimated effort
- Ask for approval before execution

### Step 6: Save Plans
Save to `.nexus/phases/phase-{N}/`:
```
phase-{N}/
├── spec.md              ← (v3.6) functional specification
├── research.md          ← (v3.6) tech decisions & Context7 findings
├── clarifications.md    ← (v3.6) from /clarify, if run
├── phase-{N}-1-PLAN.md
├── phase-{N}-2-PLAN.md
├── phase-{N}-3-PLAN.md
└── wave-structure.md
```

**Memory write** — ghi `.nexus/memory/task-board.md` theo schema từ `memory-schema.md`:
```markdown
# Task Board — Phase {N}

## Wave 1
- [ ] Plan 1: [name] — ⬚ Waiting
- [ ] Plan 2: [name] — ⬚ Waiting

## Wave 2
- [ ] Plan 3: [name] — ⬚ Waiting (depends on Wave 1)
```

→ Track: `Memory: write: memory/task-board.md`

### Step 6.5: Finalize Usage Log (BẮT BUỘC)

Ghi vào `.nexus/logs/usage-log.md`.

> **Format**: Theo ĐÚNG format trong `.agent/maintenance/usage-logger.md`.
> **Self-check**: 6 fields bảng? Bảng Chi tiết? Không prose? Skills ≠ "nexus"?

### Step 7: Guide → Next Steps
Invoke `guide.md`:
- Suggest `/nexus:execute [phase]` to start execution
- Show wave structure overview

## Output
- All plans saved as XML-structured markdown
- Wave dependencies documented
- User approved and knows next step
