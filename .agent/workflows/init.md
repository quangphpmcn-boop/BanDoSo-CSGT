---
description: Khởi tạo dự án Nexus mới — tạo thư mục .nexus/ với toàn bộ file dự án
---

# /nexus:init — Project Initialization

## Prerequisites
- Read `nexus.json` → load bilingual config
- Confirm `.nexus/` directory does NOT exist yet

## Steps

### Step 1: Discovery Interview
Ask the user these questions (in `user_language`):
1. What does this project do? (1-2 sentences)
2. What is the single most important value it delivers?
3. What tech stack will you use? (or should I recommend?)
4. Any constraints? (timeline, budget, existing code)
5. What does V1 look like vs V2?

> **⛔ FRESH PROJECT RULE**: Mỗi dự án là độc lập. Khi đề xuất tech stack, kiến trúc, design:
> - **PHẢI** phân tích nhu cầu cụ thể của dự án HIỆN TẠI để chọn phương án tốt nhất
> - **PHẢI** trình bày **2-3 phương án** với ưu/nhược điểm theo **Multi-Option Comparison Format** (xem `requirements-elicitation.md`)
> - **KHÔNG ĐƯỢC** sao chép tech stack / patterns từ dự án cũ qua Knowledge Items (KIs) hoặc conversation history
> - **KHÔNG ĐƯỢC** giả định rằng dự án mới sẽ dùng cùng stack với dự án trước
> - **ĐƯỢC PHÉP** tham khảo patterns/lessons từ KIs chỉ khi user YÊU CẦU RÕ RÀNG (ví dụ: "dùng giống dự án X")
>
> Ví dụ SAI: Dự án cũ dùng Flutter + Python sidecar → tự đề xuất Flutter + Python cho dự án mới.
> Ví dụ ĐÚNG: Trình bày bảng so sánh Tauri vs Electron vs Flutter với ưu/nhược điểm → hỏi user chọn.

> If project is existing codebase: run research (read README, package.json/pubspec.yaml, directory structure) BEFORE asking questions.

### Step 1.3: Serena Project Registration (ngay sau khi xác định tech stack)

> **Lý do**: Serena cần biết đúng ngôn ngữ dự án để symbolic tools hoạt động chính xác. Nếu đăng ký muộn, các bước sau (research, elicitation) không được hỗ trợ đầy đủ.

Nếu Serena MCP đang active:

1. **Activate project**: Gọi `activate_project` với đường dẫn dự án hiện tại
   - Serena sẽ scan và nhận diện tech stack vừa xác định

2. **Run onboarding** (nếu `serena.onboarding` = true và project có existing code):
   - Gọi `check_onboarding_performed` → nếu chưa → gọi `onboarding`
   - Serena tạo memories về project structure, build commands, key patterns

3. **Xác nhận**: Log ngôn ngữ Serena đã nhận diện để đảm bảo đúng tech stack

```
Ví dụ:
  Tech stack xác định: Flutter (Dart) + Python backend
  → Activate Serena
  → Serena nhận diện: Dart, Python
  → Symbolic tools hoạt động đúng cho cả Dart và Python
```

> Nếu Serena không available → bỏ qua. Init vẫn tiếp tục bình thường.

### Step 1.5: Core Concept Deep Dive (Elicitation)

Read `_shared/requirements-elicitation.md` → apply **Loại 1: Core Concept Clarification**.

1. Phân tích mô tả dự án → trích danh sách **core concepts**
2. Với mỗi core concept → hỏi user chi tiết (hoặc AI đề xuất → user duyệt)
3. Ghi kết quả vào `requirements.md` → section "Detail Decisions"

> Depth level từ `nexus.json → elicitation.depth`:
> - `thorough`: Hỏi chi tiết từng concept
> - `balanced`: AI đề xuất + user duyệt
> - `quick`: AI đề xuất, chỉ hỏi khi mơ hồ

### Step 2: Research (if `workflow.research` is true)
- Scan codebase structure if existing project
- Identify tech stack, patterns, conventions
- Note existing tests, CI/CD, documentation


> Serena onboarding đã được thực hiện ở Step 1.3.


### Step 3: Create `.nexus/` Directory
Copy templates and fill with interview answers:

```
.nexus/
├── state.md          ← from .agent/templates/state.md
├── project.md        ← from .agent/templates/project.md (filled)
├── requirements.md   ← from .agent/templates/requirements.md (filled)
├── roadmap.md        ← from .agent/templates/roadmap.md (filled)
├── memory/
│   └── reasoning-bank.json  ← copy from .agent/templates/reasoning-bank.json
├── phases/
└── logs/
    └── usage-log.md      ← from .agent/templates/usage-log.md
```

> **⚠️ KHÔNG QUÊN `reasoning-bank.json`** — self-learning patterns sẽ không hoạt động nếu thiếu file này.

