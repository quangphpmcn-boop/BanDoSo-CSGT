# Dynamic Context Loading

Agents must NOT load all resources at once. Load only what the current task requires.

## Loading Order

### Always Load (Every Task)
1. SKILL.md — auto-loaded by IDE
2. `_shared/bilingual-protocol.md` — language rules

### Load at Task Start
3. `.nexus/state.md` — current position
4. `.agent/workflows/guide.md` — for end-of-task guide

### Load Based on Task Type

| Agent | Task Type | Additional Resources |
|-------|-----------|---------------------|
| Architect | New project | `.agent/templates/project.md`, `.agent/templates/roadmap.md`, `.agent/templates/requirements.md`, `_shared/requirements-elicitation.md` |
| Architect | Existing project | `.nexus/project.md`, codebase scan |
| Designer | UI/UX design | `.nexus/project.md`, `_shared/mcp-protocol.md` (Pencil), `_shared/requirements-elicitation.md`, existing UI code |
| Designer | Design iteration | Previous design artifacts, user feedback |
| Planner | Phase planning | `.agent/templates/plan.md`, `.nexus/roadmap.md`, `.nexus/requirements.md`, `design-brief.md` (if exists), `_shared/requirements-elicitation.md` |
| Executor | Code implementation | Assigned plan, relevant source files, `_shared/mcp-protocol.md` (Context7, Serena Symbolic), `.nexus/critical-functions.md` (if exists) |
| Executor | Quick fix | Error context, relevant source files |
| Executor | Post-task verify | `quality/import-guard.md` (v2.1 — verify imports) |
| Reviewer | Plan check | All plans in phase |
| Reviewer | Code review | Changed files, relevant tests, design specs (if UI), `_shared/mcp-protocol.md` (Serena Symbolic) |
| Reviewer | Security audit | All endpoint files, auth code |
| Debugger | Bug fix | Error logs, stack trace, recent commits, `_shared/mcp-protocol.md` (Serena Symbolic) |
| Debugger | Performance | Profiling data, query logs |

### Load on Error
- `_shared/quality-gates.md` — when verification fails

## Context Budget

**Goal:** Keep total loaded context under 60% of available window to leave room for reasoning and output.

**Priority Order** (when context is limited, load in this priority):

1. **Critical** (always load): bilingual-protocol, state.md, reasoning-bank
2. **High** (load at task start): assigned plan, requirements
3. **Medium** (load when needed): source code files, templates
4. **Low** (load on demand): examples, reference docs, full codebase scans

**Estimation Guide:**

| Content Type | Approximate Size |
|---|---|
| SKILL.md | 1-2K tokens |
| Shared protocol | 0.5-1K tokens |
| Plan (XML) | 1-3K tokens |
| Source code file | 1-5K tokens |
| State + roadmap | 0.5-1K tokens |

**Strategies When Over Budget:**

1. **Summarize**: condense large files to key points
2. **Selective loading**: only load relevant sections of large files
3. **Defer**: load reference material only when actively needed
4. **Prune**: remove already-processed content from context

## Prerequisite Profiles

> Workflows reference these profiles thay vì liệt kê từng file.

### Profile: `base`
Mọi workflow đều load:
- `_shared/bilingual-protocol.md`
- `.nexus/state.md`

### Profile: `execution`
Profile `base` + execution essentials:
- `_shared/evidence-first.md`
- `_shared/behavioral-rules.md`
- `_shared/memory-protocol.md`
- `_shared/mcp-protocol.md` (Serena + Context7)

### Profile: `review`
Profile `base` + review essentials:
- `_shared/evidence-first.md`
- `_shared/security-protocol.md`
- `_shared/mcp-protocol.md` (Serena Symbolic)

### Profile: `planning`
Profile `base` + planning essentials:
- `_shared/skill-enforcement.md`
- `.nexus/roadmap.md`
- `.nexus/requirements.md`
