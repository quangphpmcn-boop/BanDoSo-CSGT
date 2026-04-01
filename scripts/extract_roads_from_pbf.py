"""
Extract Hai Phong roads from Vietnam OSM PBF file.

Extracts roads with QL (national highway) or ĐT (provincial road) refs
and outputs GeoJSON compatible with the CSGT map application.

Classification rules:
  - ref matches QL.* → quoc_lo
  - ref matches ĐT.* or DT.* → duong_tinh
  - All other highway=trunk/primary/secondary/tertiary → noi_thi

Usage:
  python extract_roads_from_pbf.py
"""
import json
import os
import re
import sys

try:
    import osmium
except ImportError:
    print("ERROR: osmium not installed. Run: pip install osmium")
    sys.exit(1)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
DOCS_DIR = os.path.join(PROJECT_DIR, "docs")
DATA_DIR = os.path.join(PROJECT_DIR, "data")

PBF_FILE = os.path.join(DOCS_DIR, "vietnam-260330.osm.pbf")
OUTPUT_FILE = os.path.join(DATA_DIR, "haiphong-roads.geojson")
BACKUP_FILE = OUTPUT_FILE + ".pbf-bak"

# Hai Phong approximate bounding box (expanded slightly)
HP_BBOX = {
    'min_lon': 106.40,
    'max_lon': 107.10,
    'min_lat': 20.55,
    'max_lat': 21.05
}

# Highway types to extract
HIGHWAY_TYPES = {'trunk', 'trunk_link', 'primary', 'primary_link',
                 'secondary', 'secondary_link', 'tertiary', 'tertiary_link'}


def classify_road(ref, highway):
    """Classify road based on ref field."""
    if ref:
        ref = ref.strip()
        if re.match(r'^QL[\s.]*\d', ref, re.IGNORECASE):
            return 'quoc_lo'
        if re.match(r'^[ĐD]T[\s.]*\d', ref, re.IGNORECASE):
            return 'duong_tinh'
    return 'noi_thi'


def in_bbox(lon, lat):
    """Check if coordinate is within Hai Phong bounding box."""
    return (HP_BBOX['min_lon'] <= lon <= HP_BBOX['max_lon'] and
            HP_BBOX['min_lat'] <= lat <= HP_BBOX['max_lat'])


class NodeCollector(osmium.SimpleHandler):
    """First pass: collect node IDs used by relevant ways."""
    def __init__(self):
        super().__init__()
        self.way_count = 0
        self.relevant_ways = []  # [(way_id, tags, node_refs)]

    def way(self, w):
        highway = w.tags.get('highway', '')
        if highway not in HIGHWAY_TYPES:
            return

        # Quick check: at least one node should be roughly in HP area
        # (We'll do precise filtering later with actual coordinates)
        refs = [n.ref for n in w.nodes]
        
        tags = {
            'highway': highway,
            'name': w.tags.get('name', ''),
            'ref': w.tags.get('ref', ''),
            'osm_id': w.id
        }
        
        self.relevant_ways.append((w.id, tags, refs))
        self.way_count += 1
        
        if self.way_count % 10000 == 0:
            print(f"  Scanned {self.way_count} relevant ways...", end='\r')


class CoordCollector(osmium.SimpleHandler):
    """Second pass: collect coordinates for needed nodes."""
    def __init__(self, needed_nodes):
        super().__init__()
        self.needed = needed_nodes
        self.coords = {}  # node_id -> (lon, lat)
        self.found = 0

    def node(self, n):
        if n.id in self.needed:
            self.coords[n.id] = (n.location.lon, n.location.lat)
            self.found += 1
            if self.found % 50000 == 0:
                print(f"  Collected {self.found}/{len(self.needed)} node coords...", end='\r')


def main():
    if not os.path.exists(PBF_FILE):
        print(f"ERROR: PBF file not found: {PBF_FILE}")
        sys.exit(1)

    size_mb = os.path.getsize(PBF_FILE) / 1024 / 1024
    print(f"Input: {PBF_FILE} ({size_mb:.0f} MB)")
    print(f"Bounding box: {HP_BBOX}")
    print()

    # Pass 1: Collect relevant ways
    print("Pass 1: Scanning ways...")
    collector = NodeCollector()
    collector.apply_file(PBF_FILE)
    print(f"  Found {len(collector.relevant_ways)} relevant highway ways in Vietnam")

    # Collect all needed node IDs
    needed_nodes = set()
    for _, _, refs in collector.relevant_ways:
        needed_nodes.update(refs)
    print(f"  Need coordinates for {len(needed_nodes)} nodes")

    # Pass 2: Collect node coordinates
    print("\nPass 2: Collecting node coordinates...")
    coord_collector = CoordCollector(needed_nodes)
    coord_collector.apply_file(PBF_FILE)
    print(f"  Collected {len(coord_collector.coords)} node coordinates")

    # Build GeoJSON features — filter to Hai Phong bbox
    print("\nBuilding GeoJSON features...")
    features = []
    stats = {'quoc_lo': 0, 'duong_tinh': 0, 'noi_thi': 0, 'skipped': 0}

    for way_id, tags, refs in collector.relevant_ways:
        # Build coordinate array
        coords = []
        for node_id in refs:
            if node_id in coord_collector.coords:
                coords.append(coord_collector.coords[node_id])

        if len(coords) < 2:
            stats['skipped'] += 1
            continue

        # Check if any coordinate is within Hai Phong bbox
        if not any(in_bbox(lon, lat) for lon, lat in coords):
            stats['skipped'] += 1
            continue

        # Classify
        road_class = classify_road(tags['ref'], tags['highway'])
        stats[road_class] += 1

        feature = {
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': coords  # [lon, lat] format
            },
            'properties': {
                'osm_id': tags['osm_id'],
                'highway': tags['highway'],
                'name': tags['name'],
                'ref': tags['ref'],
                'road_class': road_class
            }
        }
        features.append(feature)

    print(f"\n=== Results ===")
    print(f"Total features in Hai Phong: {len(features)}")
    print(f"  quoc_lo: {stats['quoc_lo']}")
    print(f"  duong_tinh: {stats['duong_tinh']}")
    print(f"  noi_thi: {stats['noi_thi']}")
    print(f"  skipped (outside bbox or incomplete): {stats['skipped']}")

    # Backup existing file
    if os.path.exists(OUTPUT_FILE):
        import shutil
        print(f"\nBacking up existing file to: {BACKUP_FILE}")
        shutil.copy2(OUTPUT_FILE, BACKUP_FILE)

    # Write GeoJSON
    geojson = {
        'type': 'FeatureCollection',
        'features': features
    }

    os.makedirs(DATA_DIR, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, ensure_ascii=False)

    size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    print(f"Output: {OUTPUT_FILE} ({size_kb:.0f} KB)")
    print("\n✅ Done!")


if __name__ == '__main__':
    main()
