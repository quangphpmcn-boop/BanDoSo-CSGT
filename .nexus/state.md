# Project State

## Project Reference

See: .nexus/project.md (updated 2026-03-31)

**Core value:** Bản đồ số so sánh tổ chức CSGT Hải Phòng hiện tại vs quy hoạch
**Current focus:** V1 Complete + Road & Waterway Integration + Manual Pinning

## Current Position

Phase: ALL COMPLETE (V1 — 4/4 phases done + waterway + route management overhaul)
Plan: All plans executed
Status: V1 + road re-classification + waterway data + edit mode overhaul (header button, floating toolbar, segment-based selection)
Last activity: 2026-04-02 — Route management overhaul: header edit button, floating toolbar, segment-based waterway selection

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 4 (Phase 1-4) + multiple quick tasks
- Average duration: ~30 min/phase
- Total execution time: ~18 hours (6 sessions)

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
| Quick | Performance optimization: 3-tier caching road filter | ✅ |
| Quick | Waterway integration: 718 segments từ OSM PBF | ✅ |
| Quick | Manual waterway pinning (candidate selection) | ✅ |
| Quick | Route management overhaul: header edit button + floating toolbar | ✅ |
| Quick | Segment-based waterway/road selection (per OSM segment) | ✅ |
| Quick | Road/waterway display uses proper classification colors | ✅ |

## Accumulated Context

### Decisions

- [Init]: Leaflet.js + Vanilla JS, GeoJSON tĩnh, toggle hiện tại/quy hoạch
- [Design]: Direction C "The Sovereign Lens" — Gold #D4A017 + Public Sans/Inter
- [Design]: Layout: Sidebar trái 240px (compact), floating info panel
- [Quick]: Logo = Phù hiệu CSGT, Background = Trống đồng overlay
- [Quick]: Basemap = light_nolabels, ward labels = adaptive polygon-pixel sizing
- [Quick]: Unicode normalization NFD strip diacritics cho ward matching
- [Quick]: Road data extracted from OSM PBF (v260330) → haiphong-roads.geojson (6878 features)
- [Quick]: Road classification: ref-based (QL→quoc_lo, ĐT→duong_tinh, else→noi_thi)
- [Quick]: Road display: chỉ quốc lộ + đường tỉnh mặc định, 1 label/tuyến, filter cầu/vòng xuyến
- [Quick]: Manual road pinning: click thêm đường nội thị, lưu localStorage per unit
- [Quick]: Ward borders mờ + dashed khi chọn đội đường bộ
- [Quick]: Turf.js intersection → BBox pre-check → 3-tier caching for performance
- [Quick]: Waterway data: 718 segments extracted from OSM PBF → haiphong-waterways.geojson
- [Quick]: Waterway-unit mapping: waterway-unit-mapping.json (6 current + 3 planned units)
- [Quick]: Edit mode: header button (top-right) + floating toolbar (left) + status bar (bottom)
- [Quick]: Candidate roads filter: chỉ quốc lộ + tỉnh lộ (bỏ nội thị) — weight 8 dễ click
- [Quick]: Pinned roads/waterways dùng đúng màu phân cấp (không đổi màu teal)
- [Quick]: Đường thủy quản lý theo tuyến, KHÔNG theo ward bounds — không clip
- [Quick]: Waterway candidates hiện từng OSM segment riêng lẻ (Sông Tam Bạc = 7 segments)

### Pending Todos

- 15 tuyến đường thủy không có trong OSM PBF — cần thêm thủ công hoặc bỏ qua
- Debug scripts (scripts/*.cjs, scripts/*.txt) chưa commit — cleanup nếu cần
- Wave 2-4 checkpoint-based selection (click 2 điểm trên tuyến) chưa implement

### Blockers/Concerns

- CSS path `../docs/trống đồng.jpg` có thể gây 404 nếu file bị rename
- Git ownership issue trên máy DESKTOP-N2FQSRE

### Lessons Learned

Active rules: 5 | Last updated: 2026-04-02

1. Unicode Vietnamese: `Hoà` ≠ `Hòa` — normalize NFD strip diacritics
2. OSM highway tag ≠ VN road classification — dùng ref field (QL/ĐT prefix)
3. Bounding box filtering thiếu chính xác — dùng point-in-polygon cho jurisdiction
4. OSM waterway naming ≠ official VN names — cần fuzzy matching/manual mapping
5. Đường thủy quản lý theo tuyến (không theo ward) — KHÔNG clip theo bounds

## Session Continuity

Last session: 2026-04-02 11:59
Machine: DESKTOP-N2FQSRE
Stopped at: Route management overhaul hoàn thành — header edit button, floating toolbar, segment-based waterway/road selection, proper classification colors
Next step: Test thêm/bớt tuyến thực tế trên từng đơn vị, implement checkpoint-based selection (Wave 2)
Handover: yes
