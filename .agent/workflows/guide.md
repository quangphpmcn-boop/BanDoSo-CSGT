---
description: Hướng dẫn — điều hướng bước tiếp theo chủ động sau mỗi workflow
---

# Guide Protocol

## Purpose
Never leave the user wondering "what do I do now?". After every workflow completes, automatically present:
1. Current position in the roadmap
2. 2-3 concrete next actions with explanations
3. Recommended action highlighted

## When to Invoke
- Automatically at the END of every other workflow (init, plan, execute, verify, review, audit, quick)
- Manually via `/progress`

## Steps

### Step 1: Read Context
- `.nexus/state.md` → current position
- `.nexus/roadmap.md` → phase structure
- `.nexus/memory/reasoning-bank.json` → pattern insights

### Step 2: Determine Available Actions

Based on current state:

| State | Available Actions |
|-------|------------------|
| Ready to design | `/design [N]`, `/plan [N]` (skip design), `/quick`, `/evolve`¹ |
| Ready to plan | `/clarify [N]` (khuyến nghị), `/plan [N]`, `/quick`, `/review`, `/evolve`¹ |
| Plans created | `/execute [N]`, `/review`, adjust plans |
| Execution in progress | Resume execution, `/quick`, `/progress` |
| Phase executed | `/verify [N]`, `/review`, `/audit`³, `/quick` |
| Phase verified | `/design [N+1]` or `/plan [N+1]`, `/review all`, `/audit full`³, `/learn`², `/evolve`¹ |
| All phases complete | Final `/review all`, `/audit full`³, `/learn`², `/evolve`¹, deployment, documentation |

> ¹ `/evolve`: Gợi ý khi reasoning-bank có ≥ 3 skill candidates (confidence ≥ 0.7, reuse ≥ 3)
> ² `/learn`: Gợi ý nếu usage-log có entries chưa analyze (hoặc auto_learn_on_end bị tắt)
> ³ `/audit`: Gợi ý sau execute/verify nếu phase có security, performance, hoặc accessibility concerns. Ưu tiên khi phase liên quan auth, API, data, hoặc UI public-facing.

### Step 2.5: Complexity Router (Auto-Suggest)

Khi user hỏi "nên làm gì?" hoặc khi `/guide` tự chạy, **đánh giá complexity** của task tiếp theo:

| Factor | 0 | 1 | 2 |
|--------|---|---|---|
| **Files affected** | 1 file | 2-3 files | 4+ files |
| **Module scope** | Same module | 2 modules | Cross-module |
| **Task type** | Bug fix / typo | Enhancement | New feature / architecture |
| **Risk level** | Low (styling, text) | Medium (logic) | High (data, security) |
| **Test impact** | No test changes | Update existing tests | New test suite needed |

**Auto-route based on total score (0-10):**

| Score | Suggested Workflow | Rationale |
|-------|-------------------|-----------|
| 0-2 | `/quick` | Simple task, under 10 phút |
| 3-5 | `/clarify [N]` → `/plan [N]` (1 wave) | Moderate task, cần clarify + plan |
| 6-8 | `/clarify → /plan → /execute → /verify` | Complex task, full execution cycle |
| 9-10 | `/design → /clarify → /plan → /execute → /verify → /audit → /review` | Critical task, cần toàn bộ lifecycle + audit |

> **Lưu ý /evolve**: Với score 6+, nếu reasoning-bank có skill candidates → gợi ý `/evolve` trước `/design` hoặc `/plan` để skills up-to-date.

> **Lưu ý:** Đây là **gợi ý**, user luôn có thể override. Hiển thị score + reasoning trong guide block.

### Step 3: Render Guide Block

Format (in `user_language`):

```
━━━ 🧭 HƯỚNG DẪN TIẾP THEO ━━━

Phase [X]/[Y]: [Phase Name] │ Tiến độ: [████░░░░░░] XX%
🧠 Reasoning Bank: [N] patterns | [M] skill candidates

▶ [Context of what just happened]. Các bước tiếp:

  1. /[cmd] [args]  → [Description] (khuyến nghị)
  2. /[cmd] [args]  → [Description]
  3. /[cmd] [args]  → [Description]

💡 [Nếu skill candidates ≥ 3: "Chạy /evolve để cập nhật skills trước phase mới"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 4: Special Cases
- **Error occurred**: prioritize fix actions
- **Long pause** (> 24h since last activity): re-read state and offer recap
- **Post-execute with security/perf concerns**: suggest `/audit security` or `/audit code`
- **Large refactor completed**: suggest `/audit code` để verify quality post-refactor
- **All done**: congratulate, suggest `/audit full` trước deployment, then next project steps

## Output
- User always knows what to do next
- Navigation is proactive, not reactive
