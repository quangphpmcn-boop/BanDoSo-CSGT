"""Extract Hai Phong wards from Vietnam GeoJSON."""
import json
import sys
import os

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
DOCS_DIR = os.path.join(PROJECT_DIR, "docs")
DATA_DIR = os.path.join(PROJECT_DIR, "data")

WARDS_INPUT = os.path.join(DOCS_DIR, "Việt Nam (phường xã) - 34.geojson")
PROVINCE_INPUT = os.path.join(DOCS_DIR, "Việt Nam (tỉnh thành) - 34.geojson")
WARDS_OUTPUT = os.path.join(DATA_DIR, "haiphong-wards.geojson")
BOUNDARY_OUTPUT = os.path.join(DATA_DIR, "haiphong-boundary.geojson")

# Hai Phong province code
HP_PROVINCE_NAME_PATTERNS = ["Hải Phòng", "Hai Phong", "hai phong"]
HP_PROVINCE_CODE = "31"  # GSO code for Hai Phong

os.makedirs(DATA_DIR, exist_ok=True)

def extract_wards():
    """Extract Hai Phong wards from national ward GeoJSON."""
    print(f"Loading wards from: {WARDS_INPUT}")
    print(f"File size: {os.path.getsize(WARDS_INPUT) / 1024 / 1024:.1f} MB")
    
    with open(WARDS_INPUT, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    total = len(data["features"])
    print(f"Total features in Vietnam: {total}")
    
    # Try different property patterns to find Hai Phong
    hp_features = []
    sample = data["features"][0]["properties"] if data["features"] else {}
    print(f"Sample properties: {list(sample.keys())}")
    print(f"Sample values: {sample}")
    
    for feat in data["features"]:
        props = feat["properties"]
        # Try multiple property keys
        match = False
        for key in ["tinh", "province", "NAME_1", "VARNAME_1", "ma_tinh", "PROVINCE"]:
            val = str(props.get(key, ""))
            if any(p.lower() in val.lower() for p in HP_PROVINCE_NAME_PATTERNS):
                match = True
                break
            if val == HP_PROVINCE_CODE:
                match = True
                break
        
        # Also check if any property value contains "Hải Phòng"
        if not match:
            for v in props.values():
                if isinstance(v, str) and "hải phòng" in v.lower():
                    match = True
                    break
        
        if match:
            hp_features.append(feat)
    
    print(f"Hai Phong wards found: {len(hp_features)}")
    
    if not hp_features:
        print("ERROR: No Hai Phong wards found! Dumping first 3 features for debugging:")
        for i, f in enumerate(data["features"][:3]):
            print(f"  Feature {i}: {f['properties']}")
        sys.exit(1)
    
    result = {
        "type": "FeatureCollection",
        "features": hp_features
    }
    
    with open(WARDS_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False)
    
    size = os.path.getsize(WARDS_OUTPUT) / 1024
    print(f"Saved {len(hp_features)} wards to {WARDS_OUTPUT} ({size:.0f} KB)")

def extract_boundary():
    """Extract Hai Phong province boundary."""
    print(f"\nLoading provinces from: {PROVINCE_INPUT}")
    
    with open(PROVINCE_INPUT, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    total = len(data["features"])
    print(f"Total provinces: {total}")
    
    hp_feature = None
    for feat in data["features"]:
        props = feat["properties"]
        for v in props.values():
            if isinstance(v, str) and "hải phòng" in v.lower():
                hp_feature = feat
                break
        if hp_feature:
            break
    
    if not hp_feature:
        print("ERROR: Hai Phong province not found!")
        for i, f in enumerate(data["features"][:5]):
            print(f"  Province {i}: {f['properties']}")
        sys.exit(1)
    
    print(f"Found: {hp_feature['properties']}")
    
    result = {
        "type": "FeatureCollection",
        "features": [hp_feature]
    }
    
    with open(BOUNDARY_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False)
    
    size = os.path.getsize(BOUNDARY_OUTPUT) / 1024
    print(f"Saved boundary to {BOUNDARY_OUTPUT} ({size:.0f} KB)")

if __name__ == "__main__":
    extract_wards()
    extract_boundary()
    print("\n✅ Done!")
