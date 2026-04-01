# Evidence-First Protocol

> Lấy cảm hứng từ Superpowers `verification-before-completion`. Áp dụng cho MỌI agent.

## Iron Law

**NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.**

## Gate Function

TRƯỚC KHI claim bất kỳ status nào (pass, done, fixed, working):

1. **IDENTIFY**: Lệnh nào chứng minh claim? (test, build, run, lint)
2. **RUN**: Thực thi lệnh (fresh, complete — không dùng cache cũ)
3. **READ**: Đọc TOÀN BỘ output + kiểm tra exit code
4. **VERIFY**: Output có confirm claim không?
5. **ONLY THEN**: Phát biểu claim

> Nếu KHÔNG có lệnh nào chứng minh → claim là INVALID.

## Red Flags — DỪNG LẠI NGAY

| # | Dấu hiệu | Hành động đúng |
|---|-----------|----------------|
| 1 | "Should work now" | RUN verification |
| 2 | "I'm confident" | Confidence ≠ evidence |
| 3 | "Tôi đã sửa rồi" mà chưa run test | Run test TRƯỚC |
| 4 | Expressing satisfaction before verification | Verify TRƯỚC khi hài lòng |
| 5 | "Linter passed" → claim done | Linter ≠ compiler ≠ runtime |
| 6 | Partial check → claim full pass | Partial proves nothing |
| 7 | "Chỉ đổi text/style" → skip verify | Mọi thay đổi cần verify |
| 8 | "Giống lần trước" → skip test | Mỗi lần phải test lại |
| 9 | "Logic đơn giản" → skip | Đơn giản = 30 giây verify |
| 10 | "Build thành công" → deploy | Build ≠ runtime correctness |
| 11 | "Tests cũ vẫn pass" → done | Cần test MỚI cho feature mới |
| 12 | Claim fix mà chưa reproduce lỗi gốc | Reproduce → Fix → Verify |

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN the verification |
| "I'm confident this is correct" | Confidence ≠ evidence |
| "Just this once, I'll skip" | No exceptions. Ever. |
| "Linter passed" | Linter ≠ compiler ≠ runtime |
| "Partial check is enough" | Partial proves partial |
| "The change is trivial" | Trivial changes still break things |
| "I checked mentally" | Mental model ≠ reality |
| "Time pressure" | Rework costs more than verification |

## Common Verification Types

| Claim | Verification Command |
|-------|---------------------|
| "Tests pass" | `npm test` / `pytest` / `flutter test` (FULL suite) |
| "Build succeeds" | `npm run build` / `flutter build` (FRESH build) |
| "Bug is fixed" | Reproduce → Fix → Verify fix → Verify no regression |
| "Requirements met" | Demo each requirement individually |
| "No errors" | Run app + exercise all changed paths |

## Default Expectation

> **Expect minimum 3-5 issues per review.** Nếu tìm được 0 issues ở lần đầu review → xem lại kỹ hơn. "Zero issues" trên first pass là dấu hiệu review chưa đủ sâu.

## Áp Dụng

- Protocol này ĐỌC BỞI mọi agent/workflow có bước verify
- Vi phạm → ghi vào reasoning-bank (type: ERROR, tags: ["evidence-violation"])
- Mọi agent PHẢI đọc file này trước khi claim completion

## Claim Audit Template (v2.1 — inspired by Rune completion-gate)

> Trước khi declare "done"/"complete"/"fixed", agent PHẢI tạo bảng Claim Audit:

```markdown
### Claim Audit — [Task/Feature Name]

| # | Claim | Evidence | Verdict |
|---|-------|----------|---------|
| 1 | "Tests pass" | `npm test` → "42 passed, 0 failed" | ✅ CONFIRMED |
| 2 | "Build succeeds" | `npm run build` → exit code 0 | ✅ CONFIRMED |
| 3 | "No lint errors" | chưa chạy linter | ❌ UNCONFIRMED |

**Overall**: CONFIRMED / UNCONFIRMED / CONTRADICTED
```

### Verdict Rules
- **CONFIRMED**: Evidence có → output support claim
- **UNCONFIRMED**: Không có evidence (chưa run command) → PHẢI run trước khi proceed
- **CONTRADICTED**: Evidence có nhưng NGƯỢC claim → PHẢI fix

### Bắt buộc khi nào
- `/verify` workflow → Step 6 (User Acceptance) → **PHẢI** kèm Claim Audit table
- `/execute` workflow → khi task verify fail → liệt kê claims vs evidence
- `/quick` workflow → trước khi báo "done" → ít nhất ghi 1-line evidence

> Agent PHẢI liệt kê **cụ thể claim nào** + **command output nào** chứng minh. "I verified" = INVALID.
