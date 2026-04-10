/**
 * Bản đồ số Phòng CSGT — Công an TP Hải Phòng
 * Design System: "The Sovereign Lens"
 * Tech: Leaflet.js + Vanilla JS
 * Phase 2: Interactive unit display with ward highlighting
 */

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────
const HP_CENTER = [20.86, 106.68];
const HP_ZOOM = 11;
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

const NEIGHBOR_PROVINCES = [
  { name: 'Quảng Ninh', lat: 21.0, lng: 107.1 },
  { name: 'Hải Dương', lat: 20.93, lng: 106.32 },
  { name: 'Thái Bình', lat: 20.55, lng: 106.35 },
];

const TYPE_LABELS = {
  duong_bo: 'Đường bộ',
  duong_thuy: 'Đường thuỷ',
  van_phong: 'Văn phòng'
};

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
let map;
let wardLayer;
let maskLayer;
let wardLabelLayer;
let selectedUnitId = null;
let currentMode = 'current'; // 'current' | 'planned'
let unitsData = null;
let wardGeoJSON = null;
let boundaryGeoJSON = null;
let wardUnitMapping = null; // ward-name → unit-id mapping
let wardDemographics = null; // ward-name → {area, pop} mapping
let roadsGeoJSON = null;     // road geometry data
let roadLayer = null;        // active road overlay
let addRoadMode = false;     // toggle: manual road selection mode
let candidateRoadLayer = null; // layer for candidate noi_thi roads
let waterwaysGeoJSON = null; // waterway geometry data
let waterwayUnitMapping = null; // waterway-unit mapping
let waterwayLayer = null;    // active waterway overlay
let addWaterwayMode = false; // toggle: manual waterway selection mode
let candidateWaterwayLayer = null; // layer for candidate waterway segments

// ── Edit Mode State ──
let editMode = false;              // master edit toggle
let editSubMode = null;            // 'add' | 'remove' | 'edit' | 'info' | 'location' | null
let editRouteSelection = null;     // for checkpoint: { routeName, segments, checkpointA, checkpointB }
let checkpointMarkers = [];        // checkpoint L.markers on map
let selectedRouteLine = null;      // highlighted route during add
let editStatusBarEl = null;        // status bar element
let hqMarker = null;               // draggable HQ marker

// ── Default HQ Locations (preset choices for quick selection) ──
const DEFAULT_HQ_LOCATIONS = [
  // ── Trụ sở Đội Văn Phòng ──
  { group: 'Trụ sở Đội Văn Phòng', name: '14 Phan Chu Trinh - Hồng Bàng - Hải Phòng', lat: 20.858639, lng: 106.682833 },
  { group: 'Trụ sở Đội Văn Phòng', name: '106A Nguyễn Lương Bằng, P. Thành Đông, TP Hải Phòng', lat: 20.938167, lng: 106.316861 },
  { group: 'Trụ sở Đội Văn Phòng', name: 'Km 57+600 Quốc lộ 5, P. Ái Quốc, TP Hải Phòng', lat: 20.959194, lng: 106.368056 },
  { group: 'Trụ sở Đội Văn Phòng', name: '119 Hùng Vương, Hồng Bàng, Hải Phòng', lat: 20.868806, lng: 106.655861 },

  // ── Trụ sở Đội, Trạm CSGT đường bộ ──
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: 'Ninh Tĩnh, Ninh Giang', lat: 20.733361, lng: 106.397278 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: 'Km35+350 QL10, xã An Quang, Hải Phòng', lat: 20.688222, lng: 106.479972 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: 'Số 21, đường 20/8, xã Vĩnh Bảo, HP', lat: 20.688212, lng: 106.479981 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: 'Số 2 đường Ngô Quyền, xã An Lão, HP', lat: 20.821194, lng: 106.556250 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: 'Số 78 đường 25/10, P. Thủy Nguyên, HP', lat: 20.918000, lng: 106.673222 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: 'Km9+400 QL10, P. Lưu Kiếm, HP', lat: 20.983444, lng: 106.672361 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: '702 Trần Nhân Tông, Kiến An, Hải Phòng', lat: 20.808806, lng: 106.640278 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: 'Số 6, Đường 351, An Dương, Hải Phòng', lat: 20.864944, lng: 106.613917 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: 'Km83+220 Quốc lộ 5, P. Hồng An, TP Hải Phòng', lat: 20.905472, lng: 106.575250 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: '541 Hùng Vương, Hồng Bàng, HP', lat: 20.889694, lng: 106.604083 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: '28 Ký Con, Hồng Bàng, HP', lat: 20.855639, lng: 106.674306 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: '281 Lạch Tray, Gia Viên, HP', lat: 20.831333, lng: 106.698778 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: 'Số 160, Đường 354, khu 3, xã Tiên Lãng', lat: 20.728639, lng: 106.558333 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: 'Khu Tắc Giang, Kiến Minh, HP', lat: 20.755194, lng: 106.675944 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: '202 đường Đa Phúc, TDP Quảng Luận, Hưng Đạo, HP', lat: 20.798389, lng: 106.658528 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: '263 Nguyễn Hữu Cầu, Đồ Sơn, HP', lat: 20.723417, lng: 106.776472 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: 'Ngõ 258 Đà Nẵng, Ngô Quyền, Hải Phòng', lat: 20.857278, lng: 106.706444 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: 'Số 257 Hai Bà Trưng, P. Lê Chân, TP Hải Phòng', lat: 20.851583, lng: 106.673667 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: '41 Tam Bạc, Hồng Bàng, HP', lat: 20.857306, lng: 106.674167 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: 'Số 185 đường Lê Thanh Nghị, xã Gia Lộc, TP Hải Phòng', lat: 20.866306, lng: 106.293889 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: '35 ĐL Hồ Chí Minh - P. Thành Đông - TP Hải Phòng', lat: 20.938917, lng: 106.327139 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: '25 đường Phượng Hoàng, P. Trần Hưng Đạo, TP Hải Phòng', lat: 21.118944, lng: 106.392583 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: 'KM58+900 QL5, P. Ái Quốc, Hải Phòng', lat: 20.967028, lng: 106.377028 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: 'Đường Đinh Tiên Hoàng, khu 1, xã Kẻ Sặt, TP Hải Phòng', lat: 20.901167, lng: 106.157444 },
  { group: 'Trụ sở Đội/Trạm CSGT đường bộ', name: 'Thôn Bến, đặc khu Cát Hải, Hải Phòng', lat: 20.753028, lng: 107.013583 },

  // ── Trụ sở Đội, Trạm CSĐT ──
  { group: 'Trụ sở Đội/Trạm CSĐT', name: 'Số 1 Chương Dương', lat: 20.864667, lng: 106.670083 },
  { group: 'Trụ sở Đội/Trạm CSĐT', name: 'TDP 4, Nam Triệu, Hải Phòng', lat: 20.937500, lng: 106.764778 },
  { group: 'Trụ sở Đội/Trạm CSĐT', name: 'Thôn Hạ Vĩnh, xã Hà Đông, TP Hải Phòng', lat: 20.846889, lng: 106.486306 },
  { group: 'Trụ sở Đội/Trạm CSĐT', name: 'Tân Thắng, An Hưng, Hải Phòng', lat: 20.763500, lng: 106.549917 },
  { group: 'Trụ sở Đội/Trạm CSĐT', name: 'Bờ trái sông Cấm, gần bến phà Máy Chai, P. Ngô Quyền, HP', lat: 20.875472, lng: 106.705333 },
  { group: 'Trụ sở Đội/Trạm CSĐT', name: 'KDC Vạn Chánh, P. Nhị Chiểu, TP Hải Phòng', lat: 21.013611, lng: 106.546083 }
];

// Pinned roads: { unitId: Set<osm_id> } — persisted in localStorage
function getPinnedRoads(unitId) {
  try {
    const data = JSON.parse(localStorage.getItem('pinnedRoads') || '{}');
    return new Set(data[unitId] || []);
  } catch { return new Set(); }
}
function savePinnedRoads(unitId, set) {
  try {
    const data = JSON.parse(localStorage.getItem('pinnedRoads') || '{}');
    data[unitId] = [...set];
    localStorage.setItem('pinnedRoads', JSON.stringify(data));
  } catch { }
}

// Pinned waterways: { unitId: Set<osm_id> } — persisted in localStorage
function getPinnedWaterways(unitId) {
  try {
    const data = JSON.parse(localStorage.getItem('pinnedWaterways') || '{}');
    return new Set(data[unitId] || []);
  } catch { return new Set(); }
}
function savePinnedWaterways(unitId, set) {
  try {
    const data = JSON.parse(localStorage.getItem('pinnedWaterways') || '{}');
    data[unitId] = [...set];
    localStorage.setItem('pinnedWaterways', JSON.stringify(data));
  } catch { }
}

// Removed roads: segments user explicitly excluded from default mapping
function getRemovedRoads(unitId) {
  try {
    const data = JSON.parse(localStorage.getItem('removedRoads') || '{}');
    return new Set(data[unitId] || []);
  } catch { return new Set(); }
}
function saveRemovedRoads(unitId, set) {
  try {
    const data = JSON.parse(localStorage.getItem('removedRoads') || '{}');
    data[unitId] = [...set];
    localStorage.setItem('removedRoads', JSON.stringify(data));
  } catch { }
}

// Removed waterways: segments user explicitly excluded from default mapping
function getRemovedWaterways(unitId) {
  try {
    const data = JSON.parse(localStorage.getItem('removedWaterways') || '{}');
    return new Set(data[unitId] || []);
  } catch { return new Set(); }
}
function saveRemovedWaterways(unitId, set) {
  try {
    const data = JSON.parse(localStorage.getItem('removedWaterways') || '{}');
    data[unitId] = [...set];
    localStorage.setItem('removedWaterways', JSON.stringify(data));
  } catch { }
}

// Road color scheme by classification
const ROAD_STYLES = {
  quoc_lo: { color: '#D32F2F', weight: 7, opacity: 0.9, label: 'Quốc lộ' },
  duong_tinh: { color: '#F57C00', weight: 5, opacity: 0.85, label: 'Đường tỉnh' },
  noi_thi: { color: '#78909C', weight: 2.5, opacity: 0.5, label: 'Đường nội thị' }
};

// ──────────────────────────────────────────────
// Init
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initMap();
  await loadData();
  buildWardUnitIndex();
  renderWards();
  renderMask();
  renderStats();
  renderSidebar();
  bindEvents();

  // Pre-compute road filter caches in background (non-blocking)
  _precomputeRoadCaches();
});

// ──────────────────────────────────────────────
// Map Setup
// ──────────────────────────────────────────────
function initMap() {
  map = L.map('map', {
    center: HP_CENTER,
    zoom: HP_ZOOM,
    zoomControl: true,
    attributionControl: true,
    maxBounds: [[19.8, 105.8], [21.5, 107.5]],
    minZoom: 9,
    maxZoom: 16
  });

  L.tileLayer(TILE_URL, {
    attribution: TILE_ATTR,
    maxZoom: 18,
    subdomains: 'abcd'
  }).addTo(map);

  map.zoomControl.setPosition('bottomright');

  // Custom panes for z-index control (higher = on top for mouse events)
  // Default overlayPane is z=400 — wards go there
  map.createPane('roadPane').style.zIndex = 450;
  map.createPane('waterwayPane').style.zIndex = 451;
  map.createPane('candidatePane').style.zIndex = 460;
}

