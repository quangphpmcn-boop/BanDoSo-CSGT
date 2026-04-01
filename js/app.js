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

// Road color scheme by classification
const ROAD_STYLES = {
  quoc_lo: { color: '#D32F2F', weight: 5, opacity: 0.9, label: 'Quốc lộ' },
  duong_tinh: { color: '#F57C00', weight: 3.5, opacity: 0.85, label: 'Đường tỉnh' },
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
}

// ──────────────────────────────────────────────
// Data Loading
// ──────────────────────────────────────────────
async function loadData() {
  try {
    const [unitsRes, wardsRes, boundaryRes, mappingRes, demoRes, roadsRes] = await Promise.all([
      fetch('data/units.json'),
      fetch('data/haiphong-wards.geojson'),
      fetch('data/haiphong-boundary.geojson'),
      fetch('data/ward-unit-mapping.json'),
      fetch('data/ward-demographics.json'),
      fetch('data/haiphong-roads.geojson')
    ]);

    unitsData = await unitsRes.json();
    wardGeoJSON = await wardsRes.json();
    boundaryGeoJSON = await boundaryRes.json();
    wardUnitMapping = await mappingRes.json();
    wardDemographics = await demoRes.json();
    roadsGeoJSON = await roadsRes.json();

    console.log(`Loaded: ${wardGeoJSON.features.length} wards, ${unitsData.current.units.length} current units, ${roadsGeoJSON.features.length} roads, mapping OK`);
  } catch (err) {
    console.error('Error loading data:', err);
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
    onEachFeature: onEachWard
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

  // If a unit is selected, highlight its wards
  if (selectedUnitId && unitInfo && unitInfo.unitId === selectedUnitId) {
    // Check if the selected unit is đường bộ → subtle borders to avoid confusion with roads
    const selectedUnit = getActiveUnits().find(u => u.id === selectedUnitId);
    const isDuongBo = selectedUnit && selectedUnit.type === 'duong_bo';

    return {
      fillColor: unitInfo.unitColor,
      fillOpacity: isDuongBo ? 0.15 : 0.3,
      color: unitInfo.unitColor,
      weight: isDuongBo ? 0.8 : 2.5,
      opacity: isDuongBo ? 0.3 : 0.8,
      dashArray: isDuongBo ? '4 4' : null
    };
  }

  // If a unit is selected but this ward doesn't belong to it → dim
  if (selectedUnitId) {
    return {
      fillColor: '#9AA0A6',
      fillOpacity: 0.02,
      color: '#817662',
      weight: 0.5,
      opacity: 0.2
    };
  }

  // Default: subtle gold tint
  return {
    fillColor: '#D4A017',
    fillOpacity: 0.05,
    color: '#817662',
    weight: 1,
    opacity: 0.4
  };
}

function onEachWard(feature, layer) {
  const wardName = getWardName(feature);
  const district = getWardDistrict(feature);
  const unitInfo = findUnitForWard(wardName);

  const unitDisplay = unitInfo
    ? `<span style="color: ${unitInfo.unitColor}; font-weight: 600;">● </span>${unitInfo.unitName}`
    : '—';

  const popupContent = `
    <div class="ward-popup">
      <div class="ward-popup-title">${wardName}</div>
      ${district ? `
        <div class="ward-popup-row">
          <span class="ward-popup-label">Quận/Huyện</span>
          <span class="ward-popup-value">${district}</span>
        </div>
      ` : ''}
      <div class="ward-popup-row">
        <span class="ward-popup-label">Đơn vị quản lý</span>
        <span class="ward-popup-value">${unitDisplay}</span>
      </div>
    </div>
  `;

  layer.bindPopup(popupContent, {
    maxWidth: 280,
    className: 'ward-popup-container'
  });

  // Hover effect
  layer.on({
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

  // Count total wards and km from mapping
  let totalWards = 0;
  let totalRouteKm = 0;

  if (wardUnitMapping) {
    for (const unit of units) {
      const mapping = wardUnitMapping[unit.id];
      if (mapping) {
        totalWards += (mapping.wards || []).length;
        if (mapping.totalKm) totalRouteKm += mapping.totalKm;
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
    ${totalWards > 0 ? `<div class="stat-summary">${totalWards} xã/phường${totalRouteKm > 0 ? ` · ${totalRouteKm} km đường thuỷ` : ''}</div>` : ''}
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

  // Update sidebar
  document.querySelectorAll('.unit-item').forEach(el => {
    el.classList.toggle('active', el.dataset.unitId === unitId);
  });

  // Restyle wards on map (without rebuilding labels)
  refreshWardStyles();

  // For đường bộ units: show roads overlay (ward labels stay visible)
  if (unit.type === 'duong_bo') {
    showRoads(unitId);
  } else {
    hideRoads();
  }

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
  hideInfoPanel();
  hideRoads();
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

  // Collect actual ward polygons for this unit (not just bounding box)
  const mapping = wardUnitMapping ? wardUnitMapping[unitId] : null;
  if (!mapping || !mapping.wards || mapping.wards.length === 0) return;

  const unitWardNames = mapping.wards.map(w => normalizeWardName(w));
  const wardPolygons = []; // Array of coordinate rings [[lat,lng], ...]

  wardLayer.eachLayer(layer => {
    const wardName = getWardName(layer.feature);
    if (!unitWardNames.includes(normalizeWardName(wardName))) return;

    const geom = layer.feature.geometry;
    if (geom.type === 'Polygon') {
      wardPolygons.push(geom.coordinates[0]); // outer ring
    } else if (geom.type === 'MultiPolygon') {
      geom.coordinates.forEach(poly => wardPolygons.push(poly[0]));
    }
  });

  if (wardPolygons.length === 0) return;

  // Pre-compute bounding box for quick rejection
  const unitBounds = getUnitBounds(unitId);
  if (!unitBounds) return;

  // Point-in-polygon (ray casting) — coords are [lng, lat] in GeoJSON
  function isPointInPolygon(lng, lat, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  function isPointInAnyWard(lng, lat) {
    for (const ring of wardPolygons) {
      if (isPointInPolygon(lng, lat, ring)) return true;
    }
    return false;
  }

  // Filter roads: quoc_lo + duong_tinh in ward polygons, plus pinned noi_thi
  const allowedClasses = ['quoc_lo', 'duong_tinh'];
  const pinned = getPinnedRoads(unitId);
  const filteredFeatures = roadsGeoJSON.features.filter(f => {
    const cls = f.properties.road_class;
    const osmId = String(f.properties.osm_id);
    // Always show pinned roads regardless of class/location
    if (pinned.has(osmId)) return true;
    // Only show QL/ĐT within ward polygons
    if (!allowedClasses.includes(cls)) return false;
    const coords = f.geometry.coordinates;
    // Quick reject: check bounding box first
    const inBounds = coords.some(([lng, lat]) => unitBounds.contains([lat, lng]));
    if (!inBounds) return false;
    // Precise check: at least one coordinate inside actual ward polygon
    return coords.some(([lng, lat]) => isPointInAnyWard(lng, lat));
  });

  if (filteredFeatures.length === 0 && !addRoadMode) return;

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
      interactive: false
    });
    roadLayer.addLayer(outline);

    // Colored road line
    const line = L.polyline(coords, {
      color: style.color,
      weight: style.weight,
      opacity: style.opacity,
      lineCap: 'round',
      lineJoin: 'round'
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

    roadLayer.addLayer(line);
  });

  roadLayer.addTo(map);
  showRoadLegend();

  console.log(`Roads: ${filteredFeatures.length} segments displayed for unit ${unitId}`);
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

function getUnitBounds(unitId) {
  const mapping = wardUnitMapping ? wardUnitMapping[unitId] : null;
  if (!mapping || !mapping.wards || mapping.wards.length === 0) return null;

  const bounds = L.latLngBounds();
  let found = false;

  wardLayer.eachLayer(layer => {
    const wardName = getWardName(layer.feature);
    const normalized = normalizeWardName(wardName);
    const unitWards = mapping.wards.map(w => normalizeWardName(w));
    if (unitWards.includes(normalized)) {
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
    <div class="road-legend-title">PHÂN CẤP ĐƯỜNG</div>
    ${visibleStyles.map(([key, s]) => `
      <div class="road-legend-item">
        <span class="road-legend-line" style="background:${s.color}; height:${Math.max(2, s.weight - 1)}px"></span>
        <span>${s.label}</span>
      </div>
    `).join('')}
    <button id="btn-add-road" class="btn-add-road" onclick="toggleAddRoadMode()" title="Click để chọn thêm đường nội thị bổ sung">
      ➕ Thêm đường
    </button>
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
    btn.textContent = addRoadMode ? '✕ Đóng' : '➕ Thêm đường';
  }
  if (addRoadMode) {
    showCandidateRoads();
  } else {
    if (candidateRoadLayer) {
      map.removeLayer(candidateRoadLayer);
      candidateRoadLayer = null;
    }
    // Refresh main roads to show newly pinned roads
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
  const unitBounds = getUnitBounds(selectedUnitId);
  if (!unitBounds) return;

  // Expand bounds by ~50% to show nearby roads outside strict boundary
  const expandedBounds = unitBounds.pad(0.5);

  // Show all noi_thi roads in expanded area (excluding already-pinned)
  const candidates = roadsGeoJSON.features.filter(f => {
    if (f.properties.road_class !== 'noi_thi') return false;
    const osmId = String(f.properties.osm_id);
    if (pinned.has(osmId)) return false; // already pinned, shown in main layer
    const coords = f.geometry.coordinates;
    return coords.some(([lng, lat]) => expandedBounds.contains([lat, lng]));
  });

  candidates.forEach(feature => {
    const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const name = feature.properties.name || feature.properties.ref || '(không tên)';

    const line = L.polyline(coords, {
      color: '#78909C',
      weight: 2,
      opacity: 0.35,
      dashArray: '6 4',
      interactive: true
    });

    line.bindTooltip(`📌 Click để thêm: ${name}`, { sticky: true });

    line.on('click', () => {
      const osmId = String(feature.properties.osm_id);
      const p = getPinnedRoads(selectedUnitId);
      p.add(osmId);
      savePinnedRoads(selectedUnitId, p);
      // Remove this candidate from candidate layer
      candidateRoadLayer.removeLayer(line);
      // Add to main road layer immediately
      const style = ROAD_STYLES.noi_thi;
      const outline = L.polyline(coords, {
        color: '#FFFFFF', weight: style.weight + 2, opacity: 0.5, interactive: false
      });
      roadLayer.addLayer(outline);
      const pinnedLine = L.polyline(coords, {
        color: style.color, weight: style.weight, opacity: 0.7,
        lineCap: 'round', lineJoin: 'round'
      });
      pinnedLine.bindTooltip(`${name} 📌`, { permanent: false, sticky: true });
      pinnedLine.bindPopup(`<b>${name}</b><br><button onclick="unpinRoad('${osmId}')">❌ Bỏ ghim</button>`, { closeOnClick: false });
      roadLayer.addLayer(pinnedLine);
      console.log(`Pinned road: ${name} (${osmId})`);
    });

    candidateRoadLayer.addLayer(line);
  });

  candidateRoadLayer.addTo(map);
  console.log(`Candidate roads: ${candidates.length} available for pinning`);
}

function unpinRoad(osmId) {
  if (!selectedUnitId) return;
  const p = getPinnedRoads(selectedUnitId);
  p.delete(osmId);
  savePinnedRoads(selectedUnitId, p);
  map.closePopup();
  // Refresh road display
  showRoads(selectedUnitId);
  if (addRoadMode) showCandidateRoads();
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
    if (unit.hq && unit.hq.lat && unit.hq.lng) {
      map.setView([unit.hq.lat, unit.hq.lng], 14, { animate: true });
    } else {
      map.setView(HP_CENTER, 13, { animate: true });
    }
    return;
  }

  // Đường thuỷ: fit to waterway routes (no wards to zoom to)
  if (unit.type === 'duong_thuy') {
    const mapping = wardUnitMapping ? wardUnitMapping[unitId] : null;
    if (mapping && mapping.routes && mapping.routes.length > 0) {
      // Try to fit to ward bounds if any, otherwise use general view
      const bounds = getUnitBounds(unitId);
      if (bounds) {
        map.fitBounds(bounds, { padding: [40, 40], animate: true });
      } else {
        map.setView(HP_CENTER, 11, { animate: true });
      }
    }
    return;
  }

  // Đường bộ: fit to ward jurisdiction area
  const bounds = getUnitBounds(unitId);
  if (bounds) {
    map.fitBounds(bounds, { padding: [40, 40], animate: true });
  }
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
  const demographics = calculateUnitDemographics(unit.id);

  let html = '';

  // ── BIÊN CHẾ QUÂN SỐ ──
  if (unit.personnel) {
    html += `<div class="info-hero-section">
      <div class="info-hero-title">BIÊN CHẾ QUÂN SỐ</div>
      <div class="info-hero-value">
        <span class="icon">🧑</span> ${unit.personnel} đồng chí
      </div>
    </div>`;
  }

  // ── QUẢN LÝ ĐỊA BÀN ──
  if (demographics && (demographics.totalArea > 0 || demographics.totalPop > 0)) {
    html += `<div class="info-hero-section">
      <div class="info-hero-title">QUẢN LÝ ĐỊA BÀN</div>
      <div class="info-stats-row">
        ${demographics.totalArea > 0 ? `<div class="info-stat-item"><span class="icon">📐</span> ${demographics.totalArea.toFixed(2)} km²</div>` : ''}
        ${demographics.totalPop > 0 ? `<div class="info-stat-item"><span class="icon">🏘️</span> ${demographics.totalPop.toLocaleString('vi-VN')} người</div>` : ''}
      </div>
    </div>`;
  }

  // ── ĐỊA BÀN (xã/phường) ──
  if (mapping && mapping.wards && mapping.wards.length > 0) {
    html += `<div class="info-hero-section">
      <div class="info-hero-title">ĐỊA BÀN (${mapping.wards.length} XÃ/PHƯỜNG)</div>
      <div style="font-size:0.8125rem;color:var(--on-surface);line-height:1.6">
        ${mapping.wards.join(', ')}
      </div>
    </div>`;
  }

  // ── TUYẾN ĐƯỜNG / TUYẾN SÔNG ──
  if (mapping && mapping.routes && mapping.routes.length > 0) {
    const routeLabel = unit.type === 'duong_thuy' ? 'TUYẾN SÔNG' : 'TUYẾN ĐƯỜNG';
    html += `<div class="info-hero-section">
      <div class="info-hero-title">${routeLabel} (${mapping.routes.length} TUYẾN)</div>
      <ul class="info-route-list">
        ${mapping.routes.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>`;
  }

  // ── TỔNG KM (đường thuỷ) ──
  if (mapping && mapping.totalKm) {
    html += `<div class="info-row">
      <span class="info-label">Tổng km đường thuỷ</span>
      <span class="info-value">${mapping.totalKm} km</span>
    </div>`;
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
}