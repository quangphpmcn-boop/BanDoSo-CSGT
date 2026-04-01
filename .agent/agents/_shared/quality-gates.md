# Quality Gates

Phase gates that must be passed before advancing. No phase transitions without these checks.

## Design → Plan Gate (if phase has UI)
Before planning a phase with UI (3-stage design process):

**Stage 1 — Foundation** (1 lần per project):
- [ ] Context analysis completed (domain, audience, mood keywords)
- [ ] Design system tokens defined via design-taste (colors, typography, spacing)
- [ ] Brand guide created (visual principles, do's & don'ts)
- [ ] Anti-repetition check passed (differs from previous projects)
- [ ] User has approved Foundation

**Stage 2 — Screen Design** (per screen/group):
- [ ] Screen inventory confirmed with user
- [ ] Screen ideation interview completed (Loại 4)
- [ ] Wireframes created for all screens
- [ ] User flow diagrams cover happy path + errors
- [ ] User has approved each screen wireframe

**Stage 3 — Component Design** (per component group):
- [ ] Component grouping defined from wireframes
- [ ] Component ideation interview completed (Loại 4)
- [ ] Component inventory with states + variants
- [ ] Interaction specs defined (animations, transitions)
- [ ] User has approved each component group

**Handoff:**
- [ ] Design brief handoff document created (incremental from all stages)
- [ ] All 3 stages marked approved in state.md

## Plan → Execute Gate (Enhanced v2.1)
Before executing a phase:
- [ ] All requirements for this phase identified
- [ ] Plans cover all requirements (no gaps)
- [ ] Each plan has verification steps
- [ ] Wave structure has no circular dependencies
- [ ] Reasoning-bank patterns have been loaded
- [ ] User has approved the plans
- [ ] Quick Challenge passed (if security-sensitive phase) — v2.1
- [ ] Bias Check performed for major tech decisions — v2.1

## Execute → Verify Gate (Enhanced v2.1)
Before verifying a phase:
- [ ] All plans in all waves executed
- [ ] Each task has been committed individually
- [ ] No unresolved errors (or errors logged in reasoning-bank)
- [ ] Summaries generated for all plans
- [ ] Usage log updated
- [ ] **Skills loaded for each task** (skill-enforcement.md)
- [ ] **Evidence-first: verification commands run with output cited** (evidence-first.md)
- [ ] **Import Guard: all imports verified** (`.agent/skills/quality/import-guard.md`) — v2.1
- [ ] **Scope Guard: no unacknowledged scope creep** (execute.md — Scope Guard in wave loop) — v2.1
- [ ] **Critical functions preserved** (if critical-functions.md exists) — v2.1

## Debug Iron Law Gate (v2.0)
Before claiming a bug is fixed:
- [ ] Root cause identified (not just symptoms)
- [ ] If 3+ fixes failed → architecture discussed with user
- [ ] Fix tested with reproduction → passing cycle
- [ ] Pattern ghi vào reasoning-bank (type: ERROR/PATTERN)

## Verify → Next Phase Gate (Enhanced v2.1)
Before starting the next phase:
- [ ] All requirements verified against acceptance criteria
- [ ] No critical issues in review findings
- [ ] **Claim Audit: all claims CONFIRMED** (evidence-first.md Claim Audit) — v2.1
- [ ] Phase marked complete in roadmap
- [ ] State updated with correct position
- [ ] User has signed off

## Quality Principles

1. **Correctness over speed**: don't skip verification to save time
2. **Incremental delivery**: each phase must be a working increment
3. **Evidence-based progress**: progress is proven by passing tests, not just written code
4. **Fail fast**: surface problems early, don't let them compound
5. **Learn from mistakes**: every error becomes a reasoning-bank pattern
6. **Scope discipline**: do what was planned, flag deviations — v2.1
