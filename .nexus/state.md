# Project State

## Project Reference

See: .nexus/project.md (updated 2026-03-31)

**Core value:** Bản đồ số so sánh tổ chức CSGT Hải Phòng hiện tại vs quy hoạch
**Current focus:** V1 Complete + Road Classification Fix + Manual Road Selection

## Current Position

Phase: ALL COMPLETE (V1 — 4/4 phases done)
Plan: All plans executed
Status: V1 hoàn thiện + road re-classification from PBF + manual road pinning
Last activity: 2026-04-01 — Re-classify roads bằng ref field, extract từ PBF, thêm click chọn đường bổ sung

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 4 (Phase 1-4)
- Average duration: ~30 min/phase
- Total execution time: ~12 hours (4 sessions)

**By Phase:**

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Nền tảng bản đồ (Leaflet, 114 wards, mask) | ✅ |
| 2 | Tương tác (ward-unit mapping, highlight, info panel) | ✅ |
| 3 | So sánh & Đường thuỷ (40 sông, stats bar) | ✅ |
| 4 | Responsive & Polish (mobile, tablet, print) | ✅ |
| Quick | Logo CSGT, trống đồng BG, compact layout | ✅ |
| Quick | Ward labels (adaptive, polygon centroid) | ✅ |
| Quick | Fix ward label flicker on unit toggle | ✅ |
| Quick | Xóa chú giải sidebar | ✅ |
| Quick | Road overlay: quốc lộ + đường tỉnh trên bản đồ | ✅ |
| Quick | Road label dedup, filter infra, ward border tuning | ✅ |
| Quick | Fix out-of-jurisdiction road display (point-in-polygon) | ✅ |
| Quick | Re-classify roads bằng ref field (PBF extract) | ✅ |
| Quick | Click chọn đường bổ sung (pin/unpin, localStorage) | ✅ |

## Accumulated Context

### Decisions

- [Init]: Leaflet.js + Vanilla JS, GeoJSON tĩnh, toggle hiện tại/quy hoạch
- [Design]: Direction C "The Sovereign Lens" — Gold #D4A017 + Public Sans/Inter
- [Design]: Layout: Sidebar trái 240px (compact), floating info panel
- [Quick]: Logo = Phù hiệu CSGT, Background = Trống đồng overlay
- [Quick]: Basemap = light_nolabels, ward labels = adaptive polygon-pixel sizing
- [Quick]: Unicode normalization NFD strip diacritics cho ward matching
- [Quick]: Road data extracted from OSM PBF (v260330) → haiphong-roads.geojson (4937 features)
- [Quick]: Road classification: ref-based (QL→quoc_lo, ĐT→duong_tinh, else→noi_thi)
- [Quick]: Road display: chỉ quốc lộ + đường tỉnh mặc định, 1 label/tuyến, filter cầu/vòng xuyến
- [Quick]: Manual road pinning: click thêm đường nội thị, lưu localStorage per unit
- [Quick]: Ward borders mờ + dashed khi chọn đội đường bộ
- [Quick]: Point-in-polygon (ray-casting) cho jurisdiction filtering thay vì bounding box

### Pending Todos

None. V1 feature complete.

### Blockers/Concerns

- Không có git repository — khuyến nghị khởi tạo git cho dự án
- CSS path `../docs/trống đồng.jpg` có thể gây 404 nếu file bị rename

### Lessons Learned

Active rules: 6 | Last updated: 2026-04-01

1. Unicode Vietnamese: `Hoà` ≠ `Hòa` — normalize NFD strip diacritics
2. OSM highway tag ≠ VN road classification — dùng ref field (QL/ĐT prefix)
3. Bounding box filtering thiếu chính xác — dùng point-in-polygon cho jurisdiction

## Session Continuity

Last session: 2026-04-01 17:26
Machine: DESKTOP-N2FQSRE
Stopped at: Hoàn thành re-classify roads từ PBF + tính năng click thêm đường bổ sung
Next step: Kiểm tra thủ công từng đơn vị, ghim đường bổ sung theo yêu cầu nghiệp vụ
Handover: yes
