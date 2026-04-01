# Parallel Dispatch Protocol

> Lấy cảm hứng từ Superpowers `dispatching-parallel-agents`. Pattern cho wave execution.

## Khi Nào Dùng

- 2+ tasks ĐỘC LẬP không chia sẻ state
- Nhiều test files fail với root causes KHÁC NHAU
- Các subsystems hỏng RIÊNG BIỆT

## Khi KHÔNG Dùng

- Các failures LIÊN QUAN (fix 1 có thể fix others)
- Cần full system context
- Shared state giữa tasks
- Chưa rõ root cause (investigate trước, dispatch sau)

## Pattern

1. **IDENTIFY**: Xác định domains độc lập (không share state/files)
2. **CREATE**: Tạo focused prompt cho mỗi domain:
   - ONE clear problem domain
   - All context needed (self-contained)
   - Specific output expected
   - Constraints: what NOT to change
3. **DISPATCH**: 1 agent per problem domain
4. **REVIEW**: Verify không conflict → run full suite → integrate

## Agent Prompt Template

```markdown
## Task: [specific task]
## Scope: [files/modules can touch]
## Context: [relevant information]
## Constraints: DO NOT modify [protected files/modules]
## Expected Output: [what to return]
```

## Integration với Nexus Waves

- Wave execution = form of parallel dispatch
- Mỗi plan trong cùng wave = 1 independent domain
- Orchestrator verify wave independence trước khi dispatch

## Áp Dụng

- Orchestrator đọc protocol này trước wave execution
- Verify independence: nếu 2 plans trong cùng wave modify cùng file → TÁCH wave