> **v2.1**: Nếu dự án có business logic phức tạp (tính toán tài chính, auth, data migration) → gợi ý user tạo `.nexus/critical-functions.md` từ template `.agent/templates/critical-functions.md`.

### Step 3.5: Skill Pruning (v3.0)

> **Mục đích:** Loại bỏ skills không liên quan đến tech stack dự án, giảm ~57% context khi agent search SKILL-INDEX.

**Quy trình:**

1. **Đọc tech stack** từ `project.md` (vừa tạo ở Step 3)

2. **Match tech stack → skill categories** theo bảng mapping:

| Tech Stack Keyword | Categories GIỮ |
|-------------------|----------------|
| Flutter/Dart | `mobile/flutter-expert`, `languages/` (dart implicit) |
| Python | `languages/python-*`, `backend/django,fastapi` |
| React/Next.js | `frontend/react-*,nextjs-*`, `languages/typescript-*` |
| Angular | `frontend/angular`, `languages/typescript-*` |
| Vue | `languages/javascript-*,typescript-*` |
| Node.js | `backend/nodejs-*,nestjs-*`, `languages/typescript-*` |
| Rust | `languages/rust-pro` |
| Go | `languages/golang-pro` |
| Java/Kotlin | `languages/java-pro,kotlin-*` |

3. **Always-Keep Skills** — KHÔNG BAO GIỜ xóa:

| Category/Skill | Lý do |
|----------------|-------|
| `workflow/` (toàn bộ) | Core framework operation |
| `nexus/` (toàn bộ) | Framework self-reference |
| `quality/clean-code` | Mọi project cần |
| `quality/code-reviewer` | Mọi project cần |
| `quality/systematic-debugging` | Mọi project cần |
| `quality/error-handling-patterns` | Mọi project cần |
| `quality/documentation` | Mọi project cần |
| `quality/readme` | Mọi project cần |
| `quality/commit` | Mọi project cần |
| `quality/mermaid-expert` | Dùng cho diagrams |
| `quality/import-guard` | v2.1 verification |
| `devops/git-*` (2 skills) | Mọi project dùng git |
| `security/security-auditor` | Review scope |
| `testing/find-bugs` | Debug scope |
| `testing/vibe-code-auditor` | Audit scope |

4. **Tạo danh sách GIỮ** = always-keep + matched categories
5. **Tạo danh sách XÓA** = tất cả skills còn lại
6. **Trình user review** — hiển thị bảng tóm tắt:

```
✅ GIỮ: [N] skills (workflow, nexus, quality/core, [matched]...)
❌ XÓA: [M] skills ([pruned categories]...)
```

> ⛔ **Chờ user xác nhận** trước khi xóa.

7. **Thực thi prune:**
   - Xóa skill folders trong `.agent/skills/[category]/[skill]`
   - Cập nhật `SKILL-INDEX.md` — xóa entries đã prune
   - Ghi manifest vào `.nexus/skill-manifest.json`:

```json
{
  "tech_stack": ["flutter", "python"],
  "kept_categories": ["mobile", "languages", "workflow", "nexus"],
  "kept_skills": ["flutter-expert", "python-pro", "python-patterns"],
  "pruned_categories": ["backend", "frontend"],
  "pruned_skills_count": 52,
  "pruned_at": "ISO-8601 timestamp"
}
```

> **Nếu user từ chối prune** → bỏ qua, ghi note vào `skill-manifest.json` với `"pruned": false`.

### Step 4: Generate Roadmap
Break requirements into phases:
- Each phase = cohesive deliverable
- Phase 1 = foundation / highest-risk items
- Last phase = polish, documentation, deployment
- Each phase has estimated plan count

### Step 5: Set Initial State
Update `state.md`:
- Phase: 1 of [N]
- Status: Ready to plan
- Progress: 0%

> Nếu Serena không available → bỏ qua. Init vẫn hoàn thành bình thường.

### Step 5.5: Finalize Usage Log (BẮT BUỘC)

Ghi entry đầu tiên vào `.nexus/logs/usage-log.md`.

> **Format**: Theo ĐÚNG format trong `.agent/maintenance/usage-logger.md`.
> **Self-check**: 6 fields bảng? Bảng Chi tiết? Không prose? Skills ≠ "nexus"?

### Step 6: Guide → Next Steps
Invoke `guide.md` protocol:
- If project has UI → suggest `/nexus:design 1` first
- Otherwise → suggest `/nexus:plan 1` to start planning Phase 1
- Show roadmap overview

## Output
- `.nexus/` directory fully populated (including `reasoning-bank.json`)
- `.nexus/skill-manifest.json` — ghi nhận skills đã giữ/prune
- Usage log initialized with first entry
- User knows exactly what to do next
