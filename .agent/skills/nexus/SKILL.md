---
name: nexus
description: Nexus Framework — quy trình phát triển agentic thống nhất với quản lý dự án, điều phối đa agent, điều hướng thông minh, và 119 skill chuyên môn thuộc 13 danh mục
---

# Nexus Framework Skill

## When to Use
This skill activates when the user mentions:
- Project initialization, setup, new project
- Planning, phases, roadmap, requirements
- Execution, building, implementing, coding
- Design, wireframes, UI/UX, mockups
- Verification, review, QA, security audit
- Progress, status, what to do next
- Debugging with structured workflow
- Framework health, maintenance, audit
- Session management, start work, end work, switch machine
- Any Nexus slash command (`/init`, `/design`, `/plan`, `/execute`, `/verify`, `/review`, `/quick`, `/progress`, `/guide`, `/health`, `/start`, `/end`)

## Commands

> **Naming**: IDE triggers use short form (`/init`). Internal docs use `/nexus:init` for clarity. Both refer to `.agent/workflows/init.md`.

| Command | Mô tả | Antigravity Mode |
|---------|-------|-----------------|
| `/init` | Khởi tạo dự án mới với thư mục .nexus/ | PLANNING |
| `/design [phase]` | Thiết kế UI/UX — wireframe, hệ thống thiết kế | ALL |
| `/plan [phase]` | Lập kế hoạch thực thi cho phase | PLANNING |
| `/execute [phase]` | Thực thi kế hoạch theo thứ tự wave | EXECUTION |
| `/verify [phase]` | Xác minh công việc hoàn thành | VERIFICATION |
| `/review [scope]` | Kiểm tra chất lượng (bảo mật, hiệu năng, code) | VERIFICATION |
| `/quick` | Xử lý tác vụ nhanh, đột xuất | EXECUTION |
| `/progress` | Xem tiến độ dự án và bước tiếp theo | — |
| `/guide` | Hướng dẫn bước tiếp theo | — |
| `/health` | Kiểm tra sức khỏe framework — usage, skills, lỗi | — |
| `/start` | Khởi đầu phiên — kiểm tra môi trường, MCP, Serena, khôi phục context | — |
| `/end` | Kết thúc phiên — lưu trạng thái, tạo handover, nhắc commit | — |

## How It Works
1. Load workflow from `.agent/workflows/` directory
2. Follow workflow steps sequentially
3. Select appropriate agent via `.agent/agents/_shared/skill-routing.md`
4. Apply bilingual protocol (`.agent/agents/_shared/bilingual-protocol.md`)
5. Log usage and errors for maintenance
6. Always end with guide protocol (next steps)

## 6 Agents

| Agent | Role |
|-------|------|
| **Architect** | Requirements analysis, architecture design, tech stack |
| **Designer** | Wireframes, user flows, design system, component inventory |
| **Planner** | Atomic XML plans, wave grouping |
| **Executor** | Code implementation, atomic commits |
| **Reviewer** | Verification, security audit, quality check |
| **Debugger** | Root cause analysis, minimal fix, lessons learned |

## 119 Skills Library (Auto-routed)

The framework includes 119 domain skills organized in 13 categories:

| Category | Count | Examples |
|----------|------:|---------|
| `ai/` | 8 | RAG, agents, prompt engineering |
| `architecture/` | 10 | DDD, C4, microservices |
| `backend/` | 5 | Node.js, Django, FastAPI |
| `frontend/` | 7 | React, Next.js, Angular |
| `mobile/` | 2 | Flutter, React Native |
| `languages/` | 15 | TypeScript, Python, Go, Rust |
| `testing/` | 8 | TDD, E2E, Playwright |
| `security/` | 6 | DevSecOps, OWASP, Auth |
| `database/` | 8 | PostgreSQL, Prisma, GraphQL |
| `devops/` | 9 | Docker, K8s, CI/CD |
| `data/` | 6 | Data eng, scraping, finance |
| `workflow/` | 11 | Planning, research, multi-agent |
| `quality/` | 21 | Clean code, docs, debugging |

Skills are auto-routed via `.agent/agents/_shared/skill-routing.md` based on task context. Full index: `.agent/skills/SKILL-INDEX.md`

## Framework Location

All framework files are in `.agent/` at project root:
- `nexus.json` — Framework config (project root)
- `.agent/workflows/` — 12 workflow definitions
- `.agent/agents/` — 6 agents + 16 shared protocols
- `.agent/orchestration/` — Orchestrator and memory schema
- `.agent/maintenance/` — Usage logging and lessons learned
- `.agent/templates/` — 10 project file templates
- `.agent/skills/` — 119 skills library

> **Path Convention**: When reading framework files, all internal paths
> (e.g. `agents/_shared/...`, `templates/...`) are relative to `.agent/`,
> not project root. Prefix them with `.agent/` when resolving.

## Key Protocols
- **Bilingual**: Vietnamese UI, English technical content
- **Guide**: Always show next steps after each workflow
- **Lessons Learned**: Never repeat past mistakes
- **Maintenance**: Auto-log usage for health tracking
