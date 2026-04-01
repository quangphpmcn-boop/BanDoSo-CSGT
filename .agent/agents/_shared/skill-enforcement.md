# Skill Enforcement Protocol

> Lấy cảm hứng từ Superpowers `using-superpowers`. Áp dụng TRƯỚC mọi response.

## Iron Rule

**TRƯỚC MỌI RESPONSE, kiểm tra: "Có skill nào áp dụng không?"**
Nếu dù chỉ 1% khả năng skill áp dụng → ĐỌC skill TRƯỚC, rồi mới respond.

## Skill Priority

1. **Process skills first** — protocols, workflows, behavioral-rules
2. **Domain skills** — frontend, backend, testing, database (task-specific)
3. **Tool skills** — MCP tools, Serena, Context7 (khi dùng tools)

## Lookup Flow

```
Task nhận → Check SKILL-INDEX.md → Match keywords → Load skill(s) → Execute
```

1. Đọc `.agent/skills/SKILL-INDEX.md` Quick Lookup table
2. Match task keywords với skill keywords
3. Load matched skill(s) — đọc SKILL.md của category
4. Áp dụng skill-specific rules vào execution

## Red Flags — Bạn Đang Rationalize Nếu:

| Rationalization | Reality |
|----------------|---------|
| "Tôi đã biết cái này" | Skills chứa project-specific rules |
| "Task đơn giản" | Task đơn giản = nhiều conventions nhất |
| "Skill không áp dụng" | Đọc skill TRƯỚC, rồi mới quyết định |
| "Tôi sẽ check sau" | Sau là quá muộn — conventions đã bị vi phạm |
| "Sẽ làm chậm tiến độ" | Conventions tiết kiệm rework time |
| "Chỉ sửa 1 dòng" | 1 dòng sai pattern = tech debt |

## Anti-Pattern

> "This Is Too Simple To Need A Skill Check" → **SAI.**
> Simple tasks có nhiều conventions nhất. Complex tasks tự enforce qua complexity.

## Áp Dụng

- Orchestrator kiểm tra skill check trước mỗi agent invocation
- Usage-log ghi tên skills đã dùng (specific name, không ghi category)
- Vi phạm → ghi reasoning-bank (type: ERROR, tags: ["skill-enforcement-violation"])
