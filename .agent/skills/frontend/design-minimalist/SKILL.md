---
name: design-minimalist
description: "Premium utilitarian minimalism — editorial/Notion-style UI with warm monochrome, serif contrast, bento grids, massive whitespace."
risk: low
source: adapted
date_added: "2026-03-18"
---

# Design Minimalist — Premium Editorial UI

Overlay skill cho taste-profile archetype "minimalist". Kích hoạt khi user chọn Minimalist Editorial.

## When to Apply
- Thiết kế editorial, document-centric interfaces
- Inspiration: Notion, Linear, Arc Browser
- User muốn clean, ultra-minimal, warm aesthetic

## Banned Elements

Strictly avoid:
- DO NOT use Inter, Roboto, or Open Sans
- DO NOT use generic icon libraries (Lucide thick, FontAwesome, Material)
- DO NOT use Tailwind default heavy shadows (shadow-md, shadow-lg)
- DO NOT use primary colored backgrounds for large sections
- DO NOT use gradients, neon colors, or 3D glassmorphism
- DO NOT use `rounded-full` for large containers or primary buttons
- DO NOT use emojis anywhere
- DO NOT use AI clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"

## Typographic Architecture

- **Primary Sans-Serif (Body/UI):** `Geist Sans`, `Switzer`, `SF Pro Display`, or `Helvetica Neue`
- **Editorial Serif (Hero/Quotes):** `Newsreader`, `Playfair Display`, `Instrument Serif`. Tight tracking (-0.02em), tight line-height (1.1)
- **Monospace (Code/Meta):** `Geist Mono`, `SF Mono`, `JetBrains Mono`
- **Text Colors:** Body never absolute black. Use off-black `#111111` or `#2F3437`. Secondary: muted gray `#787774`. Line-height `1.6`

## Color Palette (Warm Monochrome + Spot Pastels)

Color is a scarce resource:
- **Background:** Pure White `#FFFFFF` or Warm Bone `#F7F6F3`
- **Cards:** `#FFFFFF` or `#F9F9F8`
- **Borders:** Ultra-light `#EAEAEA` or `rgba(0,0,0,0.06)`
- **Accent Pastels** (tags, inline code, subtle highlights):
  - Pale Red: `#FDEBEC` (text: `#9F2F2D`)
  - Pale Blue: `#E1F3FE` (text: `#1F6C9F`)
  - Pale Green: `#EDF3EC` (text: `#346538`)
  - Pale Yellow: `#FBF3DB` (text: `#956400`)

## Component Specifications

- **Cards:** Flat, 1px `#EAEAEA` border. NO shadows unless ultra-diffuse (opacity < 0.05). Rounded none or `rounded-lg` max
- **Buttons:** Flat, small `px-3 py-1.5`, `text-sm`, `font-medium`. Ghost or outline preferred. NO gradient fills
- **Inputs:** Flat, 1px border, no inner shadow. Focus: subtle blue border, no glow
- **Tables:** Minimal. Hairline dividers only. Generous row height
- **Navigation:** Sidebar or top. Clean text links. Active state: bold weight or subtle background

## Layout Rules

- **Bento Grid:** Flat rectangular tiles, 1px hairline borders, generous inner padding
- **Whitespace:** Sections separated by massive gaps (py-16 to py-24)
- **Container:** max-w-3xl for content, max-w-5xl for layouts
- **Grid:** Never more than 3 columns. Often 1-2 columns for content focus

## Motion & Micro-Animations

Minimal and functional:
- Transitions: `150ms ease` for hover states
- Page transitions: subtle fade (opacity only)
- NO spring physics, NO scroll animations, NO parallax
- Focus on instant, responsive feel over flashy motion
