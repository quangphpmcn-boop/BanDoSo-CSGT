# Orchestrator

## Purpose
Central engine that coordinates multi-agent execution across waves, managing parallelism and shared state.

## Execution Model

```
Phase N → Wave 1 → [Plan A, Plan B] → Parallel
        → Wave 2 → [Plan C]         → Sequential (depends on Wave 1)
        → Wave 3 → [Verify]         → Sequential (depends on Wave 2)
```

## Orchestration Flow

### 1. Discover Plans
```
Read .nexus/phases/phase-{N}/*-PLAN.md
Parse wave assignments from frontmatter
Build dependency graph
```

### 2. Schedule Waves
```
For each wave (ordered):
  - Identify plans in this wave
  - Check dependencies satisfied
  - Mark wave as ready
```

### 2.5. Skill Check Gate (BẮT BUỘC)
```
TRƯỚC MỌI wave execution:
1. Read _shared/skill-enforcement.md → skill check protocol
2. For each plan: match task keywords → SKILL-INDEX.md → identify required skills
3. Load matched skills vào agent prompt
4. Log skills used vào tracking
```
> Xem chi tiết: `_shared/skill-enforcement.md`

### 2.7. Parallel Independence Check
```
TRƯỚC MỌI parallel wave:
1. Read _shared/parallel-dispatch.md → dispatch protocol
2. Verify plans trong cùng wave KHÔNG modify cùng files
3. Nếu conflict → tách sang waves khác nhau
```
> Xem chi tiết: `_shared/parallel-dispatch.md`

### 3. Execute Wave (Parallel)
For each plan in current wave:
```
1. Select agent via .agent/agents/_shared/skill-routing.md
2. Compose prompt via subagent-prompt.md
3. Load reasoning-bank patterns into prompt
4. Load behavioral-rules.md into prompt (v2.1: includes rules 18-20)
5. Load evidence-first.md into prompt ← BẮT BUỘC (v2.1: includes Claim Audit)
6. Load matched skills (from Skill Check Gate)
7. Load design-brief.md (if UI task) into prompt
8. Use Context7 MCP for library API lookup — `query-docs` (if external libs)
8.5. Switch Serena mode (optional): see mcp-protocol.md Section 6
9. Invoke agent
10. Monitor progress via memory-protocol (Serena MCP)
11. Collect results
```

### 4. Wave Checkpoint (Enhanced v2.1)
After each wave completes:
```
1. Verify all plans succeeded
2. Query reasoning-bank for patterns matching completed tasks
3. Log to usage-log.md
4. Log any errors to reasoning-bank patterns
5. Record new patterns to reasoning-bank.json (via execute.md Step 3.7)
6. Update state.md progress
7. Scope Guard check (v2.1): compare git diff vs plan scope → warn if creep
8. If failures: retry up to max_retries, then escalate
9. If 3+ retries failed on SAME wave → flag as ARCHITECTURAL ISSUE:
   - STOP attempting fixes
   - Log: "[ARCH] Wave {N} failed 3+ times — possible architectural problem"
   - Notify user with analysis of repeated failure pattern
   - Suggest: review architecture vs continue fixing symptoms
```

### 4.5. Dependency Check
Before starting next wave:
```
1. Read wave-structure.md → check depends_on
2. If depends_on wave not fully completed → BLOCK
3. If depends_on not specified → assume sequential (previous wave must complete)
4. If blocked → log blocker and notify user
```

### 5. Phase Complete
After all waves:
```
1. Generate summaries for all plans
2. Update roadmap.md
3. Update state.md
4. Invoke guide protocol
```

## Parallelization Rules
From `nexus.json → agents`:
- `parallelization`: enable/disable parallel execution
- `max_parallel`: maximum concurrent agents
- `max_retries`: retry count before escalation

## Error Escalation
1. Task fails → retry (same agent)
2. Retry fails → Debugger agent
3. Debugger fails → log + notify user
4. Every error → reasoning-bank patterns entry

## Agent Routing Table

> **Canonical source**: `_shared/skill-routing.md` — agent selection rules, escalation, turn limits, domain skill routing.

## Complexity Router

> **Canonical source**: `.agent/workflows/guide.md` § Complexity Router (Auto-Suggest) — score 0-10 → auto-route workflow.

