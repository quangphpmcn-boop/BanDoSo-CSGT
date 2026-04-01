# Health Check Methodology — Chi tiết kiểm tra nội bộ Framework

## Purpose
Tài liệu chi tiết cho `/nexus:health`. Tập trung vào **vận hành nội bộ framework**, không phải dự án.

## Data Sources
1. `nexus.json` — framework configuration
2. `GEMINI.md` — rules that Antigravity auto-loads
3. `.agent/` directory — framework files (workflows, skills, agents, orchestration)
4. `.nexus/logs/usage-log.md` — framework usage history
5. `.nexus/memory/reasoning-bank.json` — self-learning patterns
6. MCP servers — live connectivity tests

---

## Step 1: Config Integrity — Chi tiết

### nexus.json Required Fields

| Section | Field | Type | Validation |
|---------|-------|------|------------|
| `bilingual` | `user_language` | string | Must be valid locale (vi, en, ...) |
| `bilingual` | `technical_language` | string | Must be valid locale |
| `workflow` | `mode` | string | "interactive" or "autonomous" |
| `workflow` | `plan_check` | bool | Must exist |
| `agents` | `profile` | string | Must match key in `profiles` |
| `agents` | `turn_limits` | object | Must have 6 agent keys |
| `memory` | `provider` | string | "serena" or "file" |
| `performance` | `reasoning_bank_max_patterns` | int | > 0 |
| `health_checks` | all 7 flags | bool | Must exist |

### Critical Files List

```
REQUIRED FILES (installer integrity check):
  .agent/workflows/init.md
  .agent/agents/executor/SKILL.md
  .agent/orchestration/orchestrator.md
  .agent/skills/nexus/SKILL.md
  .agent/templates/reasoning-bank.json
  GEMINI.md
  nexus.json
```

### GEMINI.md ↔ nexus.json Cross-Check

| GEMINI.md claim | Verify against |
|-----------------|----------------|
| "12 workflow definitions" | Count files in `.agent/workflows/` |
| "116+ skills" | Count in `.agent/skills/SKILL-INDEX.md` |
| "6 agents + 12 shared protocols" | Count dirs in `.agent/agents/` + files in `_shared/` |
| Rules numbered 1-N | No gaps, no duplicates |

---

## Step 3: Workflow Compliance — Chi tiết

### Common Log Violations

| Violation | How to Detect | Severity |
|-----------|---------------|----------|
| Prose instead of table | No `\|` characters in entry | 🔴 Critical |
| Missing Skills field | Table has < 6 rows | 🔴 Critical |
| "nexus" in Skills | `Skills` row contains "nexus" | 🟡 Warning |
| Missing "Chi tiết Tasks" | No second table | 🟡 Warning |
| No "Sự cố & Fix" column | Second table has < 4 columns | 🟡 Warning |
| Missing timestamp | Entry starts without `[20` | 🔵 Info |

### Workflow Lifecycle Rules

| Rule | Valid Sequences | Invalid Examples |
|------|----------------|------------------|
| Plan before Execute | plan → execute | execute without plan |
| Verify after Execute | execute → verify | execute → next phase (no verify) |
| Init once only | init at start | multiple inits |
| Design before Plan (if UI) | design → plan | plan without design (when has UI reqs) |

---

## Step 4: Agent Analysis — Chi tiết

### Expected Agent Distribution by Project Type

| Project Type | executor | planner | designer | reviewer | debugger | architect |
|-------------|----------|---------|----------|----------|----------|-----------|
| New full-stack | 40-50% | 15-20% | 10-15% | 10-15% | 5-10% | 5-10% |
| Bug fix sprint | 20-30% | 5-10% | 0% | 15-20% | 30-40% | 0% |
| Refactor | 40-50% | 15-20% | 0% | 20-30% | 5-10% | 5-10% |
| UI redesign | 30-40% | 10-15% | 20-30% | 15-20% | 5% | 5% |

### Red Flag Detection

