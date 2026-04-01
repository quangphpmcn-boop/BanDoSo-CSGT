# Memory Protocol

## Purpose
Shared memory allows agents to communicate across sessions and execution boundaries using Serena MCP or file-based storage.

## Memory Location
- Path: `.nexus/memory/`
- Configured in: `nexus.json → memory`

## Memory Tools & Standard Files
> **Full reference**: `_shared/mcp-protocol.md` Section 1 (Serena Memory) — liệt kê tools và standard memory files.
> **Schema chi tiết**: `.agent/orchestration/memory-schema.md` — lifecycle và format từng memory file.

## Read/Write Rules
1. **Read before write**: always read existing content before overwriting
2. **Append, don't replace**: for logs and progress, append new entries
3. **Archive, don't delete (v3.7)**: move phase artifacts (plans, summaries, task-board, results, verification-report) to `.nexus/archive/phase-{N}/` after phase completion. Only delete truly volatile files (`progress-*.md`). Giữ lại plans + evidence cho audit trail và Phantom Detection.
4. **Timestamp**: include ISO timestamp in every memory write
5. **Attribution**: include agent name in every memory write

## File-Based Fallback
If Serena MCP is not available, use direct file read/write to `.nexus/memory/` directory.

## Memory Sync with Serena

When Serena MCP is active, memory files can be synced to Serena's persistent memory for cross-session access.

### Sync Direction
**One-way: File → Serena** (file-based is always primary)

### Naming Convention
Prefix all Nexus memories with `nexus/`:
- `task-board.md` → `write_memory("nexus/task-board", content)`
- `progress-executor.md` → `write_memory("nexus/progress-executor", content)`
- `handover.md` → `write_memory("nexus/handover", content)`

### When to Sync
| Event | Sync Action |
|-------|-------------|
| Workflow completion | Sync `state.md` snapshot to Serena |
| Session end | Sync `handover.md` to Serena |
| Phase completion | Sync `task-board.md` + summary to Serena |

### Sync Rules
1. **File-based is primary** — if sync fails, workflow continues
2. **Sync is write-only** — never read from Serena to overwrite local files
3. **Prefix with `nexus/`** — isolation from other Serena memory usage
4. **Best-effort** — log sync failures, don't block

## Memory Types

Khi ghi vào reasoning-bank hoặc Serena memory, PHẢI chỉ định type:

| Type | Khi nào dùng | Ví dụ |
|------|-------------|-------|
| **DECISION** | Quyết định kiến trúc/tech stack | "Dùng SQLite thay Postgres vì offline-first" |
| **PATTERN** | Pattern giải quyết vấn đề thành công | "Import Excel: stream processing tránh OOM" |
| **ERROR** | Lỗi đã gặp + root cause + fix | "Unicode path: dùng os.fsencode" |
| **INSIGHT** | Phát hiện quan trọng về codebase | "PythonBridge timeout mặc định quá ngắn cho file lớn" |
| **CONVENTION** | Quy ước code/design đã thống nhất | "All dialog titles: 16px bold, uppercase" |

## Memory Lifecycle

| Giai đoạn | Trigger | Hành động |
|-----------|---------|-----------|
| **CREATE** | Ghi memory mới | `confidence = 0.7` (default) |
| **REINFORCE** | Memory được dùng lại | `confidence += 0.1`, `reuse_count += 1` |
| **DECAY** | Memory không dùng > 30 ngày | `confidence -= 0.1` mỗi 30 ngày |
| **PRUNE** | `confidence < 0.3` | Xóa bởi `/end` auto-prune |

## Reasoning-Bank Integration

| Structured Type | reasoning-bank field |
|----------------|---------------------|
| DECISION | `task_type: "decision"` |
| PATTERN | `task_type: "feature" / "refactor"` + `outcome: "success"` |
| ERROR | `task_type: "bugfix"` + `outcome: "success/failure"` |
| INSIGHT | `task_type: "research"` |
| CONVENTION | `tags: ["convention", "{domain}"]` |

## Khi Nào Ghi Memory

| Sự kiện | Type | Auto? |
|---------|------|:---:|
| Giải quyết bug | ERROR + PATTERN | ✅ `/execute` Step 3.7 |
| Quyết định tech | DECISION | ✅ `/init` |
| Phát hiện gotcha | INSIGHT | Manual |
| Thống nhất quy ước | CONVENTION | Manual |
| Fix pattern reusable | PATTERN | ✅ `/verify` Step 5.5 |

## See Also
- **Schema chi tiết**: `.agent/orchestration/memory-schema.md` — format từng memory file
