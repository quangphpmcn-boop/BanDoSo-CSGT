# Requirements Elicitation Protocol

## Nguyên tắc cốt lõi — Decision Point Rule

> **Bất kỳ khi nào AI phải quyết định nội dung cụ thể mà user chưa chỉ định → AI PHẢI hỏi hoặc đề xuất để user duyệt. KHÔNG ĐƯỢC tự quyết.**

"Nội dung cụ thể" = bất kỳ thứ gì user có thể muốn khác so với giả định mặc định của AI.

## Quy tắc AI PHẢI tuân thủ

1. **Không đoán — Hỏi**: Khi cần nội dung cụ thể mà user chưa nói → hỏi
2. **Đề xuất — Không áp đặt**: AI có thể đề xuất nhưng PHẢI cho user duyệt
3. **Liệt kê — Không giấu**: Trước khi implement, liệt kê rõ những gì sẽ làm
4. **Nhóm câu hỏi**: Gom nhiều câu hỏi liên quan → hỏi 1 lần (không hỏi lẻ tẻ)
5. **Tùy chỉnh depth**: Theo cấu hình `nexus.json → elicitation.depth`
6. **Đề xuất từ phân tích, KHÔNG từ dự án cũ**: Mọi đề xuất PHẢI dựa trên phân tích nhu cầu dự án hiện tại, KHÔNG được sao chép từ KIs/dự án khác trừ khi user YÊU CẦU RÕ
7. **Đa phương án — Không đơn phương án**: Khi đề xuất tech stack, kiến trúc, thư viện, design → PHẢI trình bày **2-3 phương án** với ưu/nhược điểm. KHÔNG ĐƯỢC chỉ đề xuất 1 phương án duy nhất

## Elicitation Depth (từ `nexus.json`)

| Depth | Hành vi |
|-------|---------|
| `thorough` | Hỏi chi tiết tất cả — user chỉ định mọi thứ |
| `balanced` | AI đề xuất + user duyệt — cân bằng tốc độ và chính xác |
| `quick` | AI đề xuất, chỉ hỏi khi mơ hồ — nhanh nhất |

---

## 3 Loại Decision Point

### Loại 1 — Core Concept Clarification

**Khi nào**: Trong `/init`, sau Discovery Interview.

**Cách thực hiện**:

```
1. Phân tích mô tả dự án → trích danh sách "core concepts"
   (Core concept = khái niệm mà nếu hiểu sai sẽ làm sai toàn bộ dự án)

2. Với mỗi core concept, hỏi user:
   → "Bạn hình dung [concept] cụ thể như thế nào?"
   → "Có gì đặc biệt về [concept] mà tôi cần biết?"

3. Nếu user trả lời chung chung:
   → AI đề xuất cụ thể → "Tôi hiểu như thế này: [mô tả]. Đúng không?"
   → User xác nhận hoặc chỉnh sửa

4. Lưu kết quả vào requirements.md → section "Detail Decisions"
```

**Ví dụ tùy loại dự án**:

| Dự án | Core concepts AI trích ra |
|-------|--------------------------|
| Quản lý văn bản | Văn bản, Công việc, Phòng ban, Luồng duyệt |
| Game 2D | Nhân vật, Level, Combat system, Progression |
| Deep learning app | Model architecture, Dataset, Training pipeline, Inference API |
| App tư vấn | Khách hàng, Lịch hẹn, Tư vấn viên, Thanh toán |
| E-commerce | Sản phẩm, Giỏ hàng, Đơn hàng, Thanh toán, Vận chuyển |

> AI KHÔNG dùng bảng câu hỏi cố định. AI TỰ SINH câu hỏi dựa trên context dự án.

### Loại 2 — Implementation Choice

**Khi nào**: Trong `/plan`, trước khi tạo plan.

**Cách thực hiện**:

