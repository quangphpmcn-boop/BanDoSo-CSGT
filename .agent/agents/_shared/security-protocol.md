# Security Protocol

> Dedicated security protocol cho Nexus agents — inspired by Ruflo AIDefence module.

## Input Validation (Pre-Execute)

### Path Traversal Prevention
- **NEVER** accept paths containing `..` hoặc absolute paths outside project root
- **ALWAYS** resolve paths relative to project root trước khi đọc/ghi
- **BLOCK** access to: `.env`, `.git/config`, `**/credentials.*`, `**/.ssh/*`

### Command Safety
- **NEVER** execute destructive commands (`rm -rf`, `DROP TABLE`, `FORMAT`) mà không confirm user
- **ALWAYS** preview command output trước khi apply (dry-run khi có thể)
- **BLOCK** commands tải file từ URL untrusted

## Output Sanitization (Post-Execute)

### Secrets Detection
- API keys: patterns `sk-*`, `pk_*`, `AKIA*`, `ghp_*`, `gho_*`
- Passwords: `password=`, `passwd:`, `secret:`
- Connection strings: `mongodb+srv://`, `postgres://`, `mysql://` chứa credentials
- Tokens: `Bearer `, `token=`, JWT patterns (`eyJ*`)

### PII Audit
Kiểm tra trước khi commit:
- Số điện thoại, CMND/CCCD
- Email cá nhân (không phải project email)
- Địa chỉ cụ thể

## Pre-Commit Security Scan

Trước mỗi `git commit`, agent PHẢI kiểm tra:
1. **Scan staged files** cho patterns secret (xem trên)
2. **Check `.gitignore`** — đảm bảo `.env`, `*.key`, `*.pem` đã được ignore
3. **Review new dependencies** — flag nếu thêm package chưa verified
4. **No hardcoded credentials** — tìm `const password = `, `apiKey: "..."`

```markdown
### [SEC-001] Hardcoded API key in config
- **Loại**: security
- **Severity**: 🔴 Critical
- **Root cause**: Developer hardcoded key thay vì dùng env variable
- **Fix**: Move to .env, add .env to .gitignore
- **Prevention**: Pre-commit scan rule
```

## Áp dụng
- Mọi agent PHẢI đọc file này (thông qua behavioral-rules.md reference)
- Protocol này supplement behavioral-rules.md (rules #6-8)
- Vi phạm security → **STOP** execution, log, notify user
