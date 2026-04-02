"""
Extract waterways from PBF for Hai Phong, match against document river names.
Output: haiphong-waterways.geojson + match report
"""
import osmium
import json
import os
import sys

HP_BBOX = {'min_lon': 106.10, 'max_lon': 107.10, 'min_lat': 20.55, 'max_lat': 21.05}

# === River names from the two documents ===
# Format: { doc_name: [list of river names used in that doc] }

# Quy hoạch (Các Đội đường thuỷ.docx.txt)
DOC_RIVERS_QUYHOACH = {
    "doi_dt_1_qh": [
        "Sông Cấm", "Sông Ruột Lợn", "Sông Đào Hạ Lý", "Sông Lạch Tray",
        "Kênh Cái Tráp", "Kênh Hà Nam", "Luồng Ba Mom", "Luồng Lạch Huyện",
        "Luồng phía Bắc Cát Bà", "Sông Kinh Môn", "Sông Tam Bạc",
        "Sông Rế", "Lạch Phù Long", "Lạch Cái Viềng", "Lạch Hào Quang",
        "Tuyến ven biển đảo Cát Bà"
    ],
    "doi_dt_2_qh": [
        "Sông Văn Úc", "Sông Thái Bình", "Sông Kênh Khê", "Sông Luộc",
        "Sông Gùa", "Sông Mía", "Sông Lai Vu", "Sông Đa Độ",
        "Sông Sặt", "Sông Cửu Yên", "Sông Đĩnh Đào", "Sông Tứ Kỳ",
        "Sông Cầu Xe", "Sông Ghẽ"
    ],
    "tram_bach_dang_qh": [
        "Sông Mạo Khê", "Sông Đá Bạch", "Sông Bạch Đằng", "Sông Giá",
        "Sông Kinh Thầy", "Sông Phi Liệt", "Sông Hàn", "Sông Thải",
        "Sông Đước", "Sông Giá"  # duplicate intentional - 2 sections
    ]
}

# Hiện tại (phan_cong_hien_tai2.txt)
DOC_RIVERS_HIENTAI = {
    "tram_an_duong": [
        "Sông Lạch Tray", "Sông Đào Hạ Lý", "Sông Rế"
    ],
    "tram_may_chi": [
        "Sông Cấm", "Sông Tam Bạc", "Sông Đào Hạ Lý"
    ],
    "tram_bach_dang": [
        "Sông Đá Bạch", "Sông Bạch Đằng", "Sông Giá", "Sông Thải"
    ],
    "doi_dt_1": [
        "Kênh Cái Tráp", "Kênh Hà Nam", "Sông Chanh",
        "Luồng Ba Mom", "Luồng Lạch Huyện", "Luồng Nam Triệu",
        "Tuyến ven biển đảo Cát Bà", "Lạch Cái Viềng", "Lạch Phù Long",
        "Lạch Hòa Quang", "Sông Cấm", "Sông Ruột Lợn"
    ],
    "doi_dt_2": [
        "Sông Văn Úc", "Sông Mới", "Sông Thái Bình", "Sông Luộc",
        "Sông Hóa", "Sông Đa Độ"
    ],
    "doi_dt_3": [
        "Sông Kinh Môn", "Sông Kinh Thầy", "Sông Hàn",
        "Sông Phi Liệt", "Sông Mạo Khê", "Sông Lai Vu",
        "Sông Thái Bình", "Sông Gùa", "Sông Văn Úc",
        "Sông Sặt", "Sông Cửu Yên", "Sông Đĩnh Đào",
        "Sông Tứ Kỳ", "Sông Cầu Xe", "Sông Ghê"
    ]
}

# Collect all unique doc river names
all_doc_rivers = set()
for rivers in DOC_RIVERS_QUYHOACH.values():
    all_doc_rivers.update(rivers)
for rivers in DOC_RIVERS_HIENTAI.values():
    all_doc_rivers.update(rivers)

