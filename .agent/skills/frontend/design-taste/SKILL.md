---
name: design-taste
description: "Anti-slop design intelligence — creative arsenal, configurable dials, AI bias correction, forbidden patterns, pre-delivery checklist. Merged from taste-skill + ui-ux-pro-max."
risk: low
source: merged
date_added: "2026-03-18"
---

# Design Taste — Anti-Slop Design Intelligence

Skill chủ đạo cho design workflow. Kết hợp triết lý chống generic từ taste-skill với database/checklist từ ui-ux-pro-max.

## When to Apply

- Thiết kế UI mới (screens, components, pages)
- Tạo design system, chọn palette/typography
- Review UI code cho visual quality
- Tạo landing pages, dashboards, marketing sites

## 1. Configurable Dials

3 dials điều chỉnh output theo context dự án. Giá trị mặc định: **(8, 6, 4)**. Luôn lắng nghe user và điều chỉnh theo yêu cầu.

### DESIGN_VARIANCE (1-10)
- **1-3 (Predictable):** Symmetric grids, centered layouts, equal paddings
- **4-7 (Offset):** Overlapping elements, varied aspect ratios, left-aligned headers
- **8-10 (Asymmetric):** Masonry, CSS Grid fractional units, massive empty zones
- **MOBILE OVERRIDE:** Levels 4-10 MUST fall back to single-column on viewports < 768px

### MOTION_INTENSITY (1-10)
- **1-3 (Static):** No auto animations. CSS `:hover` and `:active` only
- **4-7 (Fluid CSS):** `transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`, `animation-delay` cascades, `transform` + `opacity` only
- **8-10 (Advanced):** Scroll-triggered reveals, parallax, spring physics. NEVER use `window.addEventListener('scroll')` — use framework scroll hooks

### VISUAL_DENSITY (1-10)
- **1-3 (Art Gallery):** Massive whitespace. Everything feels expensive
- **4-7 (Daily App):** Normal spacing for standard web apps
- **8-10 (Cockpit):** Tiny paddings. No card boxes — just 1px dividers. Monospace for all numbers

## 2. Architecture Conventions

> Stack-agnostic rules. Adapt to project's actual tech stack.

- **DEPENDENCY VERIFICATION [MANDATORY]:** Before importing ANY 3rd party library, check `package.json` / `requirements.txt` / `pubspec.yaml`. If missing, output install command first.
- **Styling Policy:** Use project's existing CSS approach (Tailwind, vanilla CSS, etc). If Tailwind, check version first — don't use v4 syntax in v3.
- **ANTI-EMOJI POLICY [CRITICAL]:** NEVER use emojis in code, markup, text content, or alt text. Use SVG icons from consistent icon libraries.
- **Responsiveness:**
  - Standardize breakpoints per framework conventions
  - Contain layouts with max-width containers
  - **Viewport Stability [CRITICAL]:** NEVER use `h-screen` for full-height sections. Use `min-h-[100dvh]` or framework equivalent
  - **Grid over Flex-Math:** Use CSS Grid for multi-column layouts, not complex flexbox percentage math

## 3. Design Engineering Directives (Bias Correction)

LLMs have statistical biases toward specific UI clichés. Proactively correct:

### Rule 1: Deterministic Typography
- **Headlines:** Large, tight tracking, tight leading
- **ANTI-SLOP:** Discourage `Inter` for premium/creative vibes. Force unique character: `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`, or similar
- **Serif Ban:** Serif fonts are BANNED for Dashboard/Software UIs — Sans-Serif only
- **Body:** Standard size, relaxed leading, max 65 characters per line

### Rule 2: Color Calibration
- Max 1 Accent Color. Saturation < 80%
- **THE LILA BAN:** AI Purple/Blue aesthetic is BANNED. No purple button glows, no neon gradients
- Use neutral bases (Zinc/Slate) with singular high-contrast accents
- **COLOR CONSISTENCY:** One palette for the entire project

### Rule 3: Layout Diversification
- **ANTI-CENTER BIAS:** When DESIGN_VARIANCE > 4, centered Hero sections are BANNED
- Force Split Screen, Left-aligned, or Asymmetric structures

### Rule 4: Anti-Card Overuse
- When VISUAL_DENSITY > 7, generic card containers are BANNED
- Use `border-t`, `divide-y`, or negative space instead
- Cards ONLY when elevation communicates hierarchy

### Rule 5: Interactive UI States
Must implement full interaction cycles:
- **Loading:** Skeletal loaders matching layout sizes (not generic spinners)
- **Empty States:** Beautiful empty states indicating how to populate
- **Error States:** Clear, inline error reporting
- **Tactile Feedback:** On `:active`, use subtle scale/translate for physical push feel

### Rule 6: Data & Form Patterns
- Label ABOVE input. Helper text optional. Error text below. Standard gap for input blocks

## 4. Creative Proactivity (Anti-Slop)

Actively combat generic AI designs:

- **"Liquid Glass" Refraction:** For glassmorphism — go beyond `backdrop-blur`. Add 1px inner border + subtle inner shadow for physical edge refraction
- **Magnetic Micro-physics (MOTION > 5):** Buttons that pull toward cursor. Use framework motion values OUTSIDE render cycle for performance
- **Perpetual Micro-Interactions (MOTION > 5):** Continuous infinite micro-animations (Pulse, Typewriter, Float, Shimmer) in components. Premium Spring Physics for all interactive elements — no linear easing
- **Staggered Orchestration:** Don't mount lists instantly. Use stagger delays for sequential waterfall reveals

