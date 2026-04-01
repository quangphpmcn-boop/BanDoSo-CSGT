# Skill Routing

Maps task characteristics to the appropriate Nexus **agent** and **domain skills**.

> ⛔ `nexus` là skill điều phối — KHÔNG ghi vào usage log.
> Agent PHẢI ghi domain skill cụ thể (xem bảng cuối file hoặc `SKILL-INDEX.md`).

## Agent Selection Rules

| Task Characteristics | Agent | Notes |
|---------------------|-------|-------|
| New project, architecture, tech stack | **architect** | Always first for new projects |
| Requirements, decomposition, roadmap | **architect** | Vision-level decisions |
| UI/UX design, wireframes, mockup, user flow | **designer** | After architect, before planner |
| Design system, component inventory | **designer** | UI-heavy phases only |
| Phase planning, task breakdown, waves | **planner** | After designer (or architect if no UI) |
| Code implementation, feature building | **executor** | After planner creates plans |
| Bug fix, quick change, config tweak | **executor** | Via `/nexus:quick` |
| Bug diagnosis, error analysis, root cause | **debugger** | When executor fails or user reports bug |
| Code review, security audit, QA | **reviewer** | After executor completes |
| Plan review, verification | **reviewer** | Before execution or after |

## Complex Task Routing

| Request Pattern | Execution Order |
|----------------|----------------|
| "Start a new project" | architect → designer → planner |
| "Design the UI" | designer |
| "Build feature X" | designer → planner → executor → reviewer |
| "Build backend API" | planner → executor → reviewer |
| "Fix bug Y" | debugger → executor (fix) → reviewer |
| "Review my code" | reviewer |
| "Plan next phase" | planner |
| "What should I do?" | guide protocol |

## Escalation Rules

| Situation | Escalation |
|-----------|-----------|
| Executor hits unknown error | → Debugger |
| Debugger finds architecture issue | → Architect for re-evaluation |
| Reviewer finds critical security issue | → Executor for immediate fix |
| Planner can't break down requirement | → Architect for clarification |
| Planner has UI-heavy tasks without design | → Designer first |
| Reviewer finds UI doesn't match design | → Executor + Designer review |
| Any agent fails after max retries | → User notification |

## Turn Limits
From `nexus.json → agents.turn_limits`:

| Agent | Default Turns | Purpose |
|-------|--------------|---------|
| architect | 15 | Prevents over-analysis |
| designer | 12 | Design should be focused |
| planner | 10 | Plans should be quick |
| executor | 20 | Code tasks need more room |
| reviewer | 15 | Thorough but bounded |
| debugger | 15 | Root cause + fix |

## Domain Skill Routing (cho Usage Log)

> Khi ghi usage log, agent PHẢI ghi domain skills — KHÔNG ghi "nexus".
> Suy luận domain skill từ agent đang dùng + tech stack của task.

| Agent | Default Domain Skills | Conditional Skills |
|-------|-----------------------|-------------------|
| **architect** | `architecture` | `domain-driven-design`, `microservices-patterns`, `brainstorming` |
| **designer** | `design-taste` | `design-redesign`, `design-minimalist`, `tailwind-design-system`, `react-patterns` |
| **planner** | `writing-plans` | `concise-planning`, `executing-plans` |
| **executor** | *suy luận từ tech stack* | Xem `SKILL-INDEX.md` → Quick Lookup |
| **reviewer** | `code-reviewer`, `clean-code` | `security-auditor`, `wcag-audit-patterns`, `testing-patterns` |
| **debugger** | `systematic-debugging` | `error-handling-patterns`, `find-bugs` |

## Capabilities-Based Routing (Enhanced)

Mỗi agent file (`SKILL.md`) có frontmatter `capabilities` và `routes`:

```yaml
---
name: executor
capabilities: [code-implementation, refactoring, bug-fixing, api-design, testing]
routes: [/execute, /quick]
---
```

Khi routing task:
1. **Primary lookup**: dùng bảng Agent Selection Rules ở trên
2. **Fallback lookup**: so khớp task keywords với agent `capabilities` list
3. **Route validation**: agent chỉ nên xử lý workflows liệt kê trong `routes`
4. **Task-type routing**: xem bảng Agent Routing Table trong `orchestrator.md`

> Agent Routing Table (task_type → agents) nằm ở `.agent/orchestration/orchestrator.md` § Agent Routing Table.

