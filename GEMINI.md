# Nexus Framework

> File này được Antigravity tự động đọc mỗi phiên làm việc.

Dự án này sử dụng **Nexus Framework v3.7.0** — framework phát triển agentic có cấu trúc cho Antigravity IDE.

## Chế độ Song ngữ
- Giao tiếp với tôi bằng **tiếng Việt**
- Code, commit messages, tên biến/hàm → **tiếng Anh**

## Vòng đời Workflow
Luôn tuân theo chu trình Nexus:
1. `/init` → Khởi tạo dự án
2. `/design [phase]` → Thiết kế UI/UX (4 stages: Foundation → Screens → Components → Mockup) với 4-Proposal Multi-Engine
3. `/clarify [phase]` → Làm rõ yêu cầu trước planning (hỏi-đáp có cấu trúc)
4. `/plan [phase]` → Lập kế hoạch phase
5. `/execute [phase]` → Thực thi kế hoạch
6. `/verify [phase]` → Xác minh kết quả
7. `/review [scope]` → Kiểm tra chất lượng
8. `/audit [scope]` → Kiểm tra toàn diện (security, code, accessibility)
9. `/quick` → Xử lý tác vụ nhanh
10. `/progress` → Xem tiến độ
11. `/guide` → Hướng dẫn bước tiếp theo
12. `/health` → Kiểm tra sức khỏe framework
13. `/start` → Khởi đầu phiên làm việc
14. `/end` → Kết thúc phiên làm việc
15. `/learn` → Extract patterns từ session vào reasoning-bank
16. `/evolve` → Cluster patterns → suggest skill amendments
17. `/sync-knowledge` → Sync kiến thức từ dự án về source framework

## Quy tắc Bắt buộc
1. **Ghi log đúng FORMAT** → `.agent/maintenance/usage-logger.md`
2. **Luôn hiện guide** sau mỗi workflow
3. **Không bỏ qua verification** — mọi task có bước `<verify>`
4. **Atomic commits** — conventional format
5. **Phần mềm tiếng Việt** — Nội dung người dùng cuối phải tiếng Việt
6. **Forward slash** — `C:/Users/...` không bao giờ `C:\Users\...`
7. **Evidence before claims (v2.0)** — Đọc `evidence-first.md`
8. **Check skills before tasks (v2.0)** — Đọc `skill-enforcement.md`
9. **Claim Audit before done (v2.1)** — Evidence table (CONFIRMED/UNCONFIRMED/CONTRADICTED)
10. **Scope Guard (v2.1)** — git diff vs plan sau mỗi wave
11. **Critical functions (v2.1)** — Nếu `.nexus/critical-functions.md` tồn tại → đọc trước khi edit
12. **Context7 Enforcement (v3.3)** — Dùng thư viện ngoài PHẢI tra Context7 trước khi code. Ghi vào `<context7-checklist>` trong plan.
13. **4-Proposal Multi-Engine (v3.4)** — `/design` tạo 4 proposals tách biệt (Pencil + UI-UX-Pro-Max + Stitch + Taste-Skill). Stitch MCP bắt buộc.
14. **Knowledge Sync (v3.5)** — `/end` tự động sync reasoning-bank về source framework. `/sync-knowledge` để sync thủ công.
15. **Clarify before plan (v3.6)** — Khuyến nghị `/clarify` trước `/plan` để giảm rework. Generates `clarifications.md` per-phase.
16. **Phantom detection (v3.6)** — `/verify` tự động phát hiện tasks đánh dấu done nhưng không có implementation thực sự.
17. **Functional Verification (v3.7)** — `/verify` PHẢI demo từng REQ (build pass ≠ feature complete). BLOCKING nếu REQ FAIL.
18. **Completeness Audit (v3.7)** — `/verify` kiểm tra DB fields vs UI fields vs spec fields. Coverage < 50% = FAIL.
19. **Phase Archive (v3.7)** — Phase transition archive plans + evidence vào `.nexus/archive/`. KHÔNG xóa.

## Trạng thái Dự án
- `.nexus/state.md` — ĐỌC ĐẦU TIÊN mỗi phiên làm việc
- `.nexus/roadmap.md` — cấu trúc phase và tiến độ
- `.nexus/project.md` — tầm nhìn, tech stack, quyết định
- `.nexus/requirements.md` — yêu cầu đã phạm vi hóa

## Framework
- `.agent/workflows/` — 17 workflow definitions
- `.agent/skills/` — 119 skills thuộc 14 danh mục (Antigravity auto-discover)
- `.agent/agents/` — 6 agents + 13 shared protocols
- `.agent/orchestration/` — Orchestrator và memory schema
- `.agent/maintenance/` — Usage logging và self-learning
- `.agent/templates/` — Project file templates (10)

## MCP Tích hợp

| MCP Server | Mục đích |
|-----------|---------|
| **Serena** | Memory liên agent, symbolic code analysis |
| **Context7** | Tra cứu docs thư viện, API reference mới nhất. **Bắt buộc** khi dùng thư viện ngoài (v3.3) |
| **Pencil** | Vector design trong IDE, design↔code sync, .pen files |
| **Stitch** | AI screen generation, rapid visual prototyping. **Bắt buộc** trong /design (v3.4) |
| **ck** | Semantic code search — tìm code theo ý nghĩa, không chỉ keyword. Optional (v3.7) |