## 5. Performance Guardrails

- **DOM Cost:** Grain/noise filters only on fixed, pointer-events-none pseudo-elements. NEVER on scrolling containers
- **Hardware Acceleration:** Animate only `transform` and `opacity`. Never `top`, `left`, `width`, `height`
- **Z-Index Restraint:** Use z-indexes strictly for systemic layer contexts (Navbar, Modal, Overlay)

## 6. Creative Arsenal Reference

Pull from this library when designing. Adapt to project's framework.

| Category | Concepts |
|----------|----------|
| **Hero** | Asymmetric hero, split screen, background fade into color |
| **Navigation** | Dock magnification, magnetic button, dynamic island, floating speed dial, mega menu |
| **Layout** | Bento grid, masonry, split screen scroll, curtain reveal |
| **Cards** | Parallax tilt, spotlight border, glassmorphism, holographic foil, morphing modal |
| **Scroll** | Sticky stack, horizontal scroll hijack, zoom parallax, scroll progress path |
| **Gallery** | Coverflow carousel, accordion slider, hover image trail, glitch effect |
| **Typography** | Kinetic marquee, text mask reveal, text scramble, circular text path |
| **Micro** | Particle button, skeleton shimmer, directional hover, ripple click, mesh gradient |

## 7. AI Tells (Forbidden Patterns)

Strictly avoid these AI design signatures:

### Visual
- NO Neon/Outer Glows — use inner borders or tinted shadows
- NO Pure Black (#000000) — use Off-Black, Zinc-950, Charcoal
- NO Oversaturated Accents — desaturate to blend with neutrals
- NO Excessive Gradient Text on large headers
- NO Custom Mouse Cursors

### Typography
- NO Inter/Roboto/Arial for premium designs
- NO Oversized H1s that scream — control hierarchy with weight and color
- Serif ONLY for creative/editorial. NEVER on dashboards

### Layout
- NO 3-Column Equal Cards — use zig-zag, asymmetric grid, or horizontal scroll
- Padding and margins must be mathematically perfect

### Content (The "Jane Doe" Effect)
- NO Generic Names (John Doe, Sarah Chan) — use creative, realistic names
- NO Generic Avatars — use creative photo placeholders
- NO Fake Numbers (99.99%, 50%) — use organic data (47.2%, +1 (312) 847-1928)
- NO Startup Slop Names (Acme, Nexus, SmartFlow) — invent premium brand names
- NO Filler Words (Elevate, Seamless, Unleash, Next-Gen) — use concrete verbs

### External Resources
- NO Broken Unsplash Links — use reliable placeholders like picsum.photos
- Component libraries must be CUSTOMIZED, never in default state

## 8. Pre-Delivery Checklist (Quality Assurance)

### Accessibility (CRITICAL)
- [ ] Color contrast ≥ 4.5:1 for normal text
- [ ] Visible focus rings on interactive elements
- [ ] Descriptive alt text for meaningful images
- [ ] aria-label for icon-only buttons
- [ ] Tab order matches visual order
- [ ] Form inputs have labels

### Touch & Interaction (CRITICAL)
- [ ] Touch targets ≥ 44x44px
- [ ] Click/tap for primary interactions (not hover-only)
- [ ] Disable button during async ops
- [ ] Clear error messages near problem area
- [ ] cursor-pointer on all clickable elements

### Visual Quality
- [ ] No emojis as icons (SVG only)
- [ ] Consistent icon set
- [ ] Hover states don't cause layout shift
- [ ] Smooth transitions (150-300ms)

### Layout
- [ ] Floating elements have proper edge spacing
- [ ] No content behind fixed navbars
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile

### Light/Dark Mode
- [ ] Light mode text has sufficient contrast
- [ ] Glass/transparent elements visible in light mode
- [ ] Borders visible in both modes

## 9. Design System Database

Search-based design recommendations via Python scripts.

### Usage
```bash
# Generate complete design system
python3 scripts/search.py "{keywords}" --design-system -p "{project_name}" -f markdown

# Search specific domain
python3 scripts/search.py "{keyword}" --domain {domain} [-n {max_results}]

# Stack-specific guidelines
python3 scripts/search.py "{keyword}" --stack {stack}
```

### Available Domains
| Domain | Use For |
|--------|---------|
| `product` | Product type recommendations |
| `style` | UI styles, colors, effects |
| `typography` | Font pairings |
| `color` | Color palettes by product type |
| `landing` | Page structure, CTA strategies |
| `chart` | Chart types, library recommendations |
| `ux` | Best practices, anti-patterns |

### Available Stacks
`html-tailwind` (default), `react`, `nextjs`, `vue`, `svelte`, `swiftui`, `react-native`, `flutter`, `shadcn`

## 10. Pre-Flight Check

Before finalizing ANY design output:

- [ ] Dials (VARIANCE/MOTION/DENSITY) reflected correctly?
- [ ] Mobile layout collapse guaranteed for high-variance designs?
- [ ] Full-height sections use `min-h-[100dvh]` not `h-screen`?
- [ ] Empty, loading, and error states provided?
- [ ] Cards omitted in favor of spacing where possible?
- [ ] No AI Tell patterns present?
- [ ] Production-ready: clean, visually striking, meticulously refined?