```
1. Với mỗi requirement thuộc phase:
   → AI xác định "những gì AI phải tự quyết nếu user không nói rõ"
   → Trình bày dạng bảng:

   | Quyết định | AI đề xuất | Bạn chọn gì? |
   |-----------|-----------|-------------|
   | [decision 1] | [AI's proposal] | ☐ Đồng ý / ☐ Thay đổi: ___ |
   | [decision 2] | [AI's proposal] | ☐ Đồng ý / ☐ Thay đổi: ___ |

2. User chọn 1 trong 2 cách:
   → Tự chỉ định: User mô tả chi tiết → AI tuân thủ chính xác
   → AI đề xuất: User duyệt bảng đề xuất → xác nhận hoặc chỉnh

3. Ghi nhận decisions vào requirements.md → section "Detail Decisions"
```

**Khi có quyết định cần so sánh**, sử dụng **Multi-Option Comparison Format**:

```markdown
### [Tên quyết định]

| Tiêu chí | Phương án A | Phương án B | Phương án C |
|----------|-------------|-------------|-------------|
| Mô tả | [...] | [...] | [...] |
| ✅ Ưu điểm | [...] | [...] | [...] |
| ❌ Nhược điểm | [...] | [...] | [...] |
| Phù hợp khi | [...] | [...] | [...] |
| Độ phức tạp | Thấp/TB/Cao | Thấp/TB/Cao | Thấp/TB/Cao |

→ **AI khuyến nghị**: Phương án [X] vì [lý do dựa trên nhu cầu dự án]
→ **Bạn chọn**: ☐ A / ☐ B / ☐ C / ☐ Khác: ___
```

> **Bắt buộc dùng bảng so sánh cho**: chọn tech stack, chọn framework/thư viện, chọn kiến trúc, chọn design pattern, chọn phong cách UI.
> **Không cần bảng cho**: chi tiết kỹ thuật nhỏ, naming convention, cấu trúc thư mục.

### Bias Check (v2.1 — inspired by Rune problem-solver)

> Khi đề xuất **phương án kiến trúc/tech stack lớn**, quét 6 bias phổ biến:

| Bias | Câu hỏi tự kiểm | Debiasing |
|------|-----------------|-----------|
| **Anchoring** | Đề xuất có bị ảnh hưởng bởi option đầu tiên nghĩ ra? | Đánh giá criteria TRƯỚC khi xem options |
| **Sunk Cost** | Có đang giữ approach cũ vì đã đầu tư thời gian? | Đánh giá fresh — nếu bắt đầu lại, có chọn giống không? |
| **Confirmation Bias** | Đã tìm evidence CHỐNG lại phương án ưa thích chưa? | Bắt buộc liệt kê nhược điểm phương án đề xuất |
| **Status Quo** | Có đang giữ cách làm hiện tại chỉ vì "đã hoạt động"? | Evaluate status quo cùng tiêu chuẩn như alternatives |
| **Planning Fallacy** | Estimate dựa trên best-case hay actual past performance? | So sánh với thời gian thực tế tasks tương tự đã mất |
| **Overconfidence** | Confidence level dựa trên gì? Đã sai tương tự trước? | Thêm buffer 30-50% cho estimates |

**Khi nào check**: Chỉ cho quyết định **kiến trúc lớn** (chọn framework, database, design pattern hệ thống). Không cần cho decisions nhỏ.

**Output**: Liệt kê 1-2 biases đáng lưu ý nhất cho quyết định đang xét, kèm 1-line debiasing action đã thực hiện.

### Loại 3 — Content Verification

**Khi nào**: Trong `/design` (trước wireframe) và `/execute` (trước code).

**Cách thực hiện**:

```
"Tôi sắp [vẽ wireframe / viết code] cho [feature X].
 Đây là nội dung tôi dự định:

 [liệt kê cụ thể — fields, components, logic, ...]

 Bạn xác nhận hay cần điều chỉnh?"
```

**Quy tắc**: Chỉ cần xác nhận ở mức feature/screen, không cần xác nhận từng dòng code.

### Loại 4 — Design Ideation (Screen & Component Interview)

**Khi nào**: Trong `/design` — Stage 2 (per screen) và Stage 3 (per component group).

**Khác Loại 3**: Loại 3 xác nhận nội dung → "screen X hiện gì?". Loại 4 đi sâu vào **ý tưởng thiết kế** → "screen X nên trông như thế nào, cảm giác gì, user tương tác ra sao?"

**Cách thực hiện — Screen-Level (Stage 2)**:

