# Memory Schema

## File-Based Fallback
If Serena MCP is not available, all memory files are read/written directly to `.nexus/memory/` directory using standard file I/O.

## Standard Memory Files

### project-context.md
Written by: Architect (during `/nexus:init`)
Read by: All agents
```markdown
# Project Context

## Name: [project name]
## Vision: [1-2 sentence vision]
## Tech Stack: [languages, frameworks, tools]
## Key Constraints: [timeline, budget, compatibility]
## Core Value: [what makes this project important]
```

### design-brief.md
Written by: Designer (during `/nexus:design`)
Read by: Planner
```markdown
# Design Brief — Phase {N}

## Screens (priority order)
1. [Screen Name] — wireframe: wireframes.pen#anchor
2. [Screen Name] — wireframe: wireframes.pen#anchor

## Components needed
- [Component] ([N] variants) → design-system.md#anchor

## Design tokens
- See: design-system.md

## Responsive breakpoints
- Mobile: < 768px
- Tablet: 768-1024px
- Desktop: > 1024px
```

### task-board.md
Written by: Planner / Orchestrator
Read by: Executor, Orchestrator
```markdown
# Task Board — Phase {N}

## Wave 1
- [x] Plan 1: [name] — ✓ Completed [timestamp]
- [ ] Plan 2: [name] — ⏳ In progress

## Wave 2
- [ ] Plan 3: [name] — ⬜ Waiting (depends on Wave 1)
```

### progress-{agent}.md
Written by: Each agent during execution
Read by: Orchestrator
```markdown
# Progress: {agent} — {timestamp}

## Status: in_progress | completed | failed
## Task: {plan-name} / {task-name}
## Percent: 60%
## Last action: [description]
## Errors: [none | error description]
```

### results-{phase}-{wave}.md
Written by: Orchestrator after wave
Read by: Reviewer, next wave
```markdown
# Results: Phase {N} Wave {M}

## Plans Completed: 2/2
## Errors: 0
## Commits: [hash1, hash2, hash3]
## Duration: 12 min
## Files Changed: [list]
```

### verification-report.md
Written by: Reviewer (during `/nexus:verify`)
Read by: Orchestrator
```markdown
# Verification Report — Phase {N}

## Requirements Coverage
| REQ ID | Status | Plan | Notes |
|--------|--------|------|-------|
| REQ-001 | ✅ Passed | Plan 1 | [details] |
| REQ-002 | ⚠️ Partial | Plan 2 | [gap description] |

## Automated Checks
- Build: ✅ Pass / ❌ Fail
- Tests: ✅ Pass / ❌ Fail ([N] passed, [M] failed)
- Lint: ✅ Pass / ❌ Fail

## Gaps Found
- [description of any gaps]

## Verdict: approved | needs-fix
```

### review-findings.md
Written by: Reviewer (during `/nexus:review`)
Read by: Executor (for fixes)
```markdown
# Review Findings — [scope]

## Summary
| Severity | Count |
|----------|-------|
| 🔴 Critical | [N] |
| 🟡 Warning | [N] |
| 🔵 Info | [N] |

## Findings
### [F-001] [Title]
- Severity: 🔴 Critical
- File: [path]
- Line: [N]
- Description: [what's wrong]
- Suggestion: [how to fix]
```

### blockers.md
Written by: Any agent
Read by: Orchestrator, User
```markdown
# Active Blockers

## BLK-001: [Title]
- Severity: high | medium | low
- Agent: executor
- Description: [what's blocked and why]
- Suggested resolution: [how to fix]
- Created: [timestamp]
```

### handover.md
Written by: Any agent at session end
Read by: Next session's first agent
```markdown
# Session Handover — [timestamp]

## Where We Stopped
[Description of last completed action]

## What's Next
[Specific next step to take]

## Active Context
[Key decisions, patterns, gotchas for the next session]

## Files to Review
[List of important files for context]
```

### reasoning-bank.json
Written by: Executor (during `/nexus:execute` Step 3.7), Learn (during `/nexus:learn`)
Updated by: Reviewer (during `/nexus:verify` Step 5.5), End (during `/nexus:end` Step 2.7-2.8), Evolve (during `/nexus:evolve`)
Read by: Executor (Step 1.5), Planner, Health, Start, Learn, Evolve
Template: `.agent/templates/reasoning-bank.json`
```json
{
  "$version": "2.0",
  "patterns": [{
    "id": "P{auto}",
    "domain": "{tech domain}",
    "task_type": "{feature|bugfix|refactor|performance}",
    "description": "{task name}",
    "approach_summary": "{1-line approach}",
    "outcome": "{success|partial|failure}",
    "confidence": 0.0-1.0,
    "tags": ["{keywords}"],
    "created": "{YYYY-MM-DD}",
    "reuse_count": 0,
    "observation_source": "{workflow/phase/wave reference}",
    "evolution_log": [{
      "date": "{YYYY-MM-DD}",
      "event": "{created|reinforced|reused|decayed|corrected}",
      "confidence_delta": "{+/-value}",
      "evidence": "{description}"
    }],
    "skill_candidate": false,
    "related_patterns": ["{pattern IDs}"]
  }],
  "evolution_clusters": [{
    "id": "C{auto}",
    "name": "{cluster name}",
    "pattern_ids": ["{pattern IDs}"],
    "avg_confidence": 0.0,
    "suggested_action": "skill_amendment",
    "target_skill": "{skill name from SKILL-INDEX}",
    "suggested_addition": "{markdown content}",
    "status": "{pending_review|applied|reviewed|dismissed}"
  }],
  "stats": {
    "total_patterns": 0,
    "success_rate": 0.0,
    "top_domains": [],
    "avg_confidence": 0.0,
    "patterns_evolved_to_skills": 0,
    "last_evolution_check": null,
    "last_learn_run": null
  }
}
```
> Auto-pruned by `/end` workflow when exceeding `nexus.json → performance.reasoning_bank_max_patterns`.
> Evolution tracking via `/learn` (extract) and `/evolve` (cluster → amend skills).


