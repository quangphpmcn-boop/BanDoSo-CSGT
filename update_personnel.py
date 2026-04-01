import json

personnel_current = {
    "tham_muu": 32,
    "tuyen_truyen": 24,
    "dang_ky": 24,
    "sat_hach": 36,
    "db1": 66,
    "db2": 56,
    "db3": 32,
    "db4": 51,
    "tram_an_hung": 60,
    "tram_luu_kiem": 47,
    "tram_quang_trung": 61,
    "db5": 84,
    "tram_dt_an_duong": 16,
    "tram_dt_may_chi": 14,
    "tram_dt_bach_dang": 16,
    "dt1": 45,
    "dt2": 18,
    "dt3": 35,
    "dt_phong_ngua": 15
}

personnel_planned = {
    "tham_muu": 20,
    "tuyen_truyen": 18,
    "dang_ky": 18,
    "sat_hach": 28,
    "db1_planned": 55,
    "db2_planned": 82,
    "db3_planned": 60,
    "db4_planned": 55,
    "db5_planned": 58,
    "dt1_planned": 34,
    "dt2_planned": 34,
    "tram_dt_bach_dang_planned": 30
}

with open(r'H:\Bandoso\data\units.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for unit in data.get('current', {}).get('units', []):
    uid = unit['id']
    if uid in personnel_current:
        unit['personnel'] = personnel_current[uid]

for unit in data.get('planned', {}).get('units', []):
    uid = unit['id']
    if uid in personnel_planned:
        unit['personnel'] = personnel_planned[uid]

with open(r'H:\Bandoso\data\units.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print("Updated units.json successfully!")