```
Với mỗi screen/screen-group trong phase:

1. Purpose Interview:
   → "Mục đích chính của [screen] là gì? User đến đây để làm gì?"
   → "Thông tin quan trọng nhất user cần thấy ngay?"
   → "Có hành động chính (primary action) nào không?"

2. Content & Layout Interview:
   → "Bạn hình dung layout [screen] theo kiểu nào?"
     Đề xuất 2-3 layout alternatives (ví dụ: sidebar+content, full-width, card grid)
   → "Có nội dung đặc biệt nào cần hiển thị?" (charts, tables, forms, media)
   → "Mức độ thông tin: tối giản hay chi tiết?"

3. Interaction & Feel Interview:
   → "User tương tác chính trên trang này là gì?" (filter, search, create, edit, browse)
   → "Cảm giác mong muốn: nhanh-gọn, chuyên nghiệp, thân thiện, hay khác?"
   → "Có reference/inspiration nào bạn thích không?" (app, website, style)

4. Tổng hợp thành Screen Brief → user xác nhận → rồi mới wireframe
```

**Cách thực hiện — Component-Level (Stage 3)**:

```
Với mỗi component group (Form controls, Navigation, Data display, Feedback, Overlays):

1. Inventory Interview:
   → "Với nhóm [component group], bạn cần những component nào?"
   → Đề xuất danh sách dựa trên wireframes đã duyệt
   → User xác nhận hoặc bổ sung

2. Behavior Interview:
   → "Component [X] cần những trạng thái nào?" (đề xuất based on context)
   → "Có interaction đặc biệt nào?" (drag-drop, swipe, long-press, hover reveal)
   → "Cần responsive variants không?" (desktop/tablet/mobile differences)

3. Tổng hợp thành Component Brief → user xác nhận → rồi mới chi tiết component specs
```

**Lưu ý quan trọng**:
- Gom câu hỏi thành **1 block per screen/group** — không hỏi lẻ tẻ
- Đề xuất đi kèm câu hỏi (ví dụ: "Layout tôi đề xuất: sidebar+content vì phù hợp với dashboard. Bạn thấy sao?")
- KHÔNG áp đặt — luôn cho user quyền thay đổi
- Kết quả lưu vào `.nexus/phases/phase-{N}/design/screen-briefs/` hoặc `component-briefs/`

---

## Khi nào KHÔNG cần hỏi

- Chi tiết kỹ thuật thuần túy (cấu trúc thư mục, naming convention, design patterns)
- Best practices đã được community thống nhất
- Nội dung đã xác nhận ở Decision Point trước đó
- User đã chỉ định rõ ở bước trước

## ⛔ Anti-Bias: Dự án cũ vs Dự án mới

> **Mỗi dự án là một thực thể độc lập.** Agent KHÔNG ĐƯỢC để kiến thức từ dự án cũ ảnh hưởng đề xuất cho dự án mới.

| Được phép | KHÔNG được phép |
|-----------|------------------|
| Phân tích nhu cầu cụ thể → đề xuất phương án tốt nhất | Copy tech stack từ KIs/dự án khác |
| So sánh ưu/nhược điểm các lựa chọn | Giả định dùng cùng framework vì "đã thành công" |
| Tham khảo KIs chỉ khi user yêu cầu rõ | Mặc định lấy pattern/design từ dự án cũ |
| Dùng kiến thức chung (best practices) | Dùng kiến thức cụ thể của dự án cũ |

## Lưu trữ kết quả

Kết quả elicitation được lưu vào `requirements.md` section "Detail Decisions":

```markdown
## Detail Decisions

### [Timestamp] — /init Core Concepts
| Concept | Quyết định | Nguồn |
|---------|-----------|-------|
| [concept] | [chi tiết đã xác nhận] | user / AI đề xuất + user duyệt |

### [Timestamp] — /plan Phase N
| Quyết định | Chi tiết | Nguồn |
|-----------|---------|-------|
| [decision] | [confirmed detail] | user / AI đề xuất + user duyệt |
```

## References

- Workflow tích hợp: `init.md` (Step 1.5), `plan.md` (Step 1.5), `design.md` (Step 3.5 + Stage 2/3)
- Config: `nexus.json → elicitation.depth`
- Lưu trữ: `.nexus/requirements.md → Detail Decisions`
