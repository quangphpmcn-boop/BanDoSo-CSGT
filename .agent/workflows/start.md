---
description: Khởi đầu phiên làm việc — kiểm tra môi trường, MCP, đăng ký Serena, khôi phục context
---

# /nexus:start — Khởi Đầu Phiên Làm Việc

## When to Run
- Mỗi khi bắt đầu làm việc trên máy mới (nhà ↔ cơ quan)
- Khi mở dự án sau thời gian dài
- Phiên đầu tiên trong ngày

## Prerequisites
- Dự án đã có `.nexus/` (đã chạy `/init` trước đó)

## Steps

### Step 1: Environment Check

Đọc `.nexus/project.md` → xác định tech stack → kiểm tra tools:

```
Với mỗi tech trong stack:
  → Chạy [command] --version
  → Có: ✅ [version]
  → Không: ❌ Thiếu [tool] — hướng dẫn cài
```

Ví dụ kiểm tra phổ biến:

| Tech Stack | Commands kiểm tra |
|------------|-------------------|
| Flutter/Dart | `flutter --version`, `dart --version` |
| Python | `python --version`, `pip --version` |
| Node.js | `node --version`, `npm --version` |
| TypeScript | `npx tsc --version` |
| Rust | `rustc --version`, `cargo --version` |
| Go | `go version` |
| Java | `java --version`, `javac --version` |

> Chỉ kiểm tra tools liên quan đến tech stack của dự án, KHÔNG kiểm tra tất cả.

Nếu thiếu tool bắt buộc → cảnh báo và hướng dẫn cài, có thể dừng resume.

### Step 2: MCP Health Check

Kiểm tra từng MCP server:

| MCP | Cách kiểm tra | Kết quả |
|-----|--------------|---------|
| **Serena** | Gọi `get_current_config` | ✅ Active / ❌ Unavailable |
| **Context7** | Gọi `resolve-library-id` với query đơn giản | ✅ Active / ❌ Unavailable |
| **Pencil** | Gọi `get_editor_state` | ✅ Active / ❌ Unavailable |

Hiện bảng status:

```
━━━ 🔌 MCP STATUS ━━━
  Serena   ✅ Active
  Context7 ✅ Active
  Pencil   ❌ Unavailable
━━━━━━━━━━━━━━━━━━━━━
```

> MCP không bắt buộc cho hầu hết workflows. Tuy nhiên:
> - **Pencil**: BẮT BUỘC cho `/design`. Nếu Pencil ❌ → cảnh báo: "⚠️ Pencil MCP không khả dụng — `/design` sẽ không thể chạy. Kiểm tra MCP config và khởi động lại Pencil server."
> - Serena, Context7: Nếu unavailable → ghi nhận, tiếp tục. Framework có fallback.

### Step 2.5: Context7 Library Scan (AUTO — nếu Context7 Active)

Nếu Context7 ✅ từ Step 2, tự động scan dependency files để tạo checklist tra cứu:

1. **Scan dependency files** theo tech stack:

| File | Loại |
|------|------|
| `requirements.txt` / `pyproject.toml` | Python |
| `package.json` (dependencies + devDependencies) | Node.js |
| `pubspec.yaml` | Flutter/Dart |
| `Cargo.toml` | Rust |
| `go.mod` | Go |

2. **Phân loại thư viện** theo mức tra cứu:

| Mức | Tiêu chí | Ví dụ |
|-----|----------|-------|
| 🔴 BẮT BUỘC | Framework chính, API phức tạp, version-specific | FastAPI, React, Tauri, google-genai |
| 🟡 NÊN | Utility có API riêng, breaking changes possible | openpyxl, docxtpl, Tailwind v4 |
| 🔵 OPTIONAL | Đơn giản, ít thay đổi | lucide-react, python-multipart |

3. **Ghi checklist** vào `.nexus/memory/context7-checklist.md`:

```markdown
# Context7 Library Checklist

Tạo bởi /start — {YYYY-MM-DD}

| Library | Version | Mức | Đã tra? |
|---------|---------|-----|:-------:|
| fastapi | standard | 🔴 | ⬜ |
| react | ^18.2.0 | 🔴 | ⬜ |
| ...     | ...     | ... | ...    |
```

