---
description: Sync kiến thức (reasoning-bank + skill amendments) từ dự án ngược về source framework
---

# /nexus:sync-knowledge — Knowledge Backflow

## Mục đích

Đồng bộ kiến thức tích lũy từ dự án (qua `/learn` và `/evolve`) **ngược về** source framework.
Giải quyết vấn đề "đảo kiến thức" — mỗi dự án học riêng nhưng source không bao giờ nhận được.

## When to Run

- **Tự động**: Cuối mỗi `/end` workflow (Step 2.9) — sync reasoning-bank patterns
- **Tự động**: Sau `/evolve` Step 6 — sync skill amendments vừa approve
- **Thủ công**: User gọi bất kỳ lúc nào muốn sync knowledge về source

## Prerequisites

- File `.agent/.nexus-source` tồn tại (chứa absolute path tới source framework)
- Source path hợp lệ và accessible

## Steps

### Step 1: Resolve Source Path

```
1. Read .agent/.nexus-source
2. Validate:
   a. File tồn tại → parse source_path
   b. Source path trỏ tới thư mục hợp lệ có .agent/
   c. NẾU KHÔNG → log warning "Source path không hợp lệ, skip sync" → EXIT
3. Kiểm tra source != project (tránh self-sync khi dùng -Dev symlink)
```

### Step 2: Sync Reasoning Bank (Patterns)

> Chạy LUÔN — không cần evolve threshold. Dù 1 pattern mới cũng sync.

```
1. Read project: .nexus/memory/reasoning-bank.json (SOURCE_PROJ)
2. Read source:  {source_path}/.agent/knowledge/reasoning-bank.json (SOURCE_FW)
   → Nếu SOURCE_FW không tồn tại → tạo từ template
3. Cho mỗi pattern trong SOURCE_PROJ:
   a. Tìm matching pattern trong SOURCE_FW:
      - Match bằng: domain + approach_summary (fuzzy)
   b. NẾU MATCH (đã có):
      - Nếu SOURCE_PROJ.confidence > SOURCE_FW.confidence:
        → Update SOURCE_FW confidence = max(both)
      - SOURCE_FW.reuse_count += SOURCE_PROJ.reuse_count (nếu chưa counted)
      - Append evolution_log entry:
        { "date": "{today}", "event": "synced_from_project",
          "confidence_delta": "{delta}", "evidence": "{project name}" }
   c. NẾU KHÔNG MATCH (mới):
      - Copy pattern vào SOURCE_FW.patterns[]
      - Đặt observation_source = "{project_name}/{original_source}"
      - Append evolution_log entry:
        { "date": "{today}", "event": "synced_from_project",
          "confidence_delta": "+0", "evidence": "New from {project name}" }
4. Update SOURCE_FW stats:
   - total_patterns, success_rate, top_domains, avg_confidence
   - last_sync_from_project = "{today}"
   - sync_count += 1
5. Save SOURCE_FW
```

### Step 3: Sync Skill Amendments

> Chỉ chạy nếu `nexus.json → evolution.sync_to_source.sync_skill_amendments` = true.

```
1. Scan TẤT CẢ SKILL.md files trong project .agent/skills/
2. Cho mỗi SKILL.md:
   a. Tìm sections có marker "(Learned from Project)"
   b. Cho mỗi learned section:
      - Read source SKILL.md tương ứng
      - Kiểm tra section ĐÃ CÓ trong source chưa (compare heading text)
      - NẾU CHƯA CÓ → append section vào cuối source SKILL.md
      - NẾU ĐÃ CÓ → merge nội dung (append bullet points mới, skip duplicates)
3. Log: "Synced {N} skill amendments to source"
```

### Step 4: Log & Report

```
1. Ghi sync log vào .nexus/logs/usage-log.md (theo format chuẩn)
2. Output:

━━━ 🔄 KNOWLEDGE SYNC ━━━

📊 Reasoning Bank:
  - Patterns synced: {new} new | {updated} updated | {skipped} unchanged
  - Source total: {total} patterns

📝 Skill Amendments:
  - Files scanned: {N}
  - Amendments synced: {M} new | {K} merged

📂 Source: {source_path}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 4.5: Finalize Usage Log (BẮT BUỘC)

Ghi vào `.nexus/logs/usage-log.md`.

> **Format**: Theo ĐÚNG format trong `.agent/maintenance/usage-logger.md`.
> **Self-check**: 6 fields bảng? Bảng Chi tiết? Không prose? Skills ≠ "nexus"?

## Merge Rules

| Scenario | Action |
|----------|--------|
| Pattern mới (không có trong source) | Copy nguyên vào source |
| Pattern trùng, project confidence cao hơn | Update source confidence = max |
| Pattern trùng, source confidence cao hơn | Giữ nguyên source, chỉ log sync |
| Skill amendment mới | Append vào source SKILL.md |
| Skill amendment trùng heading | Merge bullet points, skip duplicates |
| Source path không tồn tại | Warning + skip toàn bộ sync |
| Dev mode (symlink) | Skip sync (đã auto-sync qua symlink) |

## Notes

- **Không bao giờ XÓA** patterns từ source — chỉ thêm hoặc update
- **Source reasoning-bank** lưu tại `{source}/.agent/knowledge/reasoning-bank.json` — tách với template
- **Idempotent**: Chạy lại nhiều lần cho cùng data → kết quả giống nhau
- **Multi-project safe**: Nhiều dự án sync cùng lúc không conflict nhờ merge-by-content
- **Privacy**: Chỉ sync patterns (summaries), không sync raw code hay logs
