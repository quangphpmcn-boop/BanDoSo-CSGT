"""
Reclassify roads in haiphong-roads.geojson based on `ref` field.
Now keeps ALL features but classifies them properly:
  - ref matches QL.* → quoc_lo
  - ref matches ĐT.* or DT.* → duong_tinh
  - No match → noi_thi (visible only when user manually selects)
"""
import json
import os
import re
import shutil

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_DIR, "data")
ROADS_FILE = os.path.join(DATA_DIR, "haiphong-roads.geojson")
BACKUP_FILE = ROADS_FILE + ".bak"


def classify_by_ref(ref_value):
    """Classify road based on ref field."""
    if not ref_value:
        return 'noi_thi'
    ref = ref_value.strip()
    if re.match(r'^QL[\s.]*\d', ref, re.IGNORECASE):
        return 'quoc_lo'
    if re.match(r'^[ĐD]T[\s.]*\d', ref, re.IGNORECASE):
        return 'duong_tinh'
    return 'noi_thi'


def main():
    # Restore from backup if exists
    if os.path.exists(BACKUP_FILE):
        print(f"Restoring from backup: {BACKUP_FILE}")
        shutil.copy2(BACKUP_FILE, ROADS_FILE)
    
    print(f"Loading: {ROADS_FILE}")
    with open(ROADS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    total = len(data['features'])
    print(f"Total features: {total}")

    stats = {'quoc_lo': 0, 'duong_tinh': 0, 'noi_thi': 0}

    for feat in data['features']:
        props = feat['properties']
        ref = props.get('ref', '')
        new_class = classify_by_ref(ref)
        
        old_class = props.get('road_class', 'unknown')
        if old_class != new_class:
            name = props.get('name', '')
            print(f"  CHANGED: {ref or name} | {old_class} → {new_class}")
        
        props['road_class'] = new_class
        stats[new_class] += 1

    # Write (no backup needed - already restored)
    with open(ROADS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)

    size_kb = os.path.getsize(ROADS_FILE) / 1024
    print(f"\n=== Summary ===")
    print(f"quoc_lo={stats['quoc_lo']}, duong_tinh={stats['duong_tinh']}, noi_thi={stats['noi_thi']}")
    print(f"Output: {total} features ({size_kb:.0f} KB)")
    print("\n✅ Done!")


if __name__ == '__main__':
    main()
