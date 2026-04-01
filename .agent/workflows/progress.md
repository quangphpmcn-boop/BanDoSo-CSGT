---
description: Xem tiến độ dự án — đang ở đâu và tiếp theo là gì
---

# /nexus:progress — Status Check

## Prerequisites
- Read `.nexus/state.md` → current position
- Read `.agent/agents/_shared/bilingual-protocol.md` → language rules

## Steps

### Step 1: Read State
Load `.nexus/state.md` and present:
- Current phase / plan / status
- Progress bar
- Last activity

### Step 2: Show Roadmap
Load `.nexus/roadmap.md` and present:
- Phase overview with completion status
- Current phase highlighted
- Remaining work estimate

### Step 3: Performance Metrics
From `state.md`:
- Plans completed / total
- Average duration per plan
- Trend (improving / stable / degrading)

### Step 4: Health Summary
Quick read of `.nexus/logs/` and `.nexus/memory/reasoning-bank.json`:
- Reasoning Bank: pattern count + success rate + skill candidates count
- Top recurring errors (if any)
- Framework usage stats
- Nếu skill candidates ≥ 3 → gợi ý: "💡 Chạy `/evolve` để cập nhật skills từ {N} patterns đã tích lũy"
- Nếu usage-log có entries chưa analyze → gợi ý: "💡 Chạy `/learn` để extract patterns mới"

### Step 5: Guide → Next Steps
Invoke guide protocol based on current state.

## Output
- Complete status overview in one view
- Clear next action suggestion
