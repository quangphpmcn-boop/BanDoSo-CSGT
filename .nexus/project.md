# Project Definition

## Core Value

Cung cấp công cụ bản đồ số trực quan để so sánh tổ chức đội trạm CSGT Hải Phòng hiện tại với phương án quy hoạch mới (19→12 đội trạm).

## Vision

Bản đồ web tương tác hiển thị địa giới hành chính 114 xã/phường của TP Hải Phòng (bao gồm cả phần Hải Dương sáp nhập), thể hiện rõ ràng địa bàn, tuyến đường/sông, trụ sở của từng đơn vị CSGT. Người xem có thể chuyển đổi giữa chế độ "Hiện tại" và "Quy hoạch" để so sánh trực quan sự thay đổi về phân vùng, tuyến quản lý và vị trí trụ sở.

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Language | HTML/CSS/JavaScript | Vanilla JS, không framework |
| Map Engine | Leaflet.js | Thư viện bản đồ mã nguồn mở, nhẹ |
| Data Format | GeoJSON + JSON | Dữ liệu tĩnh, local-first |
| Map Tiles | OpenStreetMap / Offline tiles | Có thể dùng OSM online hoặc extract tiles |
| Hosting | Static files (local/LAN) | Mở trực tiếp bằng trình duyệt |

## Constraints

- **Dữ liệu sẵn có**: GeoJSON phường/xã, OSM PBF, DOCX phân công tuyến, XLSX dân số
- **Offline-capable**: Cần hoạt động tốt trên mạng nội bộ hoặc offline
- **Người dùng**: Lãnh đạo Phòng CSGT — cần giao diện đơn giản, trực quan
- **Phần mềm tiếng Việt**: Toàn bộ nội dung hiển thị bằng tiếng Việt
- **Dữ liệu nhạy cảm**: Thông tin tổ chức nội bộ, không public

## Key Decisions

| # | Date | Decision | Rationale | Phase |
|---|------|----------|-----------|-------|
| 1 | 2026-03-31 | Leaflet.js + Vanilla JS | Nhẹ, offline, không cần build tools, mở file HTML trực tiếp | Init |
| 2 | 2026-03-31 | GeoJSON tĩnh cho địa giới | Dữ liệu đã có sẵn file geojson 34 tỉnh/phường xã | Init |
| 3 | 2026-03-31 | Toggle hiện tại/quy hoạch | Yêu cầu cốt lõi — so sánh trực quan 2 phương án | Init |
| 4 | 2026-03-31 | Mask tỉnh xung quanh | Tập trung vào Hải Phòng, che các tỉnh lân cận | Init |

## Out of Scope

- Chỉnh sửa dữ liệu trực tuyến (admin panel)
- Routing/navigation trên bản đồ
- Real-time tracking phương tiện
- Mobile app native
