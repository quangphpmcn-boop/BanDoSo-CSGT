import osmium

HP_BBOX = {'min_lon': 106.10, 'max_lon': 107.10, 'min_lat': 20.55, 'max_lat': 21.05}

class HPWaterways(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.waterways = []
        self.by_type = {}
        
    def way(self, w):
        ww = w.tags.get('waterway')
        if not ww:
            return
        if ww not in ('river', 'canal', 'fairway', 'tidal_channel'):
            return
            
        coords = [(n.lon, n.lat) for n in w.nodes if n.location.valid()]
        if not coords:
            return
        in_hp = any(HP_BBOX['min_lon'] <= lon <= HP_BBOX['max_lon'] and 
                     HP_BBOX['min_lat'] <= lat <= HP_BBOX['max_lat'] 
                     for lon, lat in coords)
        if not in_hp:
            return
            
        name = w.tags.get('name', '')
        boat = w.tags.get('boat', '')
        ship = w.tags.get('ship', '')
        width = w.tags.get('width', '')
        ref = w.tags.get('ref', '')
        
        self.by_type[ww] = self.by_type.get(ww, 0) + 1
        if name:
            self.waterways.append({
                'type': ww, 'name': name, 'ref': ref,
                'boat': boat, 'ship': ship, 'width': width,
                'segments': len(coords)
            })

h = HPWaterways()
h.apply_file('docs/vietnam-260330.osm.pbf', locations=True)

print('=== WATERWAYS IN HAI PHONG AREA ===')
print('By type:')
for k, v in sorted(h.by_type.items(), key=lambda x: -x[1]):
    print(f'  {k}: {v} segments')

names = {}
for w in h.waterways:
    key = w['name']
    if key not in names:
        names[key] = w
    else:
        names[key]['segments'] += w['segments']

print(f'\nUnique named waterways: {len(names)}')
print('\nAll named waterways:')
for n, w in sorted(names.items()):
    info = f"[{w['type']}] {n}"
    if w['ref']:
        info += f" (ref={w['ref']})"
    if w['boat']:
        info += f" boat={w['boat']}"
    info += f" ({w['segments']} segs)"
    print(f'  {info}')
