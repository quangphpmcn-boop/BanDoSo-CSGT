# Design System — "The Sovereign Lens"

> Directorate Prime | Proposal C (Stitch AI) | Locked: 2026-03-31

## Creative North Star
**"The Sovereign Lens"** — UI cảm giác như lớp kính kiến trúc và giấy mịn xếp chồng. Gold accent #D4A017 trên nền grayscale tinh tế → prestige, truyền thống, quyền uy hiện đại.

## Brand
- **Logo**: Trống đồng vàng (`docs/trống đồng.jpg`) trên nền gold
- **Audience**: Ban Giám đốc Công an TP Hải Phòng

---

## Color Tokens

### Surface Hierarchy (3 layers)
| Token | Hex | Vai trò |
|-------|-----|---------|
| `surface` | `#F8F9FA` | Nền chính (Layer 1 — The Desk) |
| `surface-container` | `#EDEEEF` | Panel phụ (Layer 2 — The Folder) |
| `surface-container-low` | `#F3F4F5` | Content wells |
| `surface-container-lowest` | `#FFFFFF` | Cards nổi (Layer 3 — The Report) |
| `surface-container-high` | `#E7E8E9` | Active elements |

### Accent Colors
| Token | Hex | Vai trò |
|-------|-----|---------|
| `primary` | `#795900` | Text trên gold bg, gradient start |
| `primary-container` | `#D4A017` | **Gold chính** — buttons, active states, hero accents |
| `primary-fixed-dim` | `#F6BE39` | Gold sáng — hover states |
| `tertiary` | `#185EAF` | Accent xanh phụ — links, secondary actions |
| `tertiary-container` | `#72A9FF` | Badge info |
| `secondary` | `#725B29` | Warm secondary |
| `error` | `#BA1A1A` | Cảnh báo |
| `error-container` | `#FFDAD6` | Soft red badge bg |

### Text Colors
| Token | Hex | Vai trò |
|-------|-----|---------|
| `on-surface` | `#191C1D` | Text chính (**KHÔNG dùng #000**) |
| `on-surface-variant` | `#4F4634` | Text phụ |
| `outline` | `#817662` | Border mờ |
| `outline-variant` | `#D3C5AE` | Ghost borders (15% opacity) |
| `on-primary-container` | `#503A00` | Text trên gold bg (tone-on-tone luxury) |

### Gradients
- **Gold Signature**: `linear-gradient(45deg, #795900, #D4A017)` — cho primary buttons

---

## Typography

| Level | Font | Size | Weight | Dùng cho |
|-------|------|------|--------|---------|
| Display | **Public Sans** | 3.5rem | 700 | Hero stats |
| Headline | Public Sans | 1.75rem | 600 | Section headers |
| Title | **Inter** | 1.375rem | 500 | Card titles |
| Body | Inter | 0.875rem | 400 | Nội dung chính |
| Label | Inter | 0.75rem | 600 | Uppercase metadata |

---

## Elevation & Depth

### "No-Line" Rule
> **1px solid borders BỊ CẤM** cho sectioning. Dùng background color shifts thay thế.

| Kỹ thuật | Cách dùng |
|---------|----------|
| **Tonal Layering** | Stack layers: lowest card trên low section → "natural lift" |
| **Ambient Shadow** | Float elements: `0 8px 24px rgba(25,28,29,0.06)` — tinted shadow |
| **Ghost Border** | Khi cần: `outline-variant` ở **15% opacity** |
| **Glassmorphism** | Fixed headers: `surface 85% opacity + backdrop-blur(20px)` |

---

## Corner Radius
| Context | Radius |
|---------|--------|
| Standard UI | `0.375rem` (6px) |
| Status indicators, chips | `full` (999px) |
| Cards | `0.5rem` (8px) |

---

## Spacing
| Token | Value | Dùng cho |
|-------|-------|---------|
| spacing-4 | 0.9rem | Internal card padding |
| spacing-8 | 2rem | Section gaps |
| spacing-10 | 2.25rem | Container padding |
| spacing-16 | 3.5rem | Major module gaps |

---

## Component Specs

### Active Sidebar Item
- **Gold bar**: 4px vertical `primary-container` (#D4A017) bên trái
- **Background**: shift lên `surface-container-lowest` (#FFFFFF)

### Buttons
| Type | Style |
|------|-------|
| Primary | Gold gradient bg, white text, uppercase label |
| Secondary | Ghost — no bg, outline-variant 20% |
| Tertiary | Text-only, primary color |

### Toggle "Hiện tại" / "Quy hoạch"
- Segmented control với tonal layering
- Active: `surface-container-lowest` + ambient shadow

---

## Do's & Don'ts

### ✅ Do
- Dùng Gold #D4A017 CHỈ cho actionable items hoặc "Active" states
- Dùng whitespace rộng giữa modules (spacing-16)
- Text trên gold bg dùng `on-primary-container` (#503A00) — tone-on-tone

### ❌ Don't
- KHÔNG dùng `#000000` — luôn dùng `on-surface` (#191C1D)
- KHÔNG dùng 3-column equal cards — thử asymmetric grid
- KHÔNG dùng heavy borders — dùng background shift thay thế
