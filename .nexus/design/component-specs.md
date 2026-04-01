# Component Specs — Phase 1

> Design System: "The Sovereign Lens" | Gold #D4A017

---

## 1. AppHeader
```
┌─[Logo]──PHÒNG CSGT - CÔNG AN TP HẢI PHÒNG────────────────────────┐
└───────────────────────────────────────────────────────────────────-┘
```
- Height: `48px`
- Background: `surface` 85% opacity + `backdrop-blur(20px)` (glassmorphism)
- Border-bottom: `primary-container` (#D4A017) — gold line 2px
- Logo: `trống đồng.jpg` (32px circle)
- Title: `Inter 600 0.875rem` uppercase — `on-surface`
- Position: `fixed top`, `z-index: 1000`

---

## 2. Sidebar

### Container
- Width: `280px`, height: `calc(100vh - 48px)`
- Background: `surface-container-low` (#F3F4F5)
- Overflow-y: `auto`
- Padding: `16px`

### Toggle "Hiện tại / Quy hoạch"
- Type: Segmented control (2 options)
- Container: `surface-container-high` (#E7E8E9), border-radius: `8px`, padding: `4px`
- Active segment: `surface-container-lowest` (#FFF), ambient shadow, gold text
- Inactive: transparent, `on-surface-variant` text
- Font: `Inter 600 0.75rem` uppercase

### Unit List Item
```
┌──────────────────────────┐
│ ● Đội CSGT ĐB số 1      │
│   23 xã/phường           │
└──────────────────────────┘
```
- Padding: `12px 16px`
- Border-radius: `8px`
- Background: transparent → hover: `surface-container` (#EDEEEF)
- **Active state**: `surface-container-lowest` bg + gold bar `4px` trái
- Color dot: `12px` circle, color unique per unit
- Title: `Inter 500 0.875rem` — `on-surface`
- Subtitle: `Inter 400 0.75rem` — `on-surface-variant`

### Unit Colors (10 đội)
| Đội | Color | Hex |
|-----|-------|-----|
| ĐB số 1 | Blue | `#4285F4` |
| ĐB số 2 | Green | `#34A853` |
| ĐB số 3 | Orange | `#FA7B17` |
| ĐB số 4 | Red | `#EA4335` |
| ĐB số 5 | Purple | `#A142F4` |
| ĐT số 1 | Teal | `#24C1E0` |
| ĐT số 2 | Cyan | `#12B5CB` |
| Trạm ĐT | Indigo | `#5C6BC0` |
| Đăng ký xe | Gray | `#9AA0A6` |
| Tham mưu | Brown | `#A1887F` |

---

## 3. Floating Info Panel

### Container
- Width: `320px`
- Position: absolute, top-right of map (margin: `16px`)
- Background: `surface-container-lowest` 90% opacity + `backdrop-blur(16px)`
- Border-radius: `12px`
- Ambient shadow: `0 8px 24px rgba(25,28,29,0.08)`
- Padding: `20px`

### Layout
```
┌──────────────────────────────┐
│ ĐỘI CSGT ĐƯỜNG BỘ SỐ 1  ✕  │
│                              │
│ ĐỊA BÀN                     │
│ P. Lạch Tray, P. Đông Khê...│
│                              │
│ TUYẾN ĐƯỜNG                  │
│ QL5, QL10, Lạch Tray...     │
│                              │
│ TRỤ SỞ                      │
│ 📍 Số 45 Lạch Tray, NQ      │
│                              │
│ QUÂN SỐ: 32 CBCS            │
└──────────────────────────────┘
```
- Title: `Public Sans 600 1.125rem` — `on-surface`
- Section label: `Inter 600 0.625rem` uppercase — `on-surface-variant`
- Content: `Inter 400 0.8125rem` — `on-surface`
- Close (✕): `24px` icon button, `on-surface-variant`

---

## 4. Ward Popup (Leaflet)
- Max-width: `260px`
- Background: `surface-container-lowest`
- Border-radius: `8px`
- Shadow: ambient
- Content:
  - Ward name: `Inter 600 0.875rem`
  - Stats: `Inter 400 0.8125rem`
  - Unit link: `tertiary` color (#185EAF), underline on hover

---

## 5. Map Legend (floating)
- Position: bottom-left of map, margin `16px`
- Background: `surface-container-lowest` 90% opacity + blur
- Border-radius: `8px`
- Layout: vertical list of color dots + labels
- Font: `Inter 400 0.75rem`

---

## 6. Map Markers

### HQ Marker (Trụ sở)
- Icon: Gold star (#D4A017), `24px`
- Shadow: subtle gold glow

### Ward Polygons
- Fill: unit color at 20% opacity
- Stroke: unit color at 60% opacity, `2px`
- Hover: fill 40% opacity

### Route Lines
- Pattern: dashed (`8px dash, 6px gap`)
- Color: unit color, `3px` width
- Opacity: `0.7`

---

## 7. Mask (tỉnh lân cận)
- Fill: `#000000` at 50% opacity
- Tên tỉnh: `Inter 500 1rem` white, centered
