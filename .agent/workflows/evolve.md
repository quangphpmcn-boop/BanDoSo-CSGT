---
description: Cluster patterns → suggest skill amendments — cho phép skills tự tiến hóa qua thời gian
---

# /nexus:evolve — Cluster Patterns & Evolve Skills

## When to Run
- **Thủ công**: Khi user muốn review patterns và cải tiến skills
- **Khuyến nghị**: Chạy trước `/design` hoặc `/plan` phase mới để skills up-to-date
- **Tần suất**: Mỗi 2-3 sessions hoặc khi reasoning-bank có 5+ skill candidates

## Prerequisites
- `reasoning-bank.json` tồn tại tại `.nexus/memory/reasoning-bank.json`
- Có ít nhất 1 pattern với `skill_candidate: true`

## Steps

### Step 1: Load & Analyze Patterns

```
1. Read .nexus/memory/reasoning-bank.json
2. Filter patterns: confidence >= 0.7 HOẶC skill_candidate == true
3. Nếu < 2 qualifying patterns → thông báo "Chưa đủ data để evolve" → EXIT
```

### Step 2: Cluster by Domain + Tags

```
1. Group patterns theo domain (primary key) + tags overlap (secondary)
2. Cho mỗi cluster:
   - Yêu cầu: size >= 2 patterns
   - Tính avg_confidence = average(cluster.patterns.confidence)
   - Nếu avg_confidence < 0.7 → skip cluster
3. Loại bỏ singleton clusters (1 pattern không cluster được)
```

### Step 3: Map to Target Skills

```
Cho mỗi qualifying cluster:
1. Đọc SKILL-INDEX.md → tìm skill matching cluster domain/tags
2. Xác định target_skill:
   - domain "flutter" → "flutter-expert"
   - domain "python" + tags ["testing"] → "python-testing-patterns"
   - domain "database" → "database-design"
   - Dùng Skill Inference Guide từ usage-logger.md nếu cần
3. Nếu không tìm được target → suggested_action = "new_section_in_nearest_skill"
```

### Step 4: Generate Amendments

```
Cho mỗi cluster với target_skill:
1. Đọc target SKILL.md → hiểu structure hiện tại
2. Generate suggested_addition:
   - Format: markdown section phù hợp với style của SKILL.md
   - Nội dung: tổng hợp approach_summary + evidence từ tất cả patterns trong cluster
   - Ví dụ output:
   
   ## Bridge Safety Checklist (Learned from Project)
   > Auto-evolved from {N} patterns, avg confidence {X}%
   
   - Always null-check bridge responses before accessing properties
   - Add timeout handling for async bridge calls (default: 10s)
   - Log bridge errors with full stack traces for debugging
   
3. Tạo evolution_cluster entry:
   {
     "id": "C{auto}",
     "name": "{descriptive cluster name}",
     "pattern_ids": ["P001", "P003", "P007"],
     "avg_confidence": 0.82,
     "suggested_action": "skill_amendment",
     "target_skill": "flutter-expert",
     "suggested_addition": "{markdown content}",
     "status": "pending_review"
   }
```

### Step 5: Present for Review

Hiển thị interactive review cho user:

```
━━━ 🧬 EVOLUTION ANALYSIS ━━━
📊 {N} patterns analyzed | {M} clusters formed

╔════════════════════════════════════════════════╗
║ Cluster C001: "Flutter Bridge Safety"          ║
║ Patterns: 3 | Avg Confidence: 82%              ║
║ Target: flutter-expert SKILL.md                ║
╠════════════════════════════════════════════════╣
║ Suggested Addition:                            ║
║                                                ║
║ ## Bridge Safety Checklist (Learned)            ║
║ - Null-check bridge responses                  ║
║ - Add timeout handling (10s default)            ║
║ - Log errors with stack traces                  ║
╚════════════════════════════════════════════════╝

📋 Actions:
  [1] ✅ Approve — append to flutter-expert SKILL.md
  [2] ✏️ Edit — modify suggestion before applying
  [3] ❌ Skip — mark reviewed but don't apply
  [4] 🗑️ Dismiss — remove cluster (patterns stay)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 6: Apply Approved Amendments

```
Cho mỗi cluster user approved:
1. Read target SKILL.md
2. Append suggested_addition tại cuối file (trước dấu --- nếu có)
3. Update cluster.status = "applied"
4. Update reasoning-bank stats.patterns_evolved_to_skills += 1
5. Update stats.last_evolution_check = today

Cho mỗi cluster user skipped:
1. Update cluster.status = "reviewed"

Cho mỗi cluster user dismissed:
1. Remove từ evolution_clusters[]
2. Patterns vẫn giữ nguyên trong patterns[]
```

### Step 6.5: Sync Amendments to Source

Nếu `nexus.json → evolution.sync_to_source.sync_skill_amendments` là `true`:

```
1. Kiểm tra .agent/.nexus-source tồn tại
2. Chạy /sync-knowledge workflow — Step 3 (Sync Skill Amendments only)
3. Log: "[Sync] Skill amendments synced to source"
```

> Đảm bảo amendments user vừa approve được sync ngay về source framework.

### Step 7: Confidence Decay Check

```
Nhân tiện evolve, kiểm tra confidence decay:
1. Cho mỗi pattern:
   - last_event_date = evolution_log[-1].date
   - days_since = today - last_event_date
   - Nếu days_since >= 30:
     pattern.confidence -= 0.05
     Append evolution_log: { event: "decayed", confidence_delta: "-0.05" }
   - Nếu confidence < 0.2:
     Mark for auto-prune (log warning, không xóa tự động trong /evolve)
2. Save reasoning-bank.json
```

### Step 7.5: Finalize Usage Log (BẮT BUỘC)

Ghi vào `.nexus/logs/usage-log.md`.

> **Format**: Theo ĐÚNG format trong `.agent/maintenance/usage-logger.md`.
> **Self-check**: 6 fields bảng? Bảng Chi tiết? Không prose? Skills ≠ "nexus"?

### Step 8: Output Summary

```
━━━ 🧬 EVOLUTION COMPLETE ━━━

📝 Results:
  - Clusters analyzed: {N}
  - Skills amended: {M} ({list skill names})
  - Clusters skipped: {X}
  - Clusters dismissed: {Y}

⚠️ Decay Warnings:
  - {Z} patterns confidence decayed (30+ days inactive)
  - {W} patterns near auto-prune threshold (< 0.3)

💡 Tip: Patterns tích lũy theo thời gian.
   Chạy /learn thường xuyên để reasoning-bank phong phú hơn.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Evolution Rules (Khi Nào KHÔNG Evolve)

- **Cluster < 2 patterns**: Chưa đủ evidence → skip
- **avg_confidence < 0.7**: Patterns chưa đủ mạnh → skip
- **Target skill không tìm được**: Log warning, không force-create skill mới
- **Suggestion trùng với SKILL.md hiện tại**: Skip (đã có rồi)

## Notes

- **Evolution = amend existing skills, KHÔNG tạo skills mới**
- Skills hiện tại trở nên sâu hơn cho project cụ thể qua thời gian
- User luôn có quyền approve/reject mỗi suggestion
- Patterns không bị xóa khi evolve — chúng vẫn tracking
- SKILL.md amendments có comment `(Learned from Project)` để phân biệt