| Signal | Interpretation | Action |
|--------|---------------|--------|
| Executor > 60% + error > 20% | Tasks quá lớn hoặc plans thiếu chi tiết | Break plans thành tasks nhỏ hơn |
| Debugger = 0% + errors > 0 | Lỗi được fix bởi executor thay vì debugger | Invoke debugger cho errors |
| Reviewer = 0% | Không có quality gate | Chạy `/review` sau mỗi phase |
| Planner = 0% + Execute > 0 | Bỏ qua planning | Luôn `/plan` trước `/execute` |
| Designer = 0% + UI project | Không thiết kế trước khi code | Chạy `/design` cho phases có UI |

---

## Step 5: Reasoning Bank Analysis — Chi tiết

### Health Thresholds

| Metric | Green ✅ | Yellow ⚠️ | Red 🔴 |
|--------|----------|-----------|--------|
| Pattern count | ≤ 80% max | 80-100% max | > max |
| Success rate | ≥ 70% | 40-70% | < 40% |
| Stale ratio | ≤ 20% | 20-50% | > 50% |
| Domain diversity | ≥ 3 domains | 2 domains | 1 domain |
| Avg confidence | ≥ 0.7 | 0.5-0.7 | < 0.5 |

### Auto-Prune Triggers
- `total_patterns > max` → remove lowest confidence + oldest
- `stale_ratio > 50%` → remove stale patterns
- `age > prune_days` + `reuse_count == 0` → remove

---

## Step 8: Recommendation Table

| Condition | Severity | Recommendation |
|-----------|----------|----------------|
| nexus.json missing fields | 🔴 | "Thêm fields thiếu vào nexus.json: {list}" |
| Critical file missing | 🔴 | "Chạy lại installer hoặc copy file thủ công: {file}" |
| MCP server down | 🟡 | "{server} không khả dụng. Kiểm tra kết nối hoặc restart." |
| MCP all down | 🔴 | "Tất cả MCP unavailable. Framework vẫn hoạt động nhưng thiếu tools." |
| Log compliance < 80% | 🟡 | "{N} entries sai format. Xem lại log-format trong GEMINI.md." |
| Log compliance < 50% | 🔴 | "Nghiêm trọng: {N}% entries sai format. Agent không tuân thủ rules." |
| "nexus" in Skills | 🟡 | "{N} entries ghi 'nexus' thay vì domain skill. Xem `.agent/skills/SKILL-INDEX.md`." |
| Workflow sequence violated | 🟡 | "Phát hiện {N} vi phạm thứ tự workflow. Execute PHẢI sau Plan." |
| Verify never used | 🔴 | "Chưa từng verify — không đảm bảo chất lượng." |
| Review never used | 🟡 | "Chưa từng review — khuyến nghị chạy `/review` sau mỗi phase." |
| Agent overloaded | 🟡 | "Executor chiếm {N}% workload + {M}% errors. Break plans thành tasks nhỏ hơn." |
| Debugger unused but errors exist | 🟡 | "Có {N} errors nhưng debugger chưa được invoke. Cân nhắc dùng debugger cho lỗi phức tạp." |
| Reasoning bank > 80% capacity | 🟡 | "Reasoning bank gần đầy ({N}/{max}). Auto-prune sẽ kích hoạt khi vượt max." |
| Reasoning bank stale > 50% | 🟡 | ">{N}% patterns không được tái sử dụng. Cân nhắc prune thủ công." |
| Storage > 500 files | 🟡 | ".nexus/ có {N} files. Xem xét cleanup memory/ và phases/ cũ." |
| Skill category 0% used | 🔵 | "Category `{cat}` chưa dùng. Có thể loại nếu không liên quan dự án." |
| Skill used > 5 times | 🔵 | "Skill `{name}` dùng thường xuyên. Đảm bảo đã đọc docs mới nhất via Context7." |
| No usage data | 🟡 | "Chưa có dữ liệu usage-log. Đảm bảo agents ghi log sau mỗi workflow." |

## Output
Framework health report with issues detected and actionable recommendations.