print(f"Total unique river names in documents: {len(all_doc_rivers)}")
for r in sorted(all_doc_rivers):
    print(f"  - {r}")

# === Extract from PBF ===
class WaterwayExtractor(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.features = []
        self.names = {}  # name -> segment count
        
    def way(self, w):
        ww = w.tags.get('waterway')
        if not ww:
            return
        if ww not in ('river', 'canal', 'fairway', 'tidal_channel'):
            return
            
        coords = [(n.lon, n.lat) for n in w.nodes if n.location.valid()]
        if not coords or len(coords) < 2:
            return
        in_hp = any(HP_BBOX['min_lon'] <= lon <= HP_BBOX['max_lon'] and 
                     HP_BBOX['min_lat'] <= lat <= HP_BBOX['max_lat'] 
                     for lon, lat in coords)
        if not in_hp:
            return
            
        name = w.tags.get('name', '')
        
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": coords
            },
            "properties": {
                "osm_id": w.id,
                "name": name,
                "waterway_type": ww,
                "boat": w.tags.get('boat', ''),
                "ship": w.tags.get('ship', ''),
                "width": w.tags.get('width', ''),
            }
        }
        self.features.append(feature)
        
        if name:
            self.names[name] = self.names.get(name, 0) + 1

print("\nExtracting waterways from PBF...")
h = WaterwayExtractor()
h.apply_file('docs/vietnam-260330.osm.pbf', locations=True)

print(f"Extracted: {len(h.features)} waterway segments")
print(f"Named waterways: {len(h.names)} unique names")

# === Save GeoJSON ===
geojson = {
    "type": "FeatureCollection",
    "features": h.features
}

output_path = 'data/haiphong-waterways.geojson'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(geojson, f, ensure_ascii=False)
print(f"\nSaved: {output_path} ({len(h.features)} features)")

# === Match Report ===
print("\n" + "="*60)
print("MATCH REPORT: Document Rivers vs OSM Names")
print("="*60)

osm_names = set(h.names.keys())

# Normalize function
def normalize(name):
    n = name.lower().strip()
    n = n.replace("sông ", "").replace("kênh ", "").replace("luồng ", "")
    n = n.replace("lạch ", "").replace("tuyến ", "")
    return n

osm_norm = {normalize(n): n for n in osm_names}

matched = []
unmatched = []
fuzzy_matches = []

for doc_name in sorted(all_doc_rivers):
    # Direct match
    if doc_name in osm_names:
        matched.append((doc_name, doc_name, h.names.get(doc_name, 0)))
        continue
    
    # Normalized match
    doc_norm = normalize(doc_name)
    if doc_norm in osm_norm:
        osm_orig = osm_norm[doc_norm]
        matched.append((doc_name, osm_orig, h.names.get(osm_orig, 0)))
        continue
    
    # Partial match (check if doc name part appears in any OSM name)
    found = False
    for osm_name in osm_names:
        if doc_norm in normalize(osm_name) or normalize(osm_name) in doc_norm:
            fuzzy_matches.append((doc_name, osm_name, h.names.get(osm_name, 0)))
            found = True
            break
    
    if not found:
        unmatched.append(doc_name)

print(f"\n✅ MATCHED ({len(matched)}):")
for doc, osm, segs in matched:
    if doc == osm:
        print(f"  {doc} → {segs} segments")
    else:
        print(f"  {doc} → OSM: '{osm}' ({segs} segments)")

print(f"\n🔶 FUZZY MATCH ({len(fuzzy_matches)}):")
for doc, osm, segs in fuzzy_matches:
    print(f"  {doc} → có thể là '{osm}' ({segs} segments)")

print(f"\n❌ KHÔNG TÌM THẤY TRONG OSM ({len(unmatched)}):")
for name in unmatched:
    print(f"  {name}")

print(f"\n📋 ALL OSM NAMED WATERWAYS ({len(osm_names)}):")
for name in sorted(osm_names):
    print(f"  {name} ({h.names[name]} segs)")
