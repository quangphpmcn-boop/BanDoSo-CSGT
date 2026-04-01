---
description: Extract patterns từ usage-log — tự động hóa skill evolution qua reasoning-bank v2
---

# /nexus:learn — Extract Reusable Patterns

## When to Run
- **Tự động**: Cuối mỗi `/end` workflow (Step 2.8)
- **Thủ công**: User gọi bất kỳ lúc nào muốn extract patterns từ session hiện tại
- Sau khi giải quyết bug phức tạp
- Sau khi refactor thành công
- Sau khi tìm ra workaround cho library/API

## Steps

### Step 1: Đọc Usage Log

```
1. Read .nexus/logs/usage-log.md
2. Tìm entries CHƯA được analyze:
   - So sánh timestamps log entries vs reasoning-bank.json → stats.last_learn_run
   - Entries mới hơn last_learn_run = chưa analyze
3. Nếu không có entries mới → thông báo "Không có data mới để learn" → EXIT
```

### Step 2: Extract Patterns từ Sự Cố & Fix

Cho mỗi task entry có cột "Sự cố & Fix" ≠ "—":

```
1. Parse: Problem → Root Cause → Solution
2. Tạo pattern candidate:
   {
     "domain": "{infer từ Skills column}",
     "task_type": "{bugfix|feature|refactor|performance}",
     "description": "{task name}",
     "approach_summary": "{1-line: problem → solution}",
     "outcome": "{success|partial|failure — từ Trạng thái column}",
     "tags": ["{keywords từ description + domain}"]
   }
```

### Step 3: Deduplicate & Merge

```
1. Read .nexus/memory/reasoning-bank.json (hoặc tạo từ template nếu chưa có)
2. Cho mỗi pattern candidate:
   a. Tìm existing pattern có CÙNG domain + approach_summary tương tự (fuzzy match)
   b. NẾU TÌM THẤY (duplicate):
      - existing.reuse_count += 1
      - existing.confidence += 0.1 (cap tại 0.95)
      - Append vào existing.evolution_log:
        { "date": "{today}", "event": "reinforced", "confidence_delta": "+0.1",
          "evidence": "{session reference}" }
   c. NẾU KHÔNG TÌM THẤY (new):
      - Tạo pattern mới:
        - id: "P{auto-increment}"
        - confidence: 0.5 (baseline)
        - reuse_count: 0
        - observation_source: "{workflow/phase/wave reference}"
        - evolution_log: [{ "date": "{today}", "event": "created",
            "confidence_delta": "+0.5", "evidence": "{task description}" }]
        - skill_candidate: false
        - related_patterns: []
```

### Step 4: Detect Skill Candidates

```
Cho mỗi pattern trong reasoning-bank:
  NẾU reuse_count >= 3 AND confidence >= 0.7:
    pattern.skill_candidate = true
    Tìm patterns CÙNG domain → thêm vào related_patterns
```

### Step 5: Update Stats & Save

```
1. Cập nhật stats:
   - total_patterns: count(patterns)
   - success_rate: count(outcome=success) / total
   - top_domains: top 3 domains by count
   - avg_confidence: average(patterns.confidence)
   - last_learn_run: "{YYYY-MM-DD HH:MM}"
2. Write reasoning-bank.json
3. Log: "[Learn] Extracted {N} new patterns, reinforced {M} existing"
```

### Step 5.5: Finalize Usage Log (BẮT BUỘC)

Ghi vào `.nexus/logs/usage-log.md`.

> **Format**: Theo ĐÚNG format trong `.agent/maintenance/usage-logger.md`.
> **Self-check**: 6 fields bảng? Bảng Chi tiết? Không prose? Skills ≠ "nexus"?

### Step 6: Output Summary

```
━━━ 🧠 LEARN COMPLETED ━━━

📊 Session Analysis:
  - Tasks analyzed: {N}
  - Sự cố found: {M}

📝 Patterns:
  - New: {X} created (confidence 0.5)
  - Reinforced: {Y} existing (confidence ↑)
  - Skill candidates: {Z} (confidence ≥ 0.7, reuse ≥ 3)

💡 Gợi ý:
  - Chạy /evolve để xem skill amendment suggestions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Pattern Schema (reasoning-bank v2)

```json
{
  "id": "P001",
  "domain": "flutter",
  "task_type": "bugfix",
  "description": "Service bridge null check",
  "approach_summary": "TypeError null → add null guard before bridge call",
  "outcome": "success",
  "confidence": 0.85,
  "tags": ["flutter", "bridge", "null-safety"],
  "created": "2026-01-15",
  "reuse_count": 3,
  "observation_source": "execute/phase-1/wave-1",
  "evolution_log": [
    {
      "date": "2026-01-15",
      "event": "created",
      "confidence_delta": "+0.5",
      "evidence": "Task 4 failed with TypeError"
    }
  ],
  "skill_candidate": true,
  "related_patterns": ["P003", "P007"]
}
```

## Confidence Rules

| Event | Delta | Cap |
|-------|-------|-----|
| Pattern tạo mới | +0.5 | — |
| Reused thành công | +0.1 | 0.95 |
| User manually applied | +0.15 | 0.95 |
| Giải quyết same error lần 2+ | +0.2 | 0.95 |
| User sửa ngược | -0.1 | — |
| 30 ngày không observe | -0.05 | — |
| Pattern → failure outcome | -0.2 | — |
| Auto-prune threshold | < 0.2 | Xóa |

## Notes

- **Không extract trivial patterns**: typos, syntax errors, import thiếu
- **Focus có giá trị**: Patterns sẽ tiết kiệm thời gian trong sessions tương lai
- **1 pattern per insight**: Không bundle nhiều fixes vào 1 pattern
- **Privacy**: Chỉ lưu summaries, không log raw code
