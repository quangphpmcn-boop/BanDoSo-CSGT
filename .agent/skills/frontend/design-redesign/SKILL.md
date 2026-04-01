---
name: design-redesign
description: "Existing project UI audit + upgrade framework. Diagnose generic patterns and apply targeted fixes without rewriting from scratch."
risk: low
source: adapted
date_added: "2026-03-18"
---

# Design Redesign — Audit & Upgrade Existing UI

## When to Apply
- Cải thiện UI hiện tại mà không viết lại từ đầu
- Audit design quality của codebase có sẵn
- Nâng cấp UI từ generic lên premium

## Workflow

1. **Scan** — Đọc codebase. Xác định framework, styling method, design patterns hiện tại
2. **Diagnose** — Chạy audit bên dưới. Liệt kê mọi generic pattern, weak point, missing state
3. **Fix** — Apply targeted upgrades với stack hiện tại. Không rewrite from scratch

## Design Audit Checklist

### Typography
- [ ] Font selection: generic (Inter, Roboto) hay có character?
- [ ] Font weights: chỉ dùng 1-2 hay đủ hierarchy?
- [ ] Line-height: too tight hay too loose?
- [ ] Max line length: có giới hạn 65-75 ký tự?
- [ ] Heading tracking: có tight tracking cho headlines?

### Color & Surface
- [ ] Palette consistency: một palette hay mix ngẫu nhiên?
- [ ] Contrast ratios: đáp ứng WCAG 4.5:1?
- [ ] Shadow quality: generic drop-shadow hay tinted?
- [ ] Gradient usage: tasteful hay AI neon?
- [ ] Dark/light mode: cả hai work correctly?

### Layout
- [ ] Grid system: consistent hay ad-hoc?
- [ ] Spacing scale: systematic (4/8/12/16) hay random?
- [ ] Section padding: generous hay cramped?
- [ ] Container width: consistent max-width?
- [ ] Mobile responsive: graceful degradation?

### Interactivity & States
- [ ] Hover effects: subtle hay layout-shifting?
- [ ] Loading states: skeleton hay spinner?
- [ ] Empty states: designed hay missing?
- [ ] Error states: inline hay alert box?
- [ ] Transitions: smooth (150-300ms) hay instant?

### Content
- [ ] Placeholder names: realistic hay "John Doe"?
- [ ] Numbers: organic hay round (99.99%)?
- [ ] Copy: specific hay AI filler (Elevate, Seamless)?
- [ ] Icons: SVG hay emoji?

### Strategic Omissions (AI Thường Quên)
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Scroll restoration
- [ ] Loading skeletons matching layout
- [ ] Responsive images (srcset, lazy)
- [ ] prefers-reduced-motion

## Fix Priority

1. **Typography first** — biggest visual impact, smallest code change
2. **Spacing/padding second** — breathing room transforms perception
3. **Color/surface third** — palette refinement
4. **Motion last** — polish after structure is right

## Upgrade Techniques

### Typography Upgrades
- Replace generic fonts (Inter → Geist/Outfit/Satoshi)
- Add tight tracking to headlines (-0.02em to -0.04em)
- Establish clear type scale (12/14/16/20/24/32/48)

### Layout Upgrades
- Add max-width containers
- Increase section padding (py-24 minimum for sections)
- Convert equal grids to asymmetric where beneficial

### Motion Upgrades
- Add transition-colors/opacity to interactive elements
- Add stagger delays to list items on load
- Replace linear easing with cubic-bezier

### Surface Upgrades
- Replace generic shadows with tinted, diffuse shadows
- Add subtle inner borders to glass elements
- Ensure cards have generous inner padding

## Rules
- Work WITH existing code, not against it
- Make targeted changes, not massive rewrites
- Test both light and dark mode after each change
- prioritize changes that give the most visual impact for the least code change
