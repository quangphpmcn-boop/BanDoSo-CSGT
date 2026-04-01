# Session Metrics

## Purpose
Track session quality indicators to prevent degradation over long conversations.

## Metrics to Track

### Clarification Debt
Count of questions the agent SHOULD have asked but didn't (discovered later as errors).
- 0: Excellent — agent asked all needed questions
- 1-2: Acceptable — minor assumptions that worked out
- 3+: Concerning — too many unstated assumptions

### Task Completion Rate
`completed_tasks / total_tasks × 100`
- 100%: All planned tasks completed
- 80-99%: Acceptable with documented gaps
- <80%: Review plan quality

### Error Rate
`errors / total_tasks × 100`
- 0-5%: Normal
- >15%: Critical — stop and review approach

### Retry Rate
`retries / total_tasks × 100`
- 0-10%: Normal
- 10-25%: Check if plans are too vague
- >25%: Plans need rework

### Scope Creep Rate (v2.1)
`out_of_scope_files / total_files_changed × 100`
- 0-10%: Normal — natural dependencies
- 10-30%: Minor creep — review
- >30%: Significant creep — realign with plan

### Claim Confirmation Rate (v2.1)
`confirmed_claims / total_claims × 100`
- 100%: Excellent — all claims verified
- 80-99%: Check UNCONFIRMED claims
- <80%: Evidence protocol not followed

## When to Report
- Included in execution summaries (see `execute.md` Step 3)
- Available via `/nexus:progress` (see `progress.md` Step 3)
- Analyzed by health-check workflow (see `health-check.md`)
- Metric definitions: `_shared/session-metrics.md`
