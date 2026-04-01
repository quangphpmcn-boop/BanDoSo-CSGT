---
name: design-output
description: "Full-output enforcement — bans placeholder patterns, forces complete code generation, handles token-limit splits cleanly."
risk: low
source: adapted
date_added: "2026-03-18"
---

# Design Output — Full-Output Enforcement

## When to Apply
- Mọi task yêu cầu output đầy đủ, không cắt xén
- Tạo files, components, hoặc design specs hoàn chỉnh
- Khi AI có xu hướng "lười" bỏ qua phần code

## Baseline

Treat every task as production-critical. Partial output = broken output. Optimize for completeness, not brevity. If asked for full file → deliver full file. If asked for 5 components → deliver 5 components. No exceptions.

## Banned Output Patterns

These are HARD FAILURES. Never produce:

**In code blocks:**
`// ...`, `// rest of code`, `// implement here`, `// TODO`, `/* ... */`, `// similar to above`, `// continue pattern`, `// add more as needed`, bare `...` standing in for omitted code

**In prose:**
"Let me know if you want me to continue", "I can provide more details if needed", "for brevity", "the rest follows the same pattern", "similarly for the remaining", "and so on" (when replacing actual content)

**Structural shortcuts:**
- Skeleton when request was for full implementation
- First and last section while skipping middle
- One example + description replacing repeated logic
- Describing what code should do instead of writing it

## Execution Process

1. **Scope** — Read full request. Count distinct deliverables. Lock that number
2. **Build** — Generate every deliverable completely. No partial drafts
3. **Cross-check** — Re-read original request. Compare deliverable count vs scope count. Add missing items

## Handling Long Outputs

When approaching token limit:
- Do NOT compress remaining sections
- Do NOT skip ahead to conclusion
- Write at full quality up to clean breakpoint (end of function/file/section)
- End with: `[PAUSED — X of Y complete. Send "continue" to resume from: next section name]`
- On "continue": pick up exactly where stopped. No recap, no repetition

## Quick Check

Before finalizing any response:
- [ ] No banned patterns appear anywhere
- [ ] Every requested item is present and finished
- [ ] Code blocks contain actual runnable code, not descriptions
- [ ] Nothing was shortened to save space