4. **Hiện tóm tắt** trong output:

```
📚 Context7 Checklist: {N} thư viện cần tra (🔴 {X} bắt buộc, 🟡 {Y} nên, 🔵 {Z} optional)
```

> Nếu Context7 ❌ → bỏ qua bước này, ghi note: "⚠️ Context7 N/A — library checks sẽ dùng training data."

### Step 3: Serena Project Registration

Nếu Serena active (từ Step 2):

1. Gọi `activate_project` với đường dẫn dự án hiện tại
2. Gọi `check_onboarding_performed`
   - Nếu chưa onboarding → gọi `onboarding`
   - Nếu đã onboarding → bỏ qua
3. Xác nhận ngôn ngữ Serena nhận diện đúng tech stack

> Nếu Serena unavailable → bỏ qua bước này.

### Step 4: Context Recovery

Đọc và tổng hợp trạng thái:

1. Đọc `.nexus/state.md` → vị trí, last session, next step
2. Đọc `.nexus/roadmap.md` → tiến độ tổng thể
3. Kiểm tra file `.nexus/session-handover.md`:
   - Nếu tồn tại → đọc và hiện cho user
   - Xóa file sau khi đã đọc (đã phục vụ mục đích)
4. **Memory read**: đọc `.nexus/memory/handover.md` (nếu tồn tại) → context từ Serena sync
5. **Memory list**: liệt kê files trong `.nexus/memory/` → hiện cho user biết memory state
6. **Reasoning Bank check**: đọc `.nexus/memory/reasoning-bank.json` (nếu tồn tại) → hiện pattern count + success rate
7. **Evolution check**: nếu reasoning-bank có patterns với `skill_candidate: true` ≥ 3:
   - Gợi ý: "🧬 Có {N} patterns sẵn sàng evolve. Chạy `/evolve` trước khi bắt đầu phase mới."

Hiện báo cáo phục hồi:

```
━━━ 🔄 PHỤC HỒI PHIÊN ━━━

📍 Vị trí: Phase [X]/[Y] — [Phase Name]
📅 Phiên trước: [date] | Máy: [machine]
🛑 Dừng tại: [description]

📋 Handover notes:
  [nội dung session-handover.md nếu có]

🗃️ Memory files: [N] files (task-board, progress, etc.)
🧠 Reasoning Bank: [N] patterns | {success_rate}% success rate
🧬 Skill Candidates: [M] patterns sẵn sàng evolve [nếu M ≥ 3: "→ Chạy /evolve"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 4.5: Usage Log Continuity Check (v3.7)

> Phát hiện phases hoàn thành nhưng không có usage log — dấu hiệu workflow bị bypass.

1. **Đọc `roadmap.md`** → liệt kê phases có `✅ Done` + ngày completed
2. **Đọc `usage-log.md`** → liệt kê phases có log entry (parse headers `## [date] Phase N`)
3. **Compare** → tìm phases Done nhưng thiếu log:

```
### Usage Log Continuity — Check
| Phase | Roadmap Status | Usage Log Entry | Status |
|-------|---------------|-----------------|--------|
| Phase 1 | ✅ Done (2026-03-22) | ❌ Missing | ⚠️ GAP |
| Phase 2 | ✅ Done (2026-03-22) | ✅ Found | ✅ OK |
```

4. **Verdict**:
   - 0 gaps → skip silently
   - 1-2 gaps → `⚠️ Missing usage log for phases: [list]. Consider documenting retroactively.`
   - 3+ gaps → `🔴 Significant log gaps: {N} phases without usage log. Workflow compliance may be compromised.`

> Advisory — không block `/start`. Nhưng hiển thị cho user awareness.
> Giúp phát hiện tình trạng agent chạy nhiều phases trong 1 session mà không log đầy đủ.

### Step 5: Guide → Next Steps

Invoke `guide.md` → hiện bước tiếp theo dựa trên state.

## Output

```
━━━ ✅ PHIÊN LÀM VIỆC SẴN SÀNG ━━━

🖥️ Môi trường: [X]/[Y] tools ✅
🔌 MCP: Serena ✅ | Context7 ✅ | Pencil ❌
📍 Vị trí: Phase [X] — [Phase Name]

▶ Bước tiếp: [suggestion from guide]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
