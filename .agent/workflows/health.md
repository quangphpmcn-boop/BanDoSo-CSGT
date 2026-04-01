---
description: Kiểm tra sức khỏe framework — phân tích vận hành nội bộ, phát hiện lỗi cấu hình, đánh giá hiệu quả agents/skills/MCP
---

# /nexus:health — Framework Health Check

## Mục đích
Kiểm tra **nội bộ framework** — không liên quan dự án. Tập trung vào:
- Cấu hình framework có đồng bộ không?
- Agents/Skills/MCP hoạt động đúng không?
- Quy trình ghi log có tuân thủ không?
- Reasoning Bank có healthy không?

## When to Run
- Khi framework mới cài vào dự án (post-install check)
- Khi nghi ngờ framework hoạt động sai (agent bỏ bước, log sai format)
- Định kỳ sau mỗi 3-5 sessions
- Trước khi release version mới của framework

## Prerequisites
- Read `.agent/maintenance/health-check.md` → detailed methodology
- Read `.agent/agents/_shared/bilingual-protocol.md` → language rules
- Read `nexus.json` → framework config

## Steps

### Step 1: Config Integrity Check
Kiểm tra **cấu hình framework** có nhất quán:

#### 1a. nexus.json Validation
```
Với từng field trong nexus.json:
  ✅ "bilingual.user_language" exists + is valid locale
  ✅ "workflow" section: mode, depth, auto_advance defined
  ✅ "agents.profile" matches one of profiles keys
  ✅ "agents.turn_limits" has all 6 agents
  ✅ "memory.provider" is "serena" or "file"
  ✅ "performance" section exists with max_file_lines, reasoning_bank_max_patterns
  ✅ "health_checks" section exists
```

#### 1b. Critical Files Integrity
Kiểm tra files bắt buộc tồn tại:
```
.agent/workflows/         → đếm files, expected: 15
.agent/skills/            → đếm categories, expected: 14
.agent/agents/            → đếm agents, expected: 6 (cộng thêm _shared/ có 13 files)
.agent/orchestration/     → orchestrator.md, memory-schema.md
.agent/maintenance/       → health-check.md, usage-logger.md
.agent/templates/         → đếm files, expected: 10
GEMINI.md                 → tồn tại + không rỗng
nexus.json                → valid JSON
```

#### 1c. GEMINI.md ↔ nexus.json Sync Check
So sánh rules trong `GEMINI.md` với config `nexus.json`:
- `GEMINI.md` lists 15 workflows ↔ `.agent/workflows/` có đủ 15 files
- `GEMINI.md` mentions 116+ skills ↔ `.agent/skills/SKILL-INDEX.md` matches
- `GEMINI.md` rules ↔ không conflict với `nexus-guide.md`

### Step 2: MCP Connectivity & Function Test
Kiểm tra **từng MCP server** chi tiết:

#### 2a. Serena MCP
| Check | Command | Expected |
|-------|---------|----------|
| Connection | `get_current_config` | Returns config |
| Memory read | `list_memories` | Returns list |
| Memory write | `write_memory("_health_test", "ping")` | Success |
| Memory cleanup | `delete_memory("_health_test")` | Success |
| Symbolic tools | `find_symbol("test")` | Returns results |

> **Common Failures**: Serena not activated → gọi `activate_project` trước. Project path sai → check project root.

#### 2b. Context7 MCP
| Check | Command | Expected |
|-------|---------|----------|
| Connection | `resolve-library-id("react")` | Returns library IDs |
| Docs fetch | `query-docs(id, "hooks")` | Returns documentation |

> **Common Failures**: Network timeout, rate limiting, library not indexed.

#### 2c. Pencil MCP
| Check | Command | Expected |
|-------|---------|----------|
| Connection | `get_editor_state` | Returns editor info (active file, selection) |

> **Common Failures**: Extension not installed, Pencil not running, no `.pen` file open.

### Step 3: Workflow Compliance Audit
Đọc `.nexus/logs/usage-log.md` và kiểm tra **tuân thủ quy trình**:

#### 3a. Log Format Compliance
Với mỗi entry trong usage-log:
- [ ] Có bảng 6 fields? (Agents, Skills, Workflows, Memory, MCP Tools, Protocols)
- [ ] Có bảng "Chi tiết Tasks"?
- [ ] Không viết prose/bullet thay cho bảng?
- [ ] Skills field KHÔNG chứa "nexus" (phải ghi domain skill)?
- [ ] Timestamp đúng format `[YYYY-MM-DD HH:MM]`?

Tỷ lệ tuân thủ: `{compliant_entries}/{total_entries}` = `{rate}%`

#### 3b. Workflow Coverage
Đếm tần suất mỗi workflow:
```
Workflow Coverage:
  execute.md    ████████████ 45%  (12 runs)
  quick.md      ██████       23%  (6 runs)
  verify.md     █████        18%  (5 runs)
  plan.md       ███          12%  (3 runs)
  design.md     █             4%  (1 run)
  review.md     ░             0%  (0 runs) ⚠️ CHƯA TỪNG DÙNG
```

