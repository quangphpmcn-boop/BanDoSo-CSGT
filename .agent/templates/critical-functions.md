# Critical Functions Template

> Inspired by Rune `logic-guardian`. Simplified — manual list thay vì auto-manifest.

## Mục đích

Liệt kê các functions/methods QUAN TRỌNG mà AI **KHÔNG ĐƯỢC XÓA** mà không hỏi user.
File này do user hoặc AI tạo, đặt tại `.nexus/critical-functions.md`.

## Cách sử dụng

1. **Tạo file** `.nexus/critical-functions.md` (copy template này)
2. **Liệt kê** các functions core — format bên dưới
3. AI đọc file này trước khi edit bất kỳ file nào được liệt kê
4. Nếu AI cần sửa/xóa function trong danh sách → **PHẢI hỏi user trước**

## Template cho `.nexus/critical-functions.md`

```markdown
# Critical Functions — KHÔNG XÓA MÀ KHÔNG HỎI USER

> Danh sách functions quan trọng. AI phải đọc trước khi edit file chứa chúng.
> Cập nhật: [YYYY-MM-DD]

## Core Business Logic
- `src/services/salary.ts::calculateTotalSalary` — tính lương tổng hợp
- `src/services/attendance.ts::processAttendanceRecord` — xử lý chấm công

## Data Layer
- `src/database/migrations.ts::runMigrations` — chạy migration DB
- `src/database/seed.ts::seedDefaultData` — seed dữ liệu mặc định

## Security
- `src/auth/validate.ts::validateLicense` — kiểm tra license
- `src/auth/encrypt.ts::encryptDatabase` — mã hóa SQLCipher
```

## Behavioral Rules Integration

Khi file `.nexus/critical-functions.md` tồn tại:
- Agent PHẢI đọc file trước khi edit bất kỳ file nào được liệt kê
- Agent PHẢI liệt kê functions sẽ GIỮ NGUYÊN trước khi edit
- Nếu cần xóa/thay đổi signature → PHẢI hỏi user
- Sau khi edit → verify functions vẫn còn trong file (post-edit check)

## Khi nào tạo file này

- `/init` → đề xuất tạo nếu dự án có business logic phức tạp
- User thủ công thêm functions quan trọng bất kỳ lúc nào
- `/review` → nếu phát hiện critical function chưa có trong list → gợi ý thêm
