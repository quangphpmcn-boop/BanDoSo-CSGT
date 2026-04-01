---
description: Làm rõ yêu cầu trước planning — hỏi-đáp có cấu trúc giảm rework
---

# /nexus:clarify [phase_number] — Structured Clarification

> Inspired by spec-kit `/speckit.clarify`. Chạy SAU khi có requirements, TRƯỚC `/plan`.

## Prerequisites
- Read `.nexus/state.md` → confirm current position
- Read `.nexus/roadmap.md` → get phase requirements
- Read `.nexus/requirements.md` → get full requirement details
- Read `.agent/agents/_shared/bilingual-protocol.md` → language rules

## Steps

### Step 1: Load Phase Requirements
- Filter requirements thuộc phase hiện tại từ `requirements.md`
- Đọc `.nexus/phases/phase-{N}/design/design-brief.md` (nếu tồn tại)
- Count total requirements cho phase

### Step 2: Analyze Gaps
Với mỗi requirement, kiểm tra 4 chiều:

1. **Acceptance Criteria Quality**:
   - Criteria có testable? (đo lường được, verify được)
   - Criteria có measurable? (thời gian, số lượng, tỷ lệ)
   - Missing criteria → flag `❓ REQ-xxx: thiếu acceptance criteria cụ thể`

2. **Edge Cases Coverage**:
   - Empty/null/zero inputs?
   - Concurrent operations?
   - Error states & recovery?
   - Boundary values? (max items, empty list, single item)
   - Missing edge cases → flag `❓ REQ-xxx: chưa rõ behavior khi [edge case]`

3. **Dependencies Clarity**:
   - External APIs/services được specify rõ?
   - Auth/permissions requirements tường minh?
   - Data sources & formats defined?
   - Missing deps → flag `❓ REQ-xxx: dependency [X] chưa được define`

4. **Ambiguity Detection**:
   - Từ ngữ mơ hồ: "nhanh", "đẹp", "dễ dùng", "tối ưu" → yêu cầu quantify
   - Multiple interpretations → list ra và hỏi user chọn

### Step 3: Generate Clarification Questions
- Tổng hợp gaps → max **10 câu hỏi**, grouped by category
- Format mỗi câu hỏi:
  ```
  **Q{N}** [{category}] — REQ-{xxx}:
  {Câu hỏi cụ thể}
  > Gợi ý: {option A} | {option B} | {để nguyên nếu ok}
  ```
- Đặt câu hỏi QUAN TRỌNG NHẤT lên đầu
- Nếu không tìm thấy gaps → báo "✅ Requirements đã rõ ràng, sẵn sàng `/plan`"

### Step 4: Record Clarification
Sau khi user trả lời:
1. **Lưu** kết quả vào `.nexus/phases/phase-{N}/clarifications.md`:
   ```markdown
   # Clarifications — Phase {N}
   Date: {YYYY-MM-DD}

   ## Q1: [question summary]
   **Answer**: [user's answer]
   **Impact**: [requirements/plans affected]

   ## Q2: ...
   ```

2. **Cập nhật** `requirements.md` — thêm chi tiết từ clarification vào requirements tương ứng
3. **Nếu user thay đổi scope** → cập nhật `roadmap.md`

### Step 4.5: Finalize Usage Log (BẮT BUỘC)

Ghi vào `.nexus/logs/usage-log.md`.

> **Format**: Theo ĐÚNG format trong `.agent/maintenance/usage-logger.md`.
> **Self-check**: 6 fields bảng? Bảng Chi tiết? Không prose? Skills ≠ "nexus"?

### Step 5: Guide → Next Steps
Invoke `guide.md`:
- Suggest `/nexus:plan [phase]` để lập kế hoạch
- Show summary: {X} câu hỏi đã clarify, {Y} requirements affected

## Output
- Clarifications recorded in phase folder
- Requirements updated with clarified details
- Ready for `/plan`
