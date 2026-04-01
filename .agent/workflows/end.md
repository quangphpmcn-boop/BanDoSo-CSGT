---
description: Kết thúc phiên làm việc — lưu trạng thái, tạo handover, nhắc commit
---

# /nexus:end — Kết Thúc Phiên Làm Việc

## When to Run
- Trước khi tắt máy hoặc chuyển sang máy khác
- Khi cần tạm dừng dự án giữa chừng
- Cuối ngày làm việc

## Steps

### Step 1: Cập nhật `state.md`

Đọc `.nexus/state.md` → cập nhật section "Session Continuity":

```markdown
## Session Continuity

Last session: [YYYY-MM-DD HH:MM]
Machine: [tên máy tính hiện tại từ env/hostname]
Stopped at: [Mô tả chi tiết công việc cuối cùng đã hoàn thành]
Next step: [Bước tiếp theo cụ thể khi quay lại]
Handover: yes
```

Cũng cập nhật "Performance Metrics" và "Current Position" nếu có thay đổi.

### Step 2: Tạo Session Handover

Tạo/ghi đè `.nexus/session-handover.md`:

```markdown
# Session Handover

> Tạo bởi /end lúc [YYYY-MM-DD HH:MM]
> Máy: [hostname]

## Tóm tắt phiên
- Thời gian: [duration]
- Workflow đã chạy: [list]
- Kết quả: [summary]

## Công việc đang dở
[Chi tiết cụ thể — file nào đang sửa, feature nào chưa xong, test nào đang fail]

## Vấn đề cần chú ý
[Bugs, blockers, pending decisions, things to remember]

## Bước tiếp theo
1. [Bước cụ thể nhất khi quay lại]
2. [Bước tiếp]
3. [Bước tiếp]

## Files đã thay đổi trong phiên
[Liệt kê files đã tạo/sửa/xóa trong phiên này]
```

**Memory write**: ghi nội dung tương tự vào `.nexus/memory/handover.md` — theo `memory-protocol.md` section "Standard Memory Files".

### Step 2.5: Sync Memory lên Serena (nếu available)

Theo `memory-protocol.md` section "When to Sync":

| Event | Sync Action |
|-------|-------------|
| Session end | Sync `handover.md` → `write_memory("nexus/handover", content)` |
| Phase completed trong phiên | Sync `state.md` snapshot → `write_memory("nexus/state", content)` |

> Nếu Serena unavailable → bỏ qua. File-based là primary, Serena là best-effort.

### Step 2.7: Export Session Metrics (Post-Session Hook)

Trước khi kết thúc, tổng hợp metrics cho session này:

1. **Read** `.nexus/logs/usage-log.md` → count tasks, errors, commits trong session
2. **Read** `.nexus/memory/reasoning-bank.json` (nếu tồn tại) → patterns added/matched trong session
3. **Append** vào `session-handover.md`:

```markdown
## Session Metrics
- Tasks: {completed}/{total} | Errors: {count}
- Patterns: {matched} reused | {new} created
- Reasoning Bank: {total_patterns} total | {success_rate}% success rate
- Workflows: {list of workflows used}
```

4. **Reasoning Bank Summary** (nếu reasoning-bank tồn tại):
   - Auto-prune stale patterns (theo `nexus.json → performance.reasoning_bank_prune_days`)
   - Log prune count: "Pruned {N} stale patterns"

> Session metrics giúp `/start` của phiên sau hiểu được productivity trends.

### Step 2.8: Auto-Learn Patterns (Skill Evolution)

Nếu `nexus.json → evolution.auto_learn_on_end` là `true`:

```
1. Kiểm tra .nexus/logs/usage-log.md có entries mới chưa analyze
2. Nếu CÓ → chạy /learn workflow (xem learn.md)
3. Log kết quả: "[Auto-Learn] {N} new patterns, {M} reinforced"
4. Nếu KHÔNG → skip
```

> Auto-learn giúp reasoning-bank tự tích lũy patterns mà không cần user nhớ gọi `/learn` thủ công.

### Step 2.9: Sync Knowledge to Source (Knowledge Backflow)

Nếu `nexus.json → evolution.sync_to_source.enabled` là `true` VÀ `auto_sync_on_end` là `true`:

```
1. Kiểm tra .agent/.nexus-source tồn tại
2. Nếu CÓ → chạy /sync-knowledge workflow (xem sync-knowledge.md)
   - Sync reasoning-bank patterns (LUÔN LUÔN, dù 1 pattern)
   - Sync skill amendments (nếu có)
3. Log kết quả: "[Sync] {N} patterns synced to source"
4. Nếu .nexus-source KHÔNG tồn tại → skip, log "Source path unknown, skip sync"
```

> Knowledge sync đảm bảo kiến thức tích lũy từ dự án không bị kẹt local.
> Khác với `/evolve` — sync chạy KHÔNG cần threshold. Dù 1 pattern mới cũng sync.

### Step 3: Kiểm tra Git Status

```
Chạy: git status
  → Có uncommitted changes?
    → CÓ: Cảnh báo user và gợi ý:
      "⚠️ Có [N] files chưa commit. Khuyến nghị commit trước khi tắt máy."
      "Gợi ý: git add -A && git commit -m '[conventional message]'"
    → KHÔNG: ✅ "Code đã được commit đầy đủ."
  
  → Có unpushed commits?
    → CÓ: Nhắc push nếu dùng remote
    → KHÔNG: ✅
```

### Step 4: Xác nhận

Hiện summary cho user:

```
━━━ 💾 PHIÊN ĐÃ LƯU ━━━

📍 Dừng tại: [description]
📋 Handover: .nexus/session-handover.md ✅
📦 Git: [committed ✅ / ⚠️ N files chưa commit]
🔄 Sync: [synced {N} patterns ✅ / ⏭️ skipped (no source)]

▶ Khi quay lại máy khác, gõ /start để tiếp tục.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Output
- `state.md` cập nhật Session Continuity
- `session-handover.md` có đầy đủ nội dung chuyển giao
- User biết cần commit/push hay không
- Hướng dẫn rõ: gõ `/start` khi quay lại
