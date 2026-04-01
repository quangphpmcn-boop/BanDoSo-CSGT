---
name: import-guard  
description: Kiểm tra imports/requires ảo — verify internal file exists, external package trong manifest
---

# Import Guard

> Inspired by Rune `hallucination-guard`. Simplified cho Nexus/Antigravity.

## When to Use
- Sau khi viết code mới có import statements
- Trong `/verify` Step 3 (Cross-Plan Integration Check)
- Khi thêm dependency mới vào `package.json` / `requirements.txt`

## Workflow

### Step 1: Extract Imports

Từ các files vừa thay đổi, tìm tất cả import statements:

| Pattern | Language |
|---------|----------|
| `import ... from '...'` | TypeScript/JavaScript |
| `require('...')` | CommonJS |
| `from ... import ...` | Python |
| `use ...` | Rust |

Phân loại:
- **Internal**: bắt đầu bằng `./`, `../`, `@/`, `~/` → verify file exists
- **External**: bare module names → verify trong manifest

### Step 2: Verify Internal Imports

Với mỗi internal import:
1. Resolve path (thử `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `index.*`)
2. Nếu file **KHÔNG tồn tại** → 🔴 **BLOCK**: `File '[path]' does not exist`
3. Nếu file tồn tại → verify symbol exported (nếu named import)
4. Symbol không tìm thấy → ⚠️ **WARN**: `'[name]' may not be exported from [path]`

### Step 3: Verify External Packages

Với mỗi external package:
1. Đọc manifest (`package.json` → `dependencies` + `devDependencies`, hoặc `pyproject.toml`, `requirements.txt`)
2. Nếu package **KHÔNG có** trong manifest → 🔴 **BLOCK**: `Package '[name]' not in dependencies`
3. Nếu package mới (thêm trong session này) → ⚠️ **WARN**: `New dependency '[name]' added — verify correct package name`

### Step 4: Report

```markdown
### Import Guard Report
- **Status**: PASS | WARN | BLOCK
- **Checked**: [count] imports ([internal] internal, [external] external)

| # | Import | Type | Verdict | Note |
|---|--------|------|---------|------|
| 1 | `./utils/format` | internal | ✅ PASS | file exists |
| 2 | `date-fns` | external | ✅ PASS | in package.json |
| 3 | `./hooks/useAuth` | internal | 🔴 BLOCK | file not found |
```

## Constraints
1. MUST verify mọi import — không skip vì "looks right"
2. MUST report BLOCK nếu file/package không tồn tại — claim evidence
3. NOT kiểm tra registry (npm view) — quá chậm cho local workflow
4. NOT kiểm tra API signatures — chỉ verify existence

## Integration Points
- `/verify` Step 3 → chạy import-guard trên changed files
- `/execute` Step 2b.6 → chạy sau mỗi task verify (optional)
- `/quick` → chạy nếu task tạo file mới

## Cost Profile
Lightweight — chỉ đọc files, không gọi external commands.