> ⚠️ **Red Flags**: `verify` = 0 → không verify; `review` = 0 → không QA; `plan` = 0 nhưng `execute` > 0 → bỏ qua planning

#### 3c. Workflow Sequence Check
Kiểm tra thứ tự workflow có đúng lifecycle:
```
Đúng:  init → design → plan → execute → verify → audit → review
Sai:   execute → plan (plan SAU execute)
Sai:   execute → execute → execute (không verify)
```

### Step 4: Agent & Skill Analysis
Phân tích agents và skills **từ góc nhìn vận hành**:

#### 4a. Agent Load Balance
```
Agent Distribution:
  executor   ████████████ 55%  → ⚠️ Overloaded? Check if debugger should handle some
  reviewer   ██████       22%
  planner    ████         15%
  designer   ██            8%
  debugger   ░             0%  → ⚠️ 0% nhưng có errors = debugger không được invoke
  architect  ░             0%  → OK nếu project đã init xong
```

> **Red Flags**:
> - Executor > 60% + errors > 20% → agent bị overload, cần break tasks nhỏ hơn
> - Debugger = 0% nhưng usage-log có errors → debugger không được gọi khi có lỗi
> - Reviewer = 0% → không có quality gate

#### 4b. Skill Naming Compliance
Kiểm tra field "Skills" trong usage-log:
- ⛔ Entries chứa "nexus" → SAI (phải ghi domain skill)
- ✅ Entries ghi sub-skill cụ thể (flutter-expert, python-pro...)
- Tỷ lệ đúng: `{correct}/{total}` entries

#### 4c. Skill Coverage vs Available
```
Available Skills: 116 across 13 categories
Used Skills:     X unique
Unused Skills:   Y

Category Coverage:
  frontend/   ████████ 80% (8/10 skills used)
  backend/    █████    50% (5/10 skills used)
  mobile/     ██       20% (2/10 skills used)
  testing/    ░         0% ⚠️ category hoàn toàn chưa dùng
```

### Step 5: Reasoning Bank Health
Kiểm tra `.nexus/memory/reasoning-bank.json`:

| Check | Metric | Threshold | Status |
|-------|--------|-----------|--------|
| File exists | — | must exist | ✅/❌ |
| Valid JSON | parse test | must parse | ✅/❌ |
| Pattern count | `total_patterns` | ≤ max (`nexus.json`) | ✅/⚠️ |
| Success rate | `stats.success_rate` | ≥ 0.6 | ✅/⚠️ |
| Stale patterns | `reuse_count == 0` + age > 30d | ≤ 30% of total | ✅/⚠️ |
| Domain diversity | unique domains | ≥ 2 | ✅/⚠️ |

### Step 6: Storage & File System
```
.nexus/ Analysis:
  Total files:      {N}     → ⚠️ if > 500
  Memory files:     {N}     → list active memory files
  Log size:         {size}  → ⚠️ if usage-log > 50KB
  Phase directories: {N}
```

### Step 6.5: Finalize Usage Log (BẮT BUỘC)

Ghi vào `.nexus/logs/usage-log.md`.

> **Format**: Theo ĐÚNG format trong `.agent/maintenance/usage-logger.md`.
> **Self-check**: 6 fields bảng? Bảng Chi tiết? Không prose? Skills ≠ "nexus"?

### Step 7: Generate Report
Present in `user_language`:

```
━━━ 🏥 BÁO CÁO SỨC KHỎE FRAMEWORK ━━━

⚙️ Cấu hình
  nexus.json: {✅ Valid / ❌ N errors}
  GEMINI.md:  {✅ Sync / ⚠️ Out of sync}
  Files:      {X}/{Y} critical files OK

🔌 MCP Connectivity
  Serena:   {✅ Full / ⚠️ Partial / ❌ Down}
  Context7: {✅ OK / ❌ Down}
  Pencil:   {✅ OK / ❌ Down}

📋 Workflow Compliance
  Log format: {rate}% tuân thủ ({N} violations)
  Coverage:   {X}/12 workflows đã dùng
  Sequence:   {✅ Đúng lifecycle / ⚠️ N violations}

👤 Agents
  Distribution: {bar chart}
  Red flags:    {list hoặc "không có"}

🛠️ Skills ({used}/{available})
  Naming:   {rate}% đúng quy tắc
  Coverage: {categories_used}/{categories_total} categories
  Top 5:    {list}

🧠 Reasoning Bank
  Patterns: {count}/{max} │ Success: {rate}%
  Stale:    {N} │ Domains: {list}

💾 Storage
  .nexus/: {N} files │ Log: {size}

━━━ 💡 VẤN ĐỀ PHÁT HIỆN ━━━

{Danh sách vấn đề, sắp theo severity}

🔴 {Critical issues}
🟡 {Warnings}
🔵 {Info/suggestions}

━━━ 🔧 KHUYẾN NGHỊ ━━━

{Danh sách khuyến nghị cụ thể, có hành động}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 8: Evidence-Based Recommendations
See `.agent/maintenance/health-check.md` Step 8 for full recommendation table.

Only recommend based on data — never speculate.

## Output
- Framework health report (internal operations focus)
- Issues detected with severity
- Actionable recommendations
