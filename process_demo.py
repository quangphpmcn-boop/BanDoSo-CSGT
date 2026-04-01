import json

with open(r'H:\Bandoso\data\demographics.json', 'r', encoding='utf-8') as f:
    rows = json.load(f)

# The data starts at row index 6 (1-based row 7 in JSON is the header "STT", "Tên Phường...", "Diện tích", "Dân số")
# Actual data starts around row index 8 (STT 1)
result = {}
for row in rows:
    if len(row) >= 4 and isinstance(row[0], (int, float)):
        name = str(row[1]).strip()
        area = float(row[2]) if row[2] else 0.0
        pop = int(row[3]) if row[3] else 0
        result[name] = {"area": area, "pop": pop}

# Add aliases for mismatches if needed?
# "Bạch Long Vỹ" vs "Bạch Long Vĩ"
if "Bạch Long Vỹ" in result:
    result["Bạch Long Vĩ"] = result["Bạch Long Vỹ"]

with open(r'H:\Bandoso\data\ward-demographics.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("Saved ward-demographics.json")