// ──────────────────────────────────────────────
// Data Loading
// ──────────────────────────────────────────────
async function loadData() {
  try {
    const [unitsRes, wardsRes, boundaryRes, mappingRes, demoRes, roadsRes, waterwaysRes, wwMappingRes] = await Promise.all([
      fetch('data/units.json'),
      fetch('data/haiphong-wards.geojson'),
      fetch('data/haiphong-boundary.geojson'),
      fetch('data/ward-unit-mapping.json'),
      fetch('data/ward-demographics.json'),
      fetch('data/haiphong-roads.geojson'),
      fetch('data/haiphong-waterways.geojson'),
      fetch('data/waterway-unit-mapping.json')
    ]);

    unitsData = await unitsRes.json();
    wardGeoJSON = await wardsRes.json();
    boundaryGeoJSON = await boundaryRes.json();
    wardUnitMapping = await mappingRes.json();
    wardDemographics = await demoRes.json();
    roadsGeoJSON = await roadsRes.json();
    waterwaysGeoJSON = await waterwaysRes.json();
    waterwayUnitMapping = await wwMappingRes.json();

    console.log(`Loaded: ${wardGeoJSON.features.length} wards, ${unitsData.current.units.length} current units, ${roadsGeoJSON.features.length} roads, ${waterwaysGeoJSON.features.length} waterways, mapping OK`);
  } catch (err) {
    console.error('Error loading data:', err);
    document.getElementById('unit-list').innerHTML = '<div style="padding:16px;color:#E53935;text-align:center">⚠️ Không tải được dữ liệu.<br>Kiểm tra kết nối mạng và thử lại.</div>';
  }
}

// ──────────────────────────────────────────────
// Ward-Unit Index (reverse lookup: wardName → unitId)
// ──────────────────────────────────────────────
let wardToUnit = {}; // { wardName: { unitId, unitName, unitColor } }

function buildWardUnitIndex() {
  wardToUnit = {};
  if (!wardUnitMapping || !unitsData) return;

  const units = getActiveUnits();

  for (const [unitId, data] of Object.entries(wardUnitMapping)) {
    const unit = units.find(u => u.id === unitId);
    if (!unit || !data.wards) continue;

    data.wards.forEach(wardName => {
      const normalizedName = normalizeWardName(wardName);
      wardToUnit[normalizedName] = {
        unitId: unit.id,
        unitName: unit.name,
        unitColor: unit.color
      };
    });
  }

  console.log(`Ward-Unit index: ${Object.keys(wardToUnit).length} ward mappings`);
}

