# Requirements

## V1 (Must Have)

| ID | Requirement | Phase | Status |
|----|------------|-------|--------|
| REQ-001 | Bản đồ nền Hải Phòng với mask che các tỉnh xung quanh (chỉ hiện tên tỉnh) | 1 | ⬚ |
| REQ-002 | Hiển thị địa giới hành chính 114 xã/phường trên bản đồ | 1 | ⬚ |
| REQ-003 | Click xã/phường hiển thị thông tin (tên, diện tích, nhân khẩu, đơn vị quản lý) | 1 | ⬚ |
| REQ-004 | Sidebar danh sách đơn vị đội trạm — chọn hiện địa bàn, tuyến, trụ sở | 2 | ⬚ |
| REQ-005 | Đội văn phòng: hiện bảng thông tin + vị trí trụ sở | 2 | ⬚ |
| REQ-006 | Đội CSGT đường bộ: hiện địa bàn quản lý + tuyến đường + trụ sở | 2 | ⬚ |
| REQ-007 | Đội CS đường thuỷ: hiện tuyến sông quản lý + trụ sở | 2 | ⬚ |
| REQ-008 | Toggle chuyển đổi "Hiện tại" ↔ "Quy hoạch" để so sánh | 3 | ⬚ |
| REQ-009 | Dữ liệu quy hoạch: 5 đội đường bộ mới (địa bàn + tuyến + trụ sở) | 3 | ⬚ |
| REQ-010 | Dữ liệu quy hoạch: 2 đội + 1 trạm đường thuỷ mới | 3 | ⬚ |
| REQ-011 | Logo CSGT trên giao diện | 1 | ⬚ |

## V2 (Nice to Have)

| ID | Requirement | Phase | Status |
|----|------------|-------|--------|
| REQ-101 | So sánh side-by-side (2 bản đồ song song) | - | ⬚ |
| REQ-102 | Thống kê tổng hợp (bảng so sánh quân số, km tuyến, diện tích) | - | ⬚ |
| REQ-103 | Export/print bản đồ ra PDF/PNG | - | ⬚ |
| REQ-104 | Tìm kiếm xã/phường/tuyến đường | - | ⬚ |
| REQ-105 | Chế độ offline hoàn toàn với tiles đã cache | - | ⬚ |

## Out of Scope

| ID | Requirement | Reason |
|----|------------|--------|
| OOS-001 | Admin panel chỉnh sửa dữ liệu | V1 dùng file tĩnh, không cần backend |
| OOS-002 | Routing/navigation đường đi | Không phải mục tiêu dự án |
| OOS-003 | Real-time GPS tracking | Ngoài phạm vi bản đồ quy hoạch |

## Detail Decisions

> Kết quả từ Requirements Elicitation — các quyết định đã xác nhận với user.

### Core Concepts (từ /init)
| Concept | Quyết định | Nguồn |
|---------|-----------|-------|
| Đơn vị tổ chức | 19 đội trạm hiện tại → 12 đội trạm quy hoạch (giảm 7) | Báo cáo quy hoạch 26/3/2026 |
| Đường bộ hiện tại | 5 Đội + 3 Trạm CSGT đường bộ | Báo cáo quy hoạch |
| Đường bộ quy hoạch | 5 Đội CSGT đường bộ (nhập Trạm vào Đội) | File 5 ĐỘI CSGT ĐƯỜNG BỘ.docx |
| Đường thuỷ hiện tại | 3 Đội + 3 Trạm + 1 Đội chống tội phạm | Báo cáo quy hoạch |
| Đường thuỷ quy hoạch | 2 Đội + 1 Trạm (bỏ Đội chống tội phạm) | File Các Đội đường thuỷ.docx |
| Văn phòng | 4 Đội giữ nguyên (Tham mưu, Tuyên truyền, Đăng ký, Sát hạch) | Báo cáo quy hoạch |
| Dữ liệu dân số | 114 xã/phường với diện tích + nhân khẩu | File Excel |
| Mask tỉnh | Che chi tiết tỉnh xung quanh, chỉ để tên tỉnh | User yêu cầu |

### Implementation Choices (từ /plan)
| Phase | Quyết định | Chi tiết | Nguồn |
|-------|-----------|---------|-------|
| - | - | - | - |

## Traceability

Each requirement ID appears in:
- `roadmap.md` → Phase assignment
- `{phase}-{N}-PLAN.md` → Plan frontmatter `requirements:` field
- `{phase}-VERIFICATION.md` → Verification checklist