function normalizeWardName(name) {
  return name.trim()
    .replace(/^(Phường|Xã|Đặc khu|TT\.?)\s+/i, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC');
}

function getWardName(feature) {
  const props = feature.properties;
  return props.ten_xa || props.ten || props.name || props.Name || props.NAME_3 || '';
}

function getWardDistrict(feature) {
  const props = feature.properties;
  return props.ten_huyen || props.huyen || props.NAME_2 || props.quan_huyen || '';
}

function findUnitForWard(wardName) {
  const normalized = normalizeWardName(wardName);
  return wardToUnit[normalized] || null;
}

// Ward Layer
// ──────────────────────────────────────────────
let wardLabelData = []; // {name, bounds, marker}

function renderWards() {
  if (wardLayer) map.removeLayer(wardLayer);
  if (wardLabelLayer) map.removeLayer(wardLabelLayer);

  wardLayer = L.geoJSON(wardGeoJSON, {
    style: wardStyle,
    onEachFeature: onEachWard,
    pane: 'overlayPane' // z=400, below roads
  }).addTo(map);

  // Build labels — one marker per ward polygon
  wardLabelData = [];
  wardLabelLayer = L.layerGroup();

  wardGeoJSON.features.forEach(f => {
    const name = getWardName(f);
    if (!name) return;
    const center = getPolygonCentroid(f);
    if (!center) return;
    const bounds = L.geoJSON(f).getBounds();

    // Create marker with a minimal placeholder icon
    // Actual sizing is done in updateWardLabels on every zoom
    const marker = L.marker(center, {
      icon: L.divIcon({
        className: 'ward-label',
        html: `<span>${name}</span>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      }),
      interactive: false
    });

    wardLabelData.push({ name, bounds, marker });
    wardLabelLayer.addLayer(marker);
  });

  wardLabelLayer.addTo(map);

  // Defer first update to let markers render
  setTimeout(updateWardLabels, 100);

  map.off('zoomend', updateWardLabels);
  map.on('zoomend', updateWardLabels);
}

function updateWardLabels() {
  if (!wardLabelLayer || !wardLabelData.length) return;
  const zoom = map.getZoom();

  if (zoom <= 9) {
    if (map.hasLayer(wardLabelLayer)) map.removeLayer(wardLabelLayer);
    return;
  }

  if (!map.hasLayer(wardLabelLayer)) wardLabelLayer.addTo(map);

  wardLabelData.forEach(({ name, bounds, marker }) => {
    const el = marker.getElement();
    if (!el) return;

    // Get polygon pixel dimensions at current zoom
    const sw = map.latLngToContainerPoint(bounds.getSouthWest());
    const ne = map.latLngToContainerPoint(bounds.getNorthEast());
    const pxW = Math.abs(ne.x - sw.x);
    const pxH = Math.abs(sw.y - ne.y);

    // Size the container div to match the polygon bounding box
    // and center it on the marker position (centroid) via negative margins
    el.style.width = pxW + 'px';
    el.style.height = pxH + 'px';
    el.style.marginLeft = (-pxW / 2) + 'px';
    el.style.marginTop = (-pxH / 2) + 'px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.overflow = 'hidden';
    el.style.pointerEvents = 'none';

    const span = el.querySelector('span');
    if (!span) return;

    // Calculate font size so text fits within polygon:
    // Width: each char ≈ 0.6em, text must fit in 80% of polygon width
    const maxFontByWidth = (pxW * 0.75) / (name.length * 0.6);
    // Height: text height should fit in 30% of polygon height
    const maxFontByHeight = pxH * 0.3;
    const fontSize = Math.min(maxFontByWidth, maxFontByHeight, 14);

    if (fontSize < 4 || pxW < 20 || pxH < 15) {
      span.style.display = 'none';
    } else {
      const finalSize = Math.max(5, Math.round(fontSize));
      span.style.display = '';
      span.style.fontSize = finalSize + 'px';
      span.style.whiteSpace = 'nowrap';
      span.style.overflow = 'hidden';
      span.style.textOverflow = 'ellipsis';
      span.style.maxWidth = (pxW * 0.9) + 'px';
      span.style.textAlign = 'center';
      span.style.opacity = finalSize < 7 ? '0.4' : finalSize < 9 ? '0.6' : '0.85';
    }
  });
}

// Compute polygon centroid (geometric center of mass)
function getPolygonCentroid(feature) {
  try {
    const geom = feature.geometry;
    let coords;

    if (geom.type === 'Polygon') {
      coords = geom.coordinates[0];
    } else if (geom.type === 'MultiPolygon') {
      let maxArea = 0;
      geom.coordinates.forEach(poly => {
        const a = polygonArea(poly[0]);
        if (a > maxArea) { maxArea = a; coords = poly[0]; }
      });
    }

    if (!coords || coords.length < 3) return null;

    let cx = 0, cy = 0, area = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const [x0, y0] = coords[i];
      const [x1, y1] = coords[i + 1];
      const cross = x0 * y1 - x1 * y0;
      area += cross;
      cx += (x0 + x1) * cross;
      cy += (y0 + y1) * cross;
    }
    area *= 0.5;
    if (Math.abs(area) < 1e-10) return null;
    cx /= (6 * area);
    cy /= (6 * area);

    return [cy, cx]; // Leaflet [lat, lng]
  } catch {
    return null;
  }
}

function polygonArea(ring) {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(area * 0.5);
}

function wardStyle(feature) {
  const wardName = getWardName(feature);
  const unitInfo = findUnitForWard(wardName);

  // If a unit is selected, highlight its wards with vivid color
  if (selectedUnitId && unitInfo && unitInfo.unitId === selectedUnitId) {
    // Check if the selected unit is đường bộ → slightly subtler to avoid confusion with roads
    const selectedUnit = getActiveUnits().find(u => u.id === selectedUnitId);
    const isDuongBo = selectedUnit && selectedUnit.type === 'duong_bo';

    return {
      fillColor: unitInfo.unitColor,
      fillOpacity: isDuongBo ? 0.25 : 0.4,
      color: unitInfo.unitColor,
      weight: isDuongBo ? 1.5 : 2.5,
      opacity: isDuongBo ? 0.6 : 0.9,
      dashArray: null
    };
  }

  // If a unit is selected but this ward doesn't belong to it → dim
  if (selectedUnitId) {
    return {
      fillColor: '#9AA0A6',
      fillOpacity: 0.03,
      color: '#817662',
      weight: 0.5,
      opacity: 0.15
    };
  }

  // Default: no unit selected — show each ward tinted by its assigned unit color
  if (unitInfo) {
    return {
      fillColor: unitInfo.unitColor,
      fillOpacity: 0.12,
      color: unitInfo.unitColor,
      weight: 1,
      opacity: 0.35
    };
  }

  // Unassigned wards: subtle neutral tint
  return {
    fillColor: '#D4A017',
    fillOpacity: 0.04,
    color: '#817662',
    weight: 0.8,
    opacity: 0.3
  };
}

function onEachWard(feature, layer) {
  const wardName = getWardName(feature);
  const district = getWardDistrict(feature);
  const unitInfo = findUnitForWard(wardName);

  // Tooltip: show ward name on hover
  layer.bindTooltip(wardName + (district ? ` — ${district}` : ''), {
    sticky: true,
    className: 'ward-hover-tooltip',
    direction: 'top',
    offset: [0, -10]
  });

  // Click: select the managing unit → highlight entire cluster
  layer.on({
    click: (e) => {
      L.DomEvent.stopPropagation(e);
      if (unitInfo) {
        selectUnit(unitInfo.unitId);
      }
    },
    mouseover: (e) => {
      const l = e.target;
      if (selectedUnitId) {
        // Only enhance if this ward belongs to selected unit
        if (unitInfo && unitInfo.unitId === selectedUnitId) {
          l.setStyle({ fillOpacity: 0.45, weight: 3 });
        }
      } else {
        l.setStyle({ fillOpacity: 0.15, weight: 2, opacity: 0.7 });
      }
      l.bringToFront();
    },
    mouseout: (e) => {
      wardLayer.resetStyle(e.target);
    }
  });
}

// ──────────────────────────────────────────────
// Mask (Hide surrounding provinces)
// ──────────────────────────────────────────────
function renderMask() {
  if (!boundaryGeoJSON || !boundaryGeoJSON.features.length) return;

  const worldBounds = [
    [-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180]
  ];

  const hpFeature = boundaryGeoJSON.features[0];
  const geomType = hpFeature.geometry.type;
  let hpPolygons = [];

  if (geomType === 'MultiPolygon') {
    hpFeature.geometry.coordinates.forEach(polygon => {
      const ring = polygon[0].map(coord => [coord[1], coord[0]]);
      hpPolygons.push(ring);
    });
  } else if (geomType === 'Polygon') {
    const ring = hpFeature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
    hpPolygons.push(ring);
  }

  const maskCoords = [worldBounds, ...hpPolygons];

  if (maskLayer) {
    map.removeLayer(maskLayer);
  }

  maskLayer = L.polygon(maskCoords, {
    fillColor: '#1a1c1d',
    fillOpacity: 0.5,
    stroke: false,
    interactive: false
  }).addTo(map);

  NEIGHBOR_PROVINCES.forEach(prov => {
    L.marker([prov.lat, prov.lng], {
      icon: L.divIcon({
        className: 'province-label',
        html: prov.name,
        iconSize: null
      }),
      interactive: false
    }).addTo(map);
  });
}

// ──────────────────────────────────────────────
// Statistics Bar
// ──────────────────────────────────────────────
function renderStats() {
  const units = getActiveUnits();
  const statsEl = document.getElementById('stats-bar');

  const dbCount = units.filter(u => u.type === 'duong_bo').length;
  const dtCount = units.filter(u => u.type === 'duong_thuy').length;
  const vpCount = units.filter(u => u.type === 'van_phong').length;
  const total = units.length;

  // Count total wards from mapping
  let totalWards = 0;

  if (wardUnitMapping) {
    for (const unit of units) {
      const mapping = wardUnitMapping[unit.id];
      if (mapping) {
        totalWards += (mapping.wards || []).length;
      }
    }
  }

  statsEl.innerHTML = `
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-number">${total}</div>
        <div class="stat-label">đội trạm</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${dbCount}</div>
        <div class="stat-label">đường bộ</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${dtCount}</div>
        <div class="stat-label">đường thuỷ</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${vpCount}</div>
        <div class="stat-label">văn phòng</div>
      </div>
    </div>
    ${totalWards > 0 ? `<div class="stat-summary">${totalWards} xã/phường</div>` : ''}
  `;
}

// ──────────────────────────────────────────────
// Sidebar
// ──────────────────────────────────────────────
function renderSidebar() {
  const units = getActiveUnits();
  const listEl = document.getElementById('unit-list');

  // Count wards per unit from mapping
  const wardCounts = {};
  if (wardUnitMapping) {
    for (const [unitId, data] of Object.entries(wardUnitMapping)) {
      wardCounts[unitId] = data.wards ? data.wards.length : 0;
    }
  }

  listEl.innerHTML = units.map(unit => {
    const count = wardCounts[unit.id] || 0;
    const countText = unit.type === 'van_phong' ? '' : count > 0 ? `${count} xã/phường` : '';
    return `
      <div class="unit-item ${unit.id === selectedUnitId ? 'active' : ''}" 
           data-unit-id="${unit.id}">
        <span class="unit-dot" style="background: ${unit.color}"></span>
        <div class="unit-info">
          <div class="unit-name">${unit.name}</div>
          <div class="unit-meta">
            <span class="unit-type-badge ${unit.type.replace('_', '-')}">${TYPE_LABELS[unit.type]}</span>
            ${countText ? `<span class="unit-ward-count">${countText}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind clicks
  listEl.querySelectorAll('.unit-item').forEach(item => {
    item.addEventListener('click', () => {
      selectUnit(item.dataset.unitId);
    });
  });
}

function getActiveUnits() {
  if (!unitsData) return [];
  return currentMode === 'current'
    ? unitsData.current.units
    : unitsData.planned.units;
}

// ──────────────────────────────────────────────
// Unit Selection
// ──────────────────────────────────────────────
function selectUnit(unitId) {
  const units = getActiveUnits();
  const unit = units.find(u => u.id === unitId);
  if (!unit) return;

  // Toggle
  if (selectedUnitId === unitId) {
    deselectUnit();
    return;
  }

  selectedUnitId = unitId;

  // Show header edit button
  const editBtn = document.getElementById('header-edit-btn');
  if (editBtn) editBtn.style.display = '';

  // Update sidebar
  document.querySelectorAll('.unit-item').forEach(el => {
    el.classList.toggle('active', el.dataset.unitId === unitId);
  });

  // Restyle wards on map (without rebuilding labels)
  refreshWardStyles();

  // For đường bộ units: show roads overlay (ward labels stay visible)
  if (unit.type === 'duong_bo') {
    showRoads(unitId);
    hideWaterways();
  } else if (unit.type === 'duong_thuy') {
    showWaterways(unitId);
    hideRoads();
  } else {
    hideRoads();
    hideWaterways();
  }

  // Show HQ marker on map (read-only)
  _showHqMarkerReadOnly(unit);

  // Zoom to unit's wards
  zoomToUnit(unitId);

  // Show info panel
  showInfoPanel(unit);
}

function deselectUnit() {
  selectedUnitId = null;
  document.querySelectorAll('.unit-item').forEach(el => {
    el.classList.remove('active');
  });
  // Exit edit mode and hide edit button
  if (editMode) exitEditMode();
  const editBtn = document.getElementById('header-edit-btn');
  if (editBtn) editBtn.style.display = 'none';
  hideInfoPanel();
  hideRoads();
  hideWaterways();
  // Remove HQ marker
  if (hqMarker) { map.removeLayer(hqMarker); hqMarker = null; }
  refreshWardStyles();

  // Reset zoom
  map.setView(HP_CENTER, HP_ZOOM, { animate: true });
}

// ──────────────────────────────────────────────
// Ward Labels Toggle
// ──────────────────────────────────────────────
function hideWardLabels() {
  if (wardLabelLayer && map.hasLayer(wardLabelLayer)) {
    map.removeLayer(wardLabelLayer);
  }
}

function showWardLabels() {
  if (wardLabelLayer && !map.hasLayer(wardLabelLayer)) {
    wardLabelLayer.addTo(map);
    updateWardLabels();
  }
}

// ──────────────────────────────────────────────
// Road Display
// ──────────────────────────────────────────────
function showRoads(unitId) {
  hideRoads();
  if (!roadsGeoJSON || !roadsGeoJSON.features.length) return;
  if (typeof turf === 'undefined') { console.warn('Turf.js not loaded'); return; }

  const mapping = wardUnitMapping ? wardUnitMapping[unitId] : null;
  if (!mapping || !mapping.wards || mapping.wards.length === 0) return;

  // ── Check cache first (instant if pre-computed) ──
  if (!window._roadFilterCache) window._roadFilterCache = {};
  const pinned = getPinnedRoads(unitId);
  const removed = getRemovedRoads(unitId);
  const cacheKey = unitId + ':' + pinned.size + ':' + removed.size;

  if (window._roadFilterCache[cacheKey]) {
    _renderRoads(window._roadFilterCache[cacheKey], unitId);
    return;
  }

  // ── Not cached yet — compute with loading indicator ──
  const mapEl = document.getElementById('map');
  mapEl.style.opacity = '0.6';
  mapEl.style.cursor = 'wait';

  // Use setTimeout to unblock UI (show loading state first, compute next frame)
  setTimeout(() => {
    const result = _computeRoadFilter(unitId, pinned, removed);
    window._roadFilterCache[cacheKey] = result;
    mapEl.style.opacity = '1';
    mapEl.style.cursor = '';
    if (selectedUnitId === unitId) { // Still selected?
      _renderRoads(result, unitId);
    }
  }, 20);
}

// ── Core filtering logic (reusable for precompute & on-demand) ──
function _computeRoadFilter(unitId, pinned, removed) {
  if (!removed) removed = getRemovedRoads(unitId);
  const t0 = performance.now();
  const mapping = wardUnitMapping[unitId];
  if (!mapping || !mapping.wards) return [];

  // Build ward polygon array with pre-computed bboxes (cached)
  if (!window._wardPolyCache) window._wardPolyCache = {};
  let wardPolys = window._wardPolyCache[unitId];
  if (!wardPolys) {
    const wardSet = new Set(mapping.wards);
    wardPolys = [];
    wardGeoJSON.features.forEach(f => {
      if (!f.properties.ten_xa || !wardSet.has(f.properties.ten_xa)) return;
      try {
        const feat = turf.feature(f.geometry);
        const bb = turf.bbox(feat); // [minX, minY, maxX, maxY]
        wardPolys.push({ feat, bb });
      } catch (e) { }
    });
    window._wardPolyCache[unitId] = wardPolys;
  }
  if (wardPolys.length === 0) return [];

  // Pre-filter: bbox + class
  const unitBounds = getUnitBounds(unitId);
  if (!unitBounds) return [];
  const paddedBounds = unitBounds.pad(0.05);
  const allowedClasses = ['quoc_lo', 'duong_tinh'];

  const candidates = roadsGeoJSON.features.filter(f => {
    const osmId = String(f.properties.osm_id);
    if (removed && removed.has(osmId)) return false; // user removed this segment
    if (pinned && pinned.has(osmId)) return true;
    if (!allowedClasses.includes(f.properties.road_class)) return false;
    return f.geometry.coordinates.some(([lng, lat]) => paddedBounds.contains([lat, lng]));
  });

  // Turf intersection with bbox pre-check per ward (skip ~80% of expensive calls)
  const result = candidates.filter(f => {
    if (pinned && pinned.has(String(f.properties.osm_id))) return true;
    try {
      const coords = f.geometry.coordinates;
      // Compute road bbox
      let rMinX = Infinity, rMinY = Infinity, rMaxX = -Infinity, rMaxY = -Infinity;
      for (const [x, y] of coords) {
        if (x < rMinX) rMinX = x; if (x > rMaxX) rMaxX = x;
        if (y < rMinY) rMinY = y; if (y > rMaxY) rMaxY = y;
      }
      const roadLine = turf.lineString(coords);

      for (const { feat, bb } of wardPolys) {
        // Quick bbox overlap check (skip ward if no overlap)
        if (rMaxX < bb[0] || rMinX > bb[2] || rMaxY < bb[1] || rMinY > bb[3]) continue;
        if (turf.booleanIntersects(roadLine, feat)) return true;
      }
    } catch (e) { }
    return false;
  });

  console.log(`Roads: ${result.length}/${candidates.length} (Turf) for ${unitId} in ${(performance.now() - t0).toFixed(0)}ms`);
  return result;
}

// ── Pre-compute caches for all đường bộ units (background, non-blocking) ──
function _precomputeRoadCaches() {
  if (!roadsGeoJSON || !wardUnitMapping || !wardGeoJSON) return;
  if (!window._roadFilterCache) window._roadFilterCache = {};

  const units = getActiveUnits().filter(u => u.type === 'duong_bo');
  let idx = 0;

  function processNext() {
    if (idx >= units.length) {
      console.log(`✅ Road cache precomputed for ${units.length} đường bộ units`);
      return;
    }
    const unit = units[idx++];
    const pinned = getPinnedRoads(unit.id);
    const removed = getRemovedRoads(unit.id);
    const cacheKey = unit.id + ':' + pinned.size + ':' + removed.size;
    if (!window._roadFilterCache[cacheKey]) {
      window._roadFilterCache[cacheKey] = _computeRoadFilter(unit.id, pinned, removed);
    }
    // Process next unit on next frame (non-blocking)
    setTimeout(processNext, 10);
  }

  // Start precompute after page is fully interactive
  setTimeout(processNext, 1000);
}

// ── Separated render function for cached results ──
function _renderRoads(filteredFeatures, unitId) {
  hideRoads();
  if (!filteredFeatures || filteredFeatures.length === 0) return;
  showRoadLegend();

  // Draw roads ordered by importance (nội thị first, đường tỉnh, quốc lộ on top)
  const order = ['noi_thi', 'duong_tinh', 'quoc_lo'];
  const sorted = [...filteredFeatures].sort((a, b) => {
    return order.indexOf(a.properties.road_class) - order.indexOf(b.properties.road_class);
  });

  roadLayer = L.layerGroup();

  // Normalize road name for dedup (strip prefix "Đường", "Phố", etc.)
  const normalizeRoadName = (n) => n.replace(/^(Đường|Phố|đường|phố)\s+/i, '').trim();

  // Find the longest segment per unique road name (for label placement)
  const labeledNames = new Set();
  const segmentsByName = {};
  sorted.forEach(feature => {
    const name = feature.properties.ref || feature.properties.name || '';
    if (!name) return;
    const key = normalizeRoadName(name);
    const coords = feature.geometry.coordinates;
    const len = coords.reduce((sum, c, i) => {
      if (i === 0) return 0;
      const [x1, y1] = coords[i - 1];
      const [x2, y2] = c;
      return sum + Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }, 0);
    if (!segmentsByName[key] || len > segmentsByName[key].len) {
      segmentsByName[key] = { id: feature.properties.osm_id, name, len };
    }
  });

  sorted.forEach(feature => {
    const style = ROAD_STYLES[feature.properties.road_class];
    if (!style) return;

    const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    // White outline for contrast
    const outline = L.polyline(coords, {
      color: '#FFFFFF',
      weight: style.weight + 2,
      opacity: 0.5,
      interactive: false,
      pane: 'roadPane'
    });
    roadLayer.addLayer(outline);

    // Colored road line
    const osmId = String(feature.properties.osm_id);
    const isPinned = getPinnedRoads(unitId).has(osmId);
    const line = L.polyline(coords, {
      color: style.color,
      weight: style.weight,
      opacity: style.opacity,
      lineCap: 'round',
      lineJoin: 'round',
      pane: 'roadPane'
    });

    // Only add ONE permanent label per unique road name (on longest segment)
    // Skip infrastructure labels (bridges, roundabouts, tunnels, overpasses)
    const name = feature.properties.ref || feature.properties.name || '';
    const skipKeywords = ['cầu', 'vòng xuyến', 'bùng binh', 'hầm chui', 'cầu vượt', 'bùng bình'];
    const nameLower = name.toLowerCase();
    const isInfra = skipKeywords.some(kw => nameLower.includes(kw));
    if (name && !isInfra) {
      const key = normalizeRoadName(name);
      if (!labeledNames.has(key) && segmentsByName[key] && segmentsByName[key].id === feature.properties.osm_id) {
        line.bindTooltip(segmentsByName[key].name, {
          permanent: true,
          direction: 'center',
          className: 'road-label road-label-' + feature.properties.road_class
        });
        labeledNames.add(key);
      }
    }

    // Popup for every segment: show info + remove option
    const pinLabel = isPinned ? ' 📌' : '';
    const displayName = name || '(không tên)';
    const removeAction = isPinned
      ? `unpinRoad('${osmId}')`
      : `removeRoad('${osmId}')`;
    line.bindPopup(`<b>${displayName}${pinLabel}</b><br>Loại: ${style.label}<br>OSM ID: ${osmId}<br><button onclick="${removeAction}">❌ Bỏ tuyến này</button>`, { closeOnClick: false });

    roadLayer.addLayer(line);
  });

  roadLayer.addTo(map);
}

function hideRoads() {
  if (roadLayer) {
    map.removeLayer(roadLayer);
    roadLayer = null;
  }
  if (candidateRoadLayer) {
    map.removeLayer(candidateRoadLayer);
    candidateRoadLayer = null;
  }
  addRoadMode = false;
  hideRoadLegend();
}

// ──────────────────────────────────────────────
// Waterway Display (đường thuỷ units)
// ──────────────────────────────────────────────
const WATERWAY_STYLES = {
  river: { color: '#1565C0', weight: 6, opacity: 0.85 },
  canal: { color: '#0288D1', weight: 4, opacity: 0.8 },
  tidal_channel: { color: '#0097A7', weight: 4, opacity: 0.8 }
};

// Clip a polyline (array of [lat,lng]) to keep only the longest contiguous
// run of coordinates within the given L.latLngBounds. Adds interpolated
// entry/exit points at the bounds edge for clean clipping.
function clipPolylineToBounds(coords, bounds) {
  if (!bounds || coords.length < 2) return coords;

  // Split into contiguous runs of inside-bounds coordinates
  const runs = [];
  let currentRun = [];

  for (let i = 0; i < coords.length; i++) {
    const inside = bounds.contains(coords[i]);
    if (inside) {
      // If starting a new run and previous point was outside, interpolate entry
      if (currentRun.length === 0 && i > 0) {
        const entry = interpolateEdge(coords[i - 1], coords[i], bounds);
        if (entry) currentRun.push(entry);
      }
      currentRun.push(coords[i]);
    } else {
      if (currentRun.length > 0) {
        // Interpolate exit point
        const exit = interpolateEdge(coords[i], coords[i - 1], bounds);
        if (exit) currentRun.push(exit);
        runs.push(currentRun);
        currentRun = [];
      }
    }
  }
  if (currentRun.length > 0) runs.push(currentRun);

  if (runs.length === 0) return [];

  // Return the longest run
  let longest = runs[0];
  for (const run of runs) {
    if (run.length > longest.length) longest = run;
  }
  return longest;
}

// Interpolate between outside point and inside point to find approximate bounds crossing
function interpolateEdge(outside, inside, bounds) {
  // Simple linear interpolation — find t where line crosses bounds
  const [lat1, lng1] = outside;
  const [lat2, lng2] = inside;
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  let bestT = 0;
  // Check each edge
  const edges = [
    { axis: 0, val: sw.lat }, // south
    { axis: 0, val: ne.lat }, // north
    { axis: 1, val: sw.lng }, // west
    { axis: 1, val: ne.lng }, // east
  ];
  for (const edge of edges) {
    const from = edge.axis === 0 ? lat1 : lng1;
    const to = edge.axis === 0 ? lat2 : lng2;
    const denom = to - from;
    if (Math.abs(denom) < 1e-10) continue;
    const t = (edge.val - from) / denom;
    if (t > 0 && t < 1 && t > bestT) {
      const ptLat = lat1 + t * (lat2 - lat1);
      const ptLng = lng1 + t * (lng2 - lng1);
      if (ptLat >= sw.lat - 0.001 && ptLat <= ne.lat + 0.001 &&
        ptLng >= sw.lng - 0.001 && ptLng <= ne.lng + 0.001) {
        bestT = t;
      }
    }
  }
  if (bestT > 0) {
    return [lat1 + bestT * (lat2 - lat1), lng1 + bestT * (lng2 - lng1)];
  }
  return null;
}

function showWaterways(unitId) {
  hideWaterways();
  if (!waterwaysGeoJSON) return;


  // Get waterway names for this unit
  let mapping = waterwayUnitMapping ? waterwayUnitMapping[unitId] : null;
  if (!mapping && waterwayUnitMapping && waterwayUnitMapping._quyhoach) {
    mapping = waterwayUnitMapping._quyhoach[unitId];
  }
  const allowedNames = new Set(mapping && mapping.waterways ? mapping.waterways : []);
  const pinned = getPinnedWaterways(unitId);
  const removed = getRemovedWaterways(unitId);

  // Filter: (name-matched OR pinned) AND NOT removed
  const filtered = waterwaysGeoJSON.features.filter(f => {
    const osm = String(f.properties.osm_id);
    if (removed.has(osm)) return false; // user removed this segment
    if (pinned.has(osm)) return true;
    const name = f.properties.name || '';
    return allowedNames.has(name);
  });

  if (filtered.length === 0) {
    console.log(`No waterway features for unit ${unitId}`);
    showWaterwayLegend();
    return;
  }

  console.log(`Waterways: ${filtered.length} segments for unit ${unitId}`);

  waterwayLayer = L.layerGroup();

  // Find longest segment per unique name for label
  const segmentsByName = {};
  filtered.forEach(f => {
    const name = f.properties.name;
    if (!name) return;
    const coords = f.geometry.coordinates;
    const len = coords.reduce((sum, c, i) => {
      if (i === 0) return 0;
      const [x1, y1] = coords[i - 1];
      const [x2, y2] = c;
      return sum + Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }, 0);
    if (!segmentsByName[name] || len > segmentsByName[name].len) {
      segmentsByName[name] = { id: f.properties.osm_id, len };
    }
  });

  const labeledNames = new Set();

  filtered.forEach(f => {
    const wwType = f.properties.waterway_type || 'river';
    const style = WATERWAY_STYLES[wwType] || WATERWAY_STYLES.river;
    const coords = f.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    const name = f.properties.name || '';
    const osmId = String(f.properties.osm_id);
    const isPinned = pinned.has(osmId);

    // White outline
    const outline = L.polyline(coords, {
      color: '#FFFFFF', weight: style.weight + 2, opacity: 0.4, interactive: false, pane: 'waterwayPane'
    });
    waterwayLayer.addLayer(outline);

    if (addWaterwayMode) {
      // ── EDIT MODE: selected segments are green, click to remove ──
      const line = L.polyline(coords, {
        color: '#2E7D32',
        weight: style.weight + 1, opacity: 0.85,
        lineCap: 'round', lineJoin: 'round',
        pane: 'waterwayPane',
        className: 'ww-segment-selected'
      });

      const displayName = name || 'Không tên';
      line.bindTooltip(`✅ ${displayName} — click để bỏ`, { sticky: true });

      line.on('click', () => {
        if (isPinned) {
          unpinWaterway(osmId);
        } else {
          removeWaterway(osmId);
        }
        if (addWaterwayMode) showCandidateWaterways();
      });

      // Label on longest segment
      if (name && !labeledNames.has(name) && segmentsByName[name] && segmentsByName[name].id === f.properties.osm_id) {
        labeledNames.add(name);
      }

      waterwayLayer.addLayer(line);
    } else {
      // ── NORMAL MODE: blue waterway with popup ──
      const line = L.polyline(coords, {
        color: style.color,
        weight: style.weight, opacity: style.opacity,
        lineCap: 'round', lineJoin: 'round',
        dashArray: wwType === 'canal' ? '8 4' : null,
        pane: 'waterwayPane'
      });

      // Label on longest segment
      if (name && !labeledNames.has(name) && segmentsByName[name] && segmentsByName[name].id === f.properties.osm_id) {
        line.bindTooltip(name, {
          permanent: true, direction: 'center',
          className: 'waterway-label'
        });
        labeledNames.add(name);
      }

      const pinLabel = isPinned ? ' 📌' : '';
      const displayName = name || 'Không tên';
      const removeAction = isPinned
        ? `unpinWaterway('${osmId}')`
        : `removeWaterway('${osmId}')`;
      line.bindPopup(`<b>${displayName}${pinLabel}</b><br>Loại: ${wwType}<br>OSM ID: ${osmId}<br><button onclick="${removeAction}">❌ Bỏ tuyến này</button>`, { closeOnClick: false });
      waterwayLayer.addLayer(line);
    }
  });

  waterwayLayer.addTo(map);
  showWaterwayLegend();
}

function hideWaterways() {
  if (waterwayLayer) {
    map.removeLayer(waterwayLayer);
    waterwayLayer = null;
  }
  if (candidateWaterwayLayer) {
    map.removeLayer(candidateWaterwayLayer);
    candidateWaterwayLayer = null;
  }
  addWaterwayMode = false;
  hideWaterwayLegend();
}

function showWaterwayLegend() {
  let legend = document.getElementById('waterway-legend');
  if (!legend) {
    legend = document.createElement('div');
    legend.id = 'waterway-legend';
    legend.className = 'road-legend';
    document.getElementById('map').appendChild(legend);
  }

  if (addWaterwayMode) {
    legend.innerHTML = `
      <div class="road-legend-title">✏️ Chỉnh sửa tuyến</div>
      <div class="road-legend-item"><span class="road-legend-line" style="background:#2E7D32;height:4px"></span> Đã chọn (click để bỏ)</div>
      <div class="road-legend-item"><span class="road-legend-line" style="background:#78909C;height:3px;border-style:dashed"></span> Chưa chọn (click để thêm)</div>
      <div class="road-legend-item"><span class="road-legend-line" style="background:#E53935;height:3px;border-style:dashed"></span> Đã bỏ (click để thêm lại)</div>
    `;
  } else {
    legend.innerHTML = `
      <div class="road-legend-title">GHI CHÚ</div>
      <div class="road-legend-item"><span class="road-legend-line" style="background:#1565C0;height:4px"></span> Sông</div>
      <div class="road-legend-item"><span style="font-size:16px;width:20px;text-align:center">📍</span> Trụ sở</div>
    `;
  }
  legend.style.display = 'block';
}

function hideWaterwayLegend() {
  const legend = document.getElementById('waterway-legend');
  if (legend) legend.style.display = 'none';
}



function showCandidateWaterways() {
  if (!selectedUnitId || !waterwaysGeoJSON) return;
  if (candidateWaterwayLayer) {
    map.removeLayer(candidateWaterwayLayer);
  }
  candidateWaterwayLayer = L.layerGroup();

  const pinned = getPinnedWaterways(selectedUnitId);
  const removed = getRemovedWaterways(selectedUnitId);

  // Get names already assigned to this unit
  let mapping = waterwayUnitMapping ? waterwayUnitMapping[selectedUnitId] : null;
  if (!mapping && waterwayUnitMapping && waterwayUnitMapping._quyhoach) {
    mapping = waterwayUnitMapping._quyhoach[selectedUnitId];
  }
  const assignedNames = new Set(mapping && mapping.waterways ? mapping.waterways : []);

  // Show candidate segments: not currently displayed (not pinned AND not in active mapping, OR was removed)
  const candidates = waterwaysGeoJSON.features.filter(f => {
    const osmId = String(f.properties.osm_id);
    // If removed by user → show as candidate (so they can re-add)
    if (removed.has(osmId)) return true;
    if (pinned.has(osmId)) return false; // already pinned & displayed
    const name = f.properties.name || '';
    if (assignedNames.has(name)) return false; // already assigned by mapping & displayed
    return true;
  });

  candidates.forEach(feature => {
    const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const name = feature.properties.name || '(không tên)';
    const osmId = String(feature.properties.osm_id);
    const wasRemoved = removed.has(osmId);

    const line = L.polyline(coords, {
      color: wasRemoved ? '#E53935' : '#78909C',
      weight: wasRemoved ? 4 : 3,
      opacity: wasRemoved ? 0.7 : 0.5,
      dashArray: '6 4',
      interactive: true,
      pane: 'candidatePane',
      className: 'ww-segment-candidate'
    });

    line.bindTooltip(
      wasRemoved ? `🔄 ${name} — click để thêm lại` : `➕ ${name} — click để thêm`,
      { sticky: true }
    );

    line.on('click', () => {
      // If was removed from mapping → un-remove it
      if (wasRemoved) {
        const r = getRemovedWaterways(selectedUnitId);
        r.delete(osmId);
        saveRemovedWaterways(selectedUnitId, r);
      } else {
        // New pin
        const p = getPinnedWaterways(selectedUnitId);
        p.add(osmId);
        savePinnedWaterways(selectedUnitId, p);
      }
      // Refresh everything
      showWaterways(selectedUnitId);
      showCandidateWaterways();
      showEditToast(`✅ Đã thêm: ${name}`);
    });

    candidateWaterwayLayer.addLayer(line);
  });

  candidateWaterwayLayer.addTo(map);
  // Bring layers to front for clickability
  candidateWaterwayLayer.eachLayer(l => { if (l.bringToFront) l.bringToFront(); });
  if (waterwayLayer) waterwayLayer.eachLayer(l => { if (l.bringToFront) l.bringToFront(); });
  console.log(`Candidate waterways: ${candidates.length} available for pinning`);
}

function unpinWaterway(osmId) {
  if (!selectedUnitId) return;
  const p = getPinnedWaterways(selectedUnitId);
  p.delete(osmId);
  savePinnedWaterways(selectedUnitId, p);
  map.closePopup();
  showWaterways(selectedUnitId);
  if (addWaterwayMode) showCandidateWaterways();
}

// Remove a waterway segment from official mapping (store in removed list)
function removeWaterway(osmId) {
  if (!selectedUnitId) return;
  // If it's pinned, just unpin
  const p = getPinnedWaterways(selectedUnitId);
  if (p.has(osmId)) {
    p.delete(osmId);
    savePinnedWaterways(selectedUnitId, p);
  } else {
    // Official mapping → add to removed set
    const r = getRemovedWaterways(selectedUnitId);
    r.add(osmId);
    saveRemovedWaterways(selectedUnitId, r);
  }
  map.closePopup();
  showWaterways(selectedUnitId);
  if (addWaterwayMode) showCandidateWaterways();
}

function getUnitBounds(unitId) {
  const mapping = wardUnitMapping ? wardUnitMapping[unitId] : null;
  if (!mapping || !mapping.wards || mapping.wards.length === 0) return null;

  const bounds = L.latLngBounds();
  let found = false;

  // Bạch Long Vĩ island is at lat ~20.13 — exclude from bounds to prevent
  // extreme zoom-out for units like ĐB4 (current) and ĐB3 (planned)
  const MIN_MAINLAND_LAT = 20.4;

  wardLayer.eachLayer(layer => {
    const wardName = getWardName(layer.feature);
    const normalized = normalizeWardName(wardName);
    const unitWards = mapping.wards.map(w => normalizeWardName(w));
    if (unitWards.includes(normalized)) {
      const center = layer.getBounds().getCenter();
      // Skip offshore islands (Bạch Long Vĩ)
      if (center.lat < MIN_MAINLAND_LAT) return;
      bounds.extend(layer.getBounds());
      found = true;
    }
  });

  return found && bounds.isValid() ? bounds : null;
}

// ──────────────────────────────────────────────
// Road Legend
// ──────────────────────────────────────────────
function showRoadLegend() {
  hideRoadLegend();
  const legend = document.createElement('div');
  legend.id = 'road-legend';
  legend.className = 'road-legend';
  // Only show quoc_lo and duong_tinh in legend (not noi_thi by default)
  const visibleStyles = Object.entries(ROAD_STYLES).filter(([k]) => k !== 'noi_thi');
  legend.innerHTML = `
    <div class="road-legend-title">GHI CHÚ</div>
    ${visibleStyles.map(([key, s]) => `
      <div class="road-legend-item">
        <span class="road-legend-line" style="background:${s.color}; height:${Math.max(2, s.weight - 1)}px"></span>
        <span>${s.label}</span>
      </div>
    `).join('')}
    <div class="road-legend-item"><span style="font-size:16px;width:20px;text-align:center">📍</span> Trụ sở</div>
  `;
  document.getElementById('map-container').appendChild(legend);
}

function hideRoadLegend() {
  const existing = document.getElementById('road-legend');
  if (existing) existing.remove();
}

// ──────────────────────────────────────────────
// Add Road Mode — manual road selection
// ──────────────────────────────────────────────
function toggleAddRoadMode() {
  addRoadMode = !addRoadMode;
  const btn = document.getElementById('btn-add-road');
  if (btn) {
    btn.classList.toggle('active', addRoadMode);
    btn.textContent = addRoadMode ? '✕ Đóng chỉnh sửa' : '✏️ Chỉnh sửa tuyến';
  }
  // Toggle ward layer interactivity to prevent blocking road clicks
  if (wardLayer) {
    wardLayer.eachLayer(l => {
      if (l.setStyle) l.setStyle({ interactive: !addRoadMode });
      if (addRoadMode) {
        l.closePopup();
        l.closeTooltip();
      }
    });
  }
  if (addRoadMode) {
    showCandidateRoads();
  } else {
    if (candidateRoadLayer) {
      map.removeLayer(candidateRoadLayer);
      candidateRoadLayer = null;
    }
    // Refresh main roads
    if (selectedUnitId) showRoads(selectedUnitId);
  }
}

function showCandidateRoads() {
  if (!selectedUnitId || !roadsGeoJSON) return;
  if (candidateRoadLayer) {
    map.removeLayer(candidateRoadLayer);
  }
  candidateRoadLayer = L.layerGroup();

  const pinned = getPinnedRoads(selectedUnitId);
  const removed = getRemovedRoads(selectedUnitId);
  const unitBounds = getUnitBounds(selectedUnitId);
  if (!unitBounds) return;

  // Expand bounds by ~50% to show nearby roads outside strict boundary
  const expandedBounds = unitBounds.pad(0.5);

  // Build set of currently displayed osm_ids (to exclude from candidates)
  const currentlyDisplayed = new Set();
  if (window._roadFilterCache) {
    const cacheKey = selectedUnitId + ':' + pinned.size + ':' + removed.size;
    const cached = window._roadFilterCache[cacheKey];
    if (cached) cached.forEach(f => currentlyDisplayed.add(String(f.properties.osm_id)));
  }

  // Show quốc lộ + tỉnh lộ NOT already displayed as candidates (NO nội thị)
  const allowedCandidateClasses = ['quoc_lo', 'duong_tinh'];
  const candidates = roadsGeoJSON.features.filter(f => {
    const osmId = String(f.properties.osm_id);
    // Removed by user → show as candidate (red, can re-add)
    if (removed.has(osmId)) return true;
    // Already displayed → skip
    if (currentlyDisplayed.has(osmId)) return false;
    if (pinned.has(osmId)) return false;
    // Only quốc lộ + tỉnh lộ
    if (!allowedCandidateClasses.includes(f.properties.road_class)) return false;
    const coords = f.geometry.coordinates;
    return coords.some(([lng, lat]) => expandedBounds.contains([lat, lng]));
  });

  candidates.forEach(feature => {
    const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const name = feature.properties.name || feature.properties.ref || '(không tên)';
    const osmId = String(feature.properties.osm_id);
    const wasRemoved = removed.has(osmId);

    const roadClass = feature.properties.road_class || 'noi_thi';
    const classStyle = ROAD_STYLES[roadClass] || ROAD_STYLES.noi_thi;
    const line = L.polyline(coords, {
      color: wasRemoved ? '#E53935' : classStyle.color,
      weight: 8,
      opacity: 0.7,
      dashArray: '10 6',
      interactive: true,
      pane: 'candidatePane'
    });

    line.bindTooltip(`📌 Click để thêm: ${name}${wasRemoved ? ' (đã bỏ)' : ''}`, { sticky: true });

    line.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      if (wasRemoved) {
        const r = getRemovedRoads(selectedUnitId);
        r.delete(osmId);
        saveRemovedRoads(selectedUnitId, r);
      } else {
        const p = getPinnedRoads(selectedUnitId);
        p.add(osmId);
        savePinnedRoads(selectedUnitId, p);
      }
      // Invalidate cache
      _invalidateRoadCache(selectedUnitId);
      // Instantly remove from candidate layer (no full rebuild)
      if (candidateRoadLayer) candidateRoadLayer.removeLayer(line);
      // Add to main road layer with proper style
      if (roadLayer) {
        const mainLine = L.polyline(coords, {
          color: classStyle.color, weight: classStyle.weight,
          opacity: classStyle.opacity, lineCap: 'round', lineJoin: 'round'
        });
        mainLine.bindPopup(`<b>${name} 📌</b><br>Loại: ${roadClass}<br>OSM ID: ${osmId}<br><button onclick="unpinRoad('${osmId}')">❌ Bỏ tuyến này</button>`, { closeOnClick: false });
        roadLayer.addLayer(mainLine);
      }
      showEditToast(`✅ Đã thêm: ${name}`);
      console.log(`${wasRemoved ? 'Restored' : 'Pinned'} road: ${name} (${osmId})`);
    });

    candidateRoadLayer.addLayer(line);
  });

  candidateRoadLayer.addTo(map);
  // Bring candidate layer to front so it's clickable above ward polygons
  candidateRoadLayer.eachLayer(l => { if (l.bringToFront) l.bringToFront(); });
  // Also bring main road layer to front
  if (roadLayer) roadLayer.eachLayer(l => { if (l.bringToFront) l.bringToFront(); });
  console.log(`Candidate roads: ${candidates.length} available for editing`);
}

function showCandidateWaterways() {
  if (!selectedUnitId || !waterwaysGeoJSON) return;
  if (candidateWaterwayLayer) {
    map.removeLayer(candidateWaterwayLayer);
  }
  candidateWaterwayLayer = L.layerGroup();

  const pinned = getPinnedWaterways(selectedUnitId);
  const removed = getRemovedWaterways(selectedUnitId);
  const mapping = waterwayUnitMapping ? waterwayUnitMapping[selectedUnitId] : null;
  const allowedNames = new Set(mapping && mapping.waterways ? mapping.waterways : []);

  // Get unit bounds — for waterway units, use waterway extent as fallback
  let unitBounds = getUnitBounds(selectedUnitId);
  if (!unitBounds && waterwayLayer) {
    const bounds = L.latLngBounds();
    waterwayLayer.eachLayer(l => {
      if (l.getBounds) bounds.extend(l.getBounds());
    });
    if (bounds.isValid()) unitBounds = bounds;
  }
  const expandedBounds = unitBounds ? unitBounds.pad(0.3) : null;

  // Track currently displayed waterway osm_ids
  const currentlyDisplayed = new Set();
  if (waterwaysGeoJSON && mapping) {
    // Rebuild from source data: features matching allowed names or pinned
    waterwaysGeoJSON.features.forEach(f => {
      const osm = String(f.properties.osm_id);
      if (removed.has(osm)) return;
      if (pinned.has(osm) || allowedNames.has(f.properties.name || '')) {
        currentlyDisplayed.add(osm);
      }
    });
  }

  const candidates = waterwaysGeoJSON.features.filter(f => {
    const osmId = String(f.properties.osm_id);
    if (removed.has(osmId)) return true; // show removed as re-addable
    if (currentlyDisplayed.has(osmId)) return false;
    if (pinned.has(osmId)) return false;
    // Proximity filter
    if (!expandedBounds) return false;
    const coords = f.geometry.coordinates;
    return coords.some(([lng, lat]) => expandedBounds.contains([lat, lng]));
  });

  candidates.forEach(feature => {
    const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const name = feature.properties.name || '(không tên)';
    const osmId = String(feature.properties.osm_id);
    const wasRemoved = removed.has(osmId);

    const line = L.polyline(coords, {
      color: wasRemoved ? '#E53935' : '#00BCD4',
      weight: 8,
      opacity: 0.7,
      dashArray: '10 6',
      interactive: true,
      pane: 'candidatePane'
    });

    line.bindTooltip(`📌 Click để thêm: ${name}${wasRemoved ? ' (đã bỏ)' : ''}`, { sticky: true });

    line.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      if (wasRemoved) {
        const r = getRemovedWaterways(selectedUnitId);
        r.delete(osmId);
        saveRemovedWaterways(selectedUnitId, r);
      } else {
        const p = getPinnedWaterways(selectedUnitId);
        p.add(osmId);
        savePinnedWaterways(selectedUnitId, p);
      }
      // Instantly remove from candidate layer (no full rebuild)
      if (candidateWaterwayLayer) candidateWaterwayLayer.removeLayer(line);
      // Add to main waterway layer with proper style
      if (waterwayLayer) {
        const wwType = feature.properties.waterway_type || 'river';
        const style = WATERWAY_STYLES[wwType] || WATERWAY_STYLES.river;
        const mainLine = L.polyline(coords, {
          color: style.color, weight: style.weight,
          opacity: style.opacity, lineCap: 'round', lineJoin: 'round',
          dashArray: wwType === 'canal' ? '8 4' : null,
          pane: 'waterwayPane'
        });
        mainLine.bindPopup(`<b>${name} 📌</b><br>Loại: ${wwType}<br>OSM ID: ${osmId}<br><button onclick="unpinWaterway('${osmId}')">❌ Bỏ tuyến này</button>`, { closeOnClick: false });
        waterwayLayer.addLayer(mainLine);
      }
      showEditToast(`✅ Đã thêm: ${name}`);
      console.log(`${wasRemoved ? 'Restored' : 'Pinned'} waterway: ${name} (${osmId})`);
    });

    candidateWaterwayLayer.addLayer(line);
  });

  candidateWaterwayLayer.addTo(map);
  console.log(`Candidate waterways: ${candidates.length} available for editing`);
}

function unpinRoad(osmId) {
  if (!selectedUnitId) return;
  const p = getPinnedRoads(selectedUnitId);
  p.delete(osmId);
  savePinnedRoads(selectedUnitId, p);
  map.closePopup();
  _invalidateRoadCache(selectedUnitId);
  showRoads(selectedUnitId);
  if (addRoadMode) showCandidateRoads();
}

// Remove a road segment from official mapping (store in removed list)
function removeRoad(osmId) {
  if (!selectedUnitId) return;
  // If it's pinned, just unpin
  const p = getPinnedRoads(selectedUnitId);
  if (p.has(osmId)) {
    p.delete(osmId);
    savePinnedRoads(selectedUnitId, p);
  } else {
    // Official mapping → add to removed set
    const r = getRemovedRoads(selectedUnitId);
    r.add(osmId);
    saveRemovedRoads(selectedUnitId, r);
  }
  map.closePopup();
  _invalidateRoadCache(selectedUnitId);
  showRoads(selectedUnitId);
  if (addRoadMode) showCandidateRoads();
}

// Invalidate road cache for a unit (after pin/remove changes)
function _invalidateRoadCache(unitId) {
  if (!window._roadFilterCache) return;
  // Remove all cache entries for this unit
  const keysToDelete = Object.keys(window._roadFilterCache).filter(k => k.startsWith(unitId + ':'));
  keysToDelete.forEach(k => delete window._roadFilterCache[k]);
}

// Restyle ward polygons in-place without rebuilding labels
function refreshWardStyles() {
  if (!wardLayer) return;
  wardLayer.eachLayer(layer => {
    if (layer.feature) {
      layer.setStyle(wardStyle(layer.feature));
    }
  });
}

function zoomToUnit(unitId) {
  const units = getActiveUnits();
  const unit = units.find(u => u.id === unitId);
  if (!unit) return;

  // Văn phòng: zoom to HQ if available, else center
  if (unit.type === 'van_phong') {
    // Zoom out to see the entire city (all HQs will be visible)
    map.setView(HP_CENTER, HP_ZOOM, { animate: true });
    return;
  }

  // Đường thuỷ: fit to waterway routes (no wards to zoom to)
  if (unit.type === 'duong_thuy') {
    const mapping = wardUnitMapping ? wardUnitMapping[unitId] : null;
    if (mapping && mapping.routes && mapping.routes.length > 0) {
      const bounds = getUnitBounds(unitId);
      if (bounds) {
        fitBoundsConstrained(bounds);
      } else {
        map.setView(HP_CENTER, 11, { animate: true });
      }
    }
    return;
  }

  // Đường bộ: fit to ward jurisdiction area
  const bounds = getUnitBounds(unitId);
  if (bounds) {
    fitBoundsConstrained(bounds);

    // Đặc biệt cho Đội 5 theo yêu cầu: tăng mức zoom sau khi fit lên 11
    if (unitId === 'db5') {
      setTimeout(() => {
        map.setView(bounds.getCenter(), 11, { animate: true });
      }, 500);
    }
  }
}

/** fitBounds with min zoom = 10, max zoom = 13
 *  Offset center to account for sidebar (left) and info panel (right) */
function fitBoundsConstrained(bounds) {
  // Sidebar ~240px on left, info panel ~400px on right
  // paddingTopLeft = [left, top], paddingBottomRight = [right, bottom]
  map.fitBounds(bounds, {
    paddingTopLeft: [40, 40],
    paddingBottomRight: [420, 40],
    maxZoom: 13,
    animate: true
  });
  // Prevent zooming out too far for units with large/spread-out territory
  setTimeout(() => {
    if (map.getZoom() < 10) {
      map.setView(bounds.getCenter(), 10, { animate: true });
    }
  }, 350);
}

// ──────────────────────────────────────────────
// Info Panel
// ──────────────────────────────────────────────
function showInfoPanel(unit) {
  const panel = document.getElementById('info-panel');
  const title = document.getElementById('info-panel-title');
  const body = document.getElementById('info-panel-body');

  title.textContent = unit.name;

  const mapping = wardUnitMapping ? wardUnitMapping[unit.id] : null;
  const wwMapping = waterwayUnitMapping ? (waterwayUnitMapping[unit.id] || (waterwayUnitMapping._quyhoach ? waterwayUnitMapping._quyhoach[unit.id] : null)) : null;
  const demographics = calculateUnitDemographics(unit.id);
  const wardCount = mapping && mapping.wards ? mapping.wards.length : 0;
  const routeCount = mapping && mapping.routes ? mapping.routes.length : 0;
  const totalKm = (wwMapping && wwMapping.totalKm) || (mapping && mapping.totalKm) || 0;
  const totalArea = demographics ? demographics.totalArea : 0;
  const totalPop = demographics ? demographics.totalPop : 0;
  const overrides = getUnitOverrides(unit.id);
  const hqs = getUnitHqs(unit.id);

  // ── Type badge ──
  const typeBadges = {
    van_phong: { label: 'Văn phòng', cls: 'van-phong', icon: '🏢' },
    duong_bo: { label: 'Đường bộ', cls: 'duong-bo', icon: '🛣️' },
    duong_thuy: { label: 'Đường thuỷ', cls: 'duong-thuy', icon: '🚢' }
  };
  const badge = typeBadges[unit.type] || typeBadges.van_phong;

  let html = '';

  // ── TYPE BADGE + COLOR DOT ──
  html += `<div class="ip-type-row">
    <span class="ip-dot" style="background:${unit.color}"></span>
    <span class="unit-type-badge ${badge.cls}">${badge.icon} ${badge.label}</span>
  </div>`;

  // ── STATS GRID — tailored per unit type ──
  html += '<div class="ip-stats-grid">';

  // Biên chế (all types)
  if (unit.personnel) {
    html += `<div class="ip-stat-card">
      <div class="ip-stat-number">${unit.personnel}</div>
      <div class="ip-stat-label">Quân số</div>
    </div>`;
  }

  if (unit.type === 'duong_bo') {
    // Đường bộ: địa bàn, diện tích, dân số, km tuyến
    if (wardCount > 0) {
      html += `<div class="ip-stat-card">
        <div class="ip-stat-number">${wardCount}</div>
        <div class="ip-stat-label">Địa bàn</div>
      </div>`;
    }
    if (totalKm > 0) {
      html += `<div class="ip-stat-card">
        <div class="ip-stat-number">${totalKm.toLocaleString('vi-VN')}</div>
        <div class="ip-stat-label">km tuyến</div>
      </div>`;
    }
    if (totalArea > 0) {
      html += `<div class="ip-stat-card">
        <div class="ip-stat-number">${totalArea.toFixed(0)}</div>
        <div class="ip-stat-label">km²</div>
      </div>`;
    }
    if (totalPop > 0) {
      html += `<div class="ip-stat-card">
        <div class="ip-stat-number">${totalPop.toLocaleString('vi-VN')}</div>
        <div class="ip-stat-label">Dân số</div>
      </div>`;
    }
  } else if (unit.type === 'duong_thuy') {
    // Đường thuỷ: tuyến sông, tổng km
    if (routeCount > 0) {
      html += `<div class="ip-stat-card">
        <div class="ip-stat-number">${routeCount}</div>
        <div class="ip-stat-label">Tuyến sông</div>
      </div>`;
    }
    if (totalKm > 0) {
      html += `<div class="ip-stat-card">
        <div class="ip-stat-number">${totalKm}</div>
        <div class="ip-stat-label">km tuyến</div>
      </div>`;
    }
  } else {
    // Văn phòng: chỉ quân số (already added above)
  }

  html += '</div>';

  // ── ĐỊA CHỈ ĐƠN VỊ ──
  if (hqs.length > 0) {
    const label = hqs.length > 1 ? `📍 ĐỊA CHỈ ĐƠN VỊ (${hqs.length} trụ sở)` : '📍 ĐỊA CHỈ ĐƠN VỊ';
    html += `<div class="ip-detail-section">
      <div class="ip-detail-label">${label}</div>
      ${hqs.map((hq, i) => {
      const addr = hq.name && hq.name !== 'Chưa cập nhật' ? hq.name : null;
      const prefix = hqs.length > 1 ? `<strong>Trụ sở ${i + 1}:</strong> ` : '';
      return `<div class="ip-detail-value">${prefix}${addr || '<span class="ip-na">Chưa cập nhật</span>'}</div>`;
    }).join('')}
    </div>`;
  } else {
    html += `<div class="ip-detail-section">
      <div class="ip-detail-label">📍 ĐỊA CHỈ ĐƠN VỊ</div>
      <div class="ip-detail-value"><span class="ip-na">Chưa cập nhật</span></div>
    </div>`;
  }

  // ── Content sections tailored by type ──
  if (unit.type === 'duong_bo') {
    // TUYẾN ĐƯỜNG
    if (routeCount > 0) {
      html += `<div class="ip-detail-section">
        <div class="ip-detail-label">🛣️ TUYẾN ĐƯỜNG (${routeCount} tuyến)</div>
        <ul class="ip-route-list">
          ${mapping.routes.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>`;
    }
    // ĐỊA BÀN
    if (wardCount > 0) {
      html += `<div class="ip-detail-section">
        <div class="ip-detail-label">🏘️ ĐỊA BÀN (${wardCount} xã/phường)</div>
        <div class="ip-ward-tags">
          ${mapping.wards.map(w => `<span class="ip-ward-tag">${w}</span>`).join('')}
        </div>
      </div>`;
    }

  } else if (unit.type === 'duong_thuy') {
    // TUYẾN SÔNG
    if (routeCount > 0) {
      html += `<div class="ip-detail-section">
        <div class="ip-detail-label">🚢 TUYẾN SÔNG (${routeCount} tuyến${totalKm > 0 ? ' — ' + totalKm + ' km' : ''})</div>
        <ul class="ip-route-list">
          ${mapping.routes.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>`;
    }
    // Đường thuỷ có thể có wards (hiện tại = 0)
    if (wardCount > 0) {
      html += `<div class="ip-detail-section">
        <div class="ip-detail-label">🏘️ ĐỊA BÀN (${wardCount} xã/phường)</div>
        <div class="ip-ward-tags">
          ${mapping.wards.map(w => `<span class="ip-ward-tag">${w}</span>`).join('')}
        </div>
      </div>`;
    }
  } else {
    // VĂN PHÒNG — simpler layout
    if (wardCount > 0) {
      html += `<div class="ip-detail-section">
        <div class="ip-detail-label">🏘️ ĐỊA BÀN (${wardCount} xã/phường)</div>
        <div class="ip-ward-tags">
          ${mapping.wards.map(w => `<span class="ip-ward-tag">${w}</span>`).join('')}
        </div>
      </div>`;
    }
    if (routeCount > 0) {
      html += `<div class="ip-detail-section">
        <div class="ip-detail-label">📋 NHIỆM VỤ (${routeCount} mục)</div>
        <ul class="ip-route-list">
          ${mapping.routes.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>`;
    }
  }

  body.innerHTML = html;
  panel.classList.remove('hidden');
}

function hideInfoPanel() {
  document.getElementById('info-panel').classList.add('hidden');
}

function calculateUnitDemographics(unitId) {
  const mapping = wardUnitMapping ? wardUnitMapping[unitId] : null;
  if (!mapping || !mapping.wards || mapping.wards.length === 0 || !wardDemographics) return null;

  let totalArea = 0;
  let totalPop = 0;

  mapping.wards.forEach(w => {
    // Find matching ward disregarding case
    const matchKey = Object.keys(wardDemographics).find(k =>
      k.toLowerCase() === w.toLowerCase() ||
      normalizeWardName(k) === normalizeWardName(w)
    );
    if (matchKey) {
      const data = wardDemographics[matchKey];
      totalArea += data.area || 0;
      totalPop += data.pop || 0;
    }
  });

  return { totalArea, totalPop };
}

// ──────────────────────────────────────────────
// Edit Mode — Master toggle + sub-mode management
// ──────────────────────────────────────────────
function toggleEditMode() {
  editMode = !editMode;
  const toolbar = document.getElementById('edit-toolbar');
  const btn = document.getElementById('header-edit-btn');
  if (editMode) {
    toolbar.classList.remove('hidden');
    btn.classList.add('active');
    btn.textContent = '✕ Đóng';
    // Dim ward layer interaction during edit
    if (wardLayer) {
      wardLayer.eachLayer(l => {
        if (l.setStyle) l.setStyle({ interactive: false });
      });
    }
  } else {
    exitEditMode();
  }
}

function exitEditMode() {
  editMode = false;
  editSubMode = null;
  const toolbar = document.getElementById('edit-toolbar');
  const btn = document.getElementById('header-edit-btn');
  toolbar.classList.add('hidden');
  btn.classList.remove('active');
  btn.textContent = '✏️ Chỉnh sửa';
  // Reset all sub-mode buttons
  document.querySelectorAll('.edit-action-btn').forEach(b => b.classList.remove('active'));
  // Clean up sub-mode state
  cleanupEditSubMode();
  // Restore ward interactivity
  if (wardLayer) {
    wardLayer.eachLayer(l => {
      if (l.setStyle) l.setStyle({ interactive: true });
    });
  }
  // Remove status bar
  removeEditStatusBar();
  // Refresh display
  if (selectedUnitId) {
    const units = getActiveUnits();
    const unit = units.find(u => u.id === selectedUnitId);
    if (unit) {
      if (unit.type === 'duong_bo') showRoads(selectedUnitId);
      else if (unit.type === 'duong_thuy') showWaterways(selectedUnitId);
      showInfoPanel(unit);
    }
  }
}

function setEditSubMode(mode) {
  // If clicking same mode, deactivate
  if (editSubMode === mode) {
    editSubMode = null;
    document.querySelectorAll('.edit-action-btn').forEach(b => b.classList.remove('active'));
    cleanupEditSubMode();
    removeEditStatusBar();
    return;
  }
  // Clean up previous sub-mode
  cleanupEditSubMode();
  editSubMode = mode;
  // Highlight active button
  document.querySelectorAll('.edit-action-btn').forEach(b => b.classList.remove('active'));
  const btnMap = {
    'add': 'btn-route-add',
    'remove': 'btn-route-remove',
    'edit': 'btn-route-edit',
    'info': 'btn-edit-info',
    'location': 'btn-edit-location'
  };
  const activeBtn = document.getElementById(btnMap[mode]);
  if (activeBtn) activeBtn.classList.add('active');
  // Execute sub-mode action
  switch (mode) {
    case 'add':
      showEditStatusBar('Chọn tuyến → click 2 điểm checkpoint trên tuyến');
      showCandidateRoutesForAdd();
      break;
    case 'remove':
      showEditStatusBar('Click vào tuyến đang quản lý để bỏ');
      enableRemoveRouteMode();
      break;
    case 'edit':
      showEditStatusBar('Kéo checkpoint để thay đổi đoạn quản lý');
      showCheckpointsForEdit();
      break;
    case 'info':
      showEditStatusBar('Sửa thông tin trực tiếp trên bảng thông tin');
      enableInfoEditMode();
      break;
    case 'location':
      showEditStatusBar('Kéo marker 📍 để di chuyển trụ sở — nhập địa chỉ');
      enableLocationEditMode();
      break;
  }
}

function cleanupEditSubMode() {
  // Clean candidate layers
  if (candidateRoadLayer) {
    map.removeLayer(candidateRoadLayer);
    candidateRoadLayer = null;
  }
  if (candidateWaterwayLayer) {
    map.removeLayer(candidateWaterwayLayer);
    candidateWaterwayLayer = null;
  }
  // Clean checkpoint markers
  checkpointMarkers.forEach(m => map.removeLayer(m));
  checkpointMarkers = [];
  // Clean selected route highlight
  if (selectedRouteLine) {
    map.removeLayer(selectedRouteLine);
    selectedRouteLine = null;
  }
  editRouteSelection = null;
  // Clean HQ markers (multi-HQ)
  if (window._hqMarkers) {
    window._hqMarkers.forEach(m => map.removeLayer(m));
    window._hqMarkers = [];
  }
  if (hqMarker) {
    map.removeLayer(hqMarker);
    hqMarker = null;
  }
  addRoadMode = false;
  addWaterwayMode = false;
}

function showEditStatusBar(text) {
  removeEditStatusBar();
  const bar = document.createElement('div');
  bar.className = 'edit-status-bar';
  bar.id = 'edit-status-bar';
  bar.innerHTML = `
    <span class="status-text">${text}</span>
    <button class="status-btn" onclick="exitEditMode()">Xong</button>
  `;
  document.body.appendChild(bar);
  editStatusBarEl = bar;
}

function removeEditStatusBar() {
  const bar = document.getElementById('edit-status-bar');
  if (bar) bar.remove();
  editStatusBarEl = null;
}

// Quick toast notification for edit actions (auto-dismiss)
function showEditToast(message) {
  // Remove existing toast
  const existing = document.getElementById('edit-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'edit-toast';
  toast.className = 'edit-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  // Force reflow then animate in
  toast.offsetHeight;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 1500);
}

// ── Placeholder sub-mode handlers (to be implemented in Wave 2-3) ──
function showCandidateRoutesForAdd() {
  if (!selectedUnitId) return;
  const units = getActiveUnits();
  const unit = units.find(u => u.id === selectedUnitId);
  if (!unit) return;

  if (unit.type === 'duong_bo') {
    addRoadMode = true;
    showCandidateRoads();
  } else if (unit.type === 'duong_thuy') {
    addWaterwayMode = true;
    showCandidateWaterways();
  }
}

function enableRemoveRouteMode() {
  // Road popups already have ❌ remove buttons, just ensure they're visible
  // Status bar tells user to click roads to remove
}

function showCheckpointsForEdit() {
  if (!selectedUnitId) return;
  const units = getActiveUnits();
  const unit = units.find(u => u.id === selectedUnitId);
  if (!unit) return;

  // Show existing roads/waterways with endpoint markers
  if (unit.type === 'duong_bo' && roadLayer) {
    roadLayer.eachLayer(l => {
      if (!l.getLatLngs) return;
      const latlngs = l.getLatLngs();
      if (!latlngs || latlngs.length < 2) return;
      // Highlight the road thicker
      l.setStyle({ weight: 10, opacity: 1 });
      // Add draggable start marker
      const startPt = latlngs[0];
      const endPt = latlngs[latlngs.length - 1];
      const markerA = L.marker(startPt, {
        draggable: true,
        icon: L.divIcon({ className: 'checkpoint-marker checkpoint-a', iconSize: [16, 16], iconAnchor: [8, 8] })
      }).addTo(map);
      markerA.bindTooltip('Điểm đầu — kéo để sửa', { sticky: true });
      checkpointMarkers.push(markerA);
      const markerB = L.marker(endPt, {
        draggable: true,
        icon: L.divIcon({ className: 'checkpoint-marker checkpoint-b', iconSize: [16, 16], iconAnchor: [8, 8] })
      }).addTo(map);
      markerB.bindTooltip('Điểm cuối — kéo để sửa', { sticky: true });
      checkpointMarkers.push(markerB);
    });
  } else if (unit.type === 'duong_thuy' && waterwayLayer) {
    waterwayLayer.eachLayer(l => {
      if (!l.getLatLngs) return;
      const latlngs = l.getLatLngs();
      if (!latlngs || latlngs.length < 2) return;
      l.setStyle({ weight: 10, opacity: 1 });
      const startPt = latlngs[0];
      const endPt = latlngs[latlngs.length - 1];
      const markerA = L.marker(startPt, {
        draggable: true,
        icon: L.divIcon({ className: 'checkpoint-marker checkpoint-a', iconSize: [16, 16], iconAnchor: [8, 8] })
      }).addTo(map);
      markerA.bindTooltip('Điểm đầu — kéo để sửa', { sticky: true });
      checkpointMarkers.push(markerA);
      const markerB = L.marker(endPt, {
        draggable: true,
        icon: L.divIcon({ className: 'checkpoint-marker checkpoint-b', iconSize: [16, 16], iconAnchor: [8, 8] })
      }).addTo(map);
      markerB.bindTooltip('Điểm cuối — kéo để sửa', { sticky: true });
      checkpointMarkers.push(markerB);
    });
  }
}

function enableInfoEditMode() {
  if (!selectedUnitId) return;
  const units = getActiveUnits();
  const unit = units.find(u => u.id === selectedUnitId);
  if (unit) {
    showInfoPanelEditable(unit);
    // Also show HQ marker for location editing
    _showHqMarker(unit);
  }
}

function enableLocationEditMode() {
  if (!selectedUnitId) return;
  const units = getActiveUnits();
  const unit = units.find(u => u.id === selectedUnitId);
  if (!unit) return;
  _showHqMarker(unit);
  // Also show editable info panel with address input
  showInfoPanelEditable(unit);
}

// ── Multi-HQ helper: get array of HQ objects for a unit ──
function getUnitHqs(unitId) {
  const overrides = getUnitOverrides(unitId);
  const units = getActiveUnits();
  const unit = units.find(u => u.id === unitId);

  // Priority 1: overrides.hqs from localStorage (user-edited)
  if (overrides.hqs && overrides.hqs.length > 0) {
    return overrides.hqs;
  }
  // Priority 2: Migrate old localStorage format
  if (overrides.hq || overrides.address) {
    const migrated = [{
      name: overrides.address || (unit && unit.hq ? unit.hq.name : '') || '',
      lat: overrides.hq ? overrides.hq[0] : null,
      lng: overrides.hq ? overrides.hq[1] : null
    }];
    return migrated;
  }
  // Priority 3: unit.hqs array from JSON (new format)
  if (unit && unit.hqs && unit.hqs.length > 0) {
    return unit.hqs.map(function (h) {
      return { name: h.name || '', lat: h.lat || null, lng: h.lng || null };
    });
  }
  // Priority 4: unit.hq single object from JSON (old format)
  if (unit && unit.hq && (unit.hq.lat != null || (unit.hq.name && unit.hq.name !== 'Chưa cập nhật'))) {
    return [{ name: unit.hq.name || '', lat: unit.hq.lat, lng: unit.hq.lng }];
  }
  return [];
}

function saveUnitHqs(unitId, hqs) {
  saveUnitOverride(unitId, 'hqs', hqs);
}

function _showHqMarkerReadOnly(unit) {
  if (!unit) return;
  // Remove existing markers
  if (hqMarker) { map.removeLayer(hqMarker); hqMarker = null; }
  if (window._hqMarkers) { window._hqMarkers.forEach(m => map.removeLayer(m)); }
  window._hqMarkers = [];

  const hqs = getUnitHqs(unit.id);
  if (hqs.length === 0) return;

  const hqIcon = L.divIcon({
    className: 'hq-edit-marker',
    html: '<div class="hq-marker-pin">📍</div><div class="hq-marker-pulse"></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 38]
  });

  hqs.forEach((hq, idx) => {
    if (hq.lat == null || hq.lng == null) return;
    const marker = L.marker([hq.lat, hq.lng], {
      draggable: false,
      icon: hqIcon,
      zIndexOffset: 1000
    }).addTo(map);
    const label = `Trụ sở ${idx + 1}`;
    const addr = hq.name || '';
    marker.bindTooltip(`${label}${addr ? '<br>' + addr : ''}`, {
      permanent: true, sticky: false, offset: [15, -20], className: 'hq-tooltip', direction: 'right'
    });
    window._hqMarkers.push(marker);
  });
  // Also set hqMarker to first for compatibility
  if (window._hqMarkers.length > 0) hqMarker = window._hqMarkers[0];
}

function _showHqMarker(unit) {
  if (!unit) return;
  // Remove existing markers
  if (hqMarker) { map.removeLayer(hqMarker); hqMarker = null; }
  if (window._hqMarkers) { window._hqMarkers.forEach(m => map.removeLayer(m)); }
  window._hqMarkers = [];

  let hqs = getUnitHqs(unit.id);
  // If no HQs exist, create one at map center
  if (hqs.length === 0) {
    const center = map.getCenter();
    hqs = [{ name: '', lat: center.lat, lng: center.lng }];
    saveUnitHqs(unit.id, hqs);
  }

  const hqIcon = L.divIcon({
    className: 'hq-edit-marker',
    html: '<div class="hq-marker-pin">📍</div><div class="hq-marker-pulse"></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 38]
  });

  hqs.forEach((hq, idx) => {
    const lat = hq.lat != null ? hq.lat : map.getCenter().lat;
    const lng = hq.lng != null ? hq.lng : map.getCenter().lng;
    const marker = L.marker([lat, lng], {
      draggable: true,
      icon: hqIcon,
      zIndexOffset: 1000
    }).addTo(map);
    const label = `Trụ sở ${idx + 1}`;
    marker.bindTooltip(`${label} — kéo để di chuyển`, { permanent: true, sticky: false, offset: [15, -20], direction: 'right' });
    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      const currentHqs = getUnitHqs(unit.id);
      if (currentHqs[idx]) {
        currentHqs[idx].lat = pos.lat;
        currentHqs[idx].lng = pos.lng;
        saveUnitHqs(unit.id, currentHqs);
        showEditToast(`📍 Trụ sở ${idx + 1}: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
      }
    });
    window._hqMarkers.push(marker);
  });
  if (window._hqMarkers.length > 0) hqMarker = window._hqMarkers[0];
  showEditToast(`📍 ${hqs.length} trụ sở — kéo marker để di chuyển`);
}

function addNewHqLocation(unitId) {
  const hqs = getUnitHqs(unitId);
  const center = map.getCenter();
  hqs.push({ name: '', lat: center.lat, lng: center.lng });
  saveUnitHqs(unitId, hqs);
  // Refresh markers and edit panel
  const units = getActiveUnits();
  const unit = units.find(u => u.id === unitId);
  if (unit) {
    _showHqMarker(unit);
    showInfoPanelEditable(unit);
  }
}

function removeHqLocation(unitId, idx) {
  const hqs = getUnitHqs(unitId);
  if (hqs.length <= 1) {
    showEditToast('⚠️ Phải có ít nhất 1 trụ sở');
    return;
  }
  hqs.splice(idx, 1);
  saveUnitHqs(unitId, hqs);
  const units = getActiveUnits();
  const unit = units.find(u => u.id === unitId);
  if (unit) {
    _showHqMarker(unit);
    showInfoPanelEditable(unit);
  }
}

function applyDefaultHq(unitId, hqIdx, defaultIdx) {
  const def = DEFAULT_HQ_LOCATIONS[defaultIdx];
  if (!def) return;
  const hqs = getUnitHqs(unitId);
  if (!hqs[hqIdx]) return;
  hqs[hqIdx].name = def.name;
  hqs[hqIdx].lat = def.lat;
  hqs[hqIdx].lng = def.lng;
  saveUnitHqs(unitId, hqs);
  const units = getActiveUnits();
  const unit = units.find(u => u.id === unitId);
  if (unit) {
    _showHqMarker(unit);
    showInfoPanelEditable(unit);
    // Pan to selected location if coordinates exist
    if (def.lat != null && def.lng != null) {
      map.setView([def.lat, def.lng], 15, { animate: true });
    }
  }
  showEditToast(`📍 Đã chọn: ${def.name}`);
}

function _buildHqPresetOptions() {
  const groups = {};
  DEFAULT_HQ_LOCATIONS.forEach((loc, i) => {
    if (!groups[loc.group]) groups[loc.group] = [];
    groups[loc.group].push({ ...loc, _idx: i });
  });
  let opts = '<option value="">-- Chọn trụ sở mặc định --</option>';
  for (const [group, items] of Object.entries(groups)) {
    opts += `<optgroup label="${group}">`;
    items.forEach(item => {
      const coordLabel = (item.lat != null) ? ` (${item.lat.toFixed(4)}, ${item.lng.toFixed(4)})` : '';
      opts += `<option value="${item._idx}">${item.name}${coordLabel}</option>`;
    });
    opts += '</optgroup>';
  }
  return opts;
}

// ── Unit data overrides (stored in localStorage) ──
function getUnitOverrides(unitId) {
  try {
    const data = JSON.parse(localStorage.getItem('unitOverrides') || '{}');
    return data[unitId] || {};
  } catch { return {}; }
}

function saveUnitOverride(unitId, key, value) {
  try {
    const data = JSON.parse(localStorage.getItem('unitOverrides') || '{}');
    if (!data[unitId]) data[unitId] = {};
    data[unitId][key] = value;
    localStorage.setItem('unitOverrides', JSON.stringify(data));
  } catch { }
}

// ── Editable Info Panel ──
function showInfoPanelEditable(unit) {
  const panel = document.getElementById('info-panel');
  const body = document.getElementById('info-panel-body');
  const overrides = getUnitOverrides(unit.id);
  const mapping = wardUnitMapping ? wardUnitMapping[unit.id] : null;
  const demographics = calculateUnitDemographics(unit.id);
  const personnel = overrides.personnel || unit.personnel || '';
  const hqs = getUnitHqs(unit.id);

  let html = '';

  // Edit mode indicator
  html += `<div class="ip-edit-badge">✏️ CHẾ ĐỘ CHỈNH SỬA</div>`;

  // Editable personnel
  html += `<div class="ip-edit-section">
    <label class="ip-edit-label" for="edit-personnel">👮 BIÊN CHẾ QUÂN SỐ</label>
    <input type="number" id="edit-personnel" class="ip-edit-input" value="${personnel}" placeholder="Nhập số đồng chí..."
      onchange="saveUnitOverride('${unit.id}', 'personnel', this.value)">
  </div>`;

  // Editable addresses — multi-HQ
  html += `<div class="ip-edit-section">
    <label class="ip-edit-label">📍 ĐỊA CHỈ TRỤ SỞ (${hqs.length || 0})</label>`;

  if (hqs.length > 0) {
    const presetOpts = _buildHqPresetOptions();
    hqs.forEach((hq, idx) => {
      const addr = (hq.name && hq.name !== 'Chưa cập nhật') ? hq.name : '';
      const removeBtn = hqs.length > 1
        ? `<button class="ip-hq-remove-btn" onclick="removeHqLocation('${unit.id}', ${idx})" title="Xóa trụ sở này">✕</button>`
        : '';
      html += `<div class="ip-hq-row">
        <div class="ip-hq-index">${idx + 1}</div>
        <input type="text" class="ip-edit-input ip-hq-input" value="${addr}" placeholder="Nhập địa chỉ trụ sở ${idx + 1}..."
          onchange="(function(){ var hqs=getUnitHqs('${unit.id}'); hqs[${idx}].name=this.value; saveUnitHqs('${unit.id}',hqs); }).call(this)">
        ${removeBtn}
      </div>
      <select class="ip-hq-preset-select" onchange="if(this.value!=='') applyDefaultHq('${unit.id}', ${idx}, parseInt(this.value)); this.value='';">
        ${presetOpts}
      </select>`;
    });
  }

  html += `<button class="ip-hq-add-btn" onclick="addNewHqLocation('${unit.id}')">➕ Thêm trụ sở</button>
    <div class="ip-edit-hint">Chọn trụ sở mặc định từ danh sách hoặc kéo marker 📍 trên bản đồ</div>
  </div>`;

  // Demographics (read-only)
  if (demographics && (demographics.totalArea > 0 || demographics.totalPop > 0)) {
    html += `<div class="ip-edit-section ip-readonly">
      <div class="ip-edit-label">📊 QUẢN LÝ ĐỊA BÀN</div>
      <div class="ip-edit-stats">
        ${demographics.totalArea > 0 ? `<span>📐 ${demographics.totalArea.toFixed(2)} km²</span>` : ''}
        ${demographics.totalPop > 0 ? `<span>🏘️ ${demographics.totalPop.toLocaleString('vi-VN')} người</span>` : ''}
      </div>
    </div>`;
  }

  // Wards (read-only for now)
  if (mapping && mapping.wards && mapping.wards.length > 0) {
    html += `<div class="ip-edit-section ip-readonly">
      <div class="ip-edit-label">🏘️ ĐỊA BÀN (${mapping.wards.length} XÃ/PHƯỜNG)</div>
      <div class="ip-ward-tags">
        ${mapping.wards.map(w => `<span class="ip-ward-tag">${w}</span>`).join('')}
      </div>
    </div>`;
  }

  // Routes (read-only)
  if (mapping && mapping.routes && mapping.routes.length > 0) {
    const routeLabel = unit.type === 'duong_thuy' ? '🚢 TUYẾN SÔNG' : '🛣️ TUYẾN ĐƯỜNG';
    html += `<div class="ip-edit-section ip-readonly">
      <div class="ip-edit-label">${routeLabel} (${mapping.routes.length} TUYẾN)</div>
      <ul class="ip-route-list">
        ${mapping.routes.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>`;
  }

  body.innerHTML = html;
  panel.classList.remove('hidden');
}

// ──────────────────────────────────────────────
// Events
// ──────────────────────────────────────────────
function bindEvents() {
  // Mode toggle
  document.getElementById('mode-toggle').addEventListener('click', (e) => {
    const btn = e.target.closest('.toggle-btn');
    if (!btn) return;

    const mode = btn.dataset.mode;
    if (mode === currentMode) return;

    currentMode = mode;

    // Update button active state
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Deselect current unit
    selectedUnitId = null;
    hideInfoPanel();
    hideRoads();

    // Rebuild ward-unit index for the new mode
    buildWardUnitIndex();

    // Re-render
    renderWards();
    renderStats();
    renderSidebar();
  });

  // Hamburger menu (mobile)
  const hamburger = document.getElementById('hamburger-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      hamburger.classList.remove('active');
    });
  }

  // Info panel close
  document.getElementById('info-panel-close').addEventListener('click', () => {
    deselectUnit();
  });

  // ── Edit toolbar events ──
  document.getElementById('header-edit-btn').addEventListener('click', toggleEditMode);
  document.getElementById('edit-toolbar-close').addEventListener('click', exitEditMode);
  document.getElementById('btn-route-add').addEventListener('click', () => setEditSubMode('add'));
  document.getElementById('btn-route-remove').addEventListener('click', () => setEditSubMode('remove'));
  document.getElementById('btn-edit-info').addEventListener('click', () => setEditSubMode('info'));
  document.getElementById('btn-edit-location').addEventListener('click', () => setEditSubMode('location'));
}