---
description: Xác minh công việc hoàn thành — kiểm tra tự động + nghiệm thu người dùng
---

# /nexus:verify [phase_number] — Phase Verification

## Iron Law

> **NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.**
> Đọc `evidence-first.md` — mọi claim PHẢI có evidence (command output, test result).

## Prerequisites
- Load profile: **review** (xem `context-loading.md`)
- Read `.nexus/requirements.md` → acceptance criteria
- Read `_shared/skill-enforcement.md` → skill check
- Read `_shared/behavioral-rules.md` → file discipline, code integrity
- **Memory read**: `.nexus/memory/results-{phase}-{wave}.md` (nếu tồn tại)
- **Spec read (v3.6)**: `.nexus/phases/phase-{N}/spec.md` (nếu tồn tại) → dùng cho requirement coverage check và spec drift detection

## Steps

### Step 1: Requirement Coverage Check
For each requirement in this phase:
- [ ] Has at least one completed plan covering it
- [ ] Plan summary confirms requirement addressed
- [ ] No gaps between requirement and implementation

**Initialize tracking:**
```
TRACKING: Agents: [reviewer] | Skills: [] ⛔ KHÔNG "nexus" | MCP Tools: [] | Sự cố: []
```

### Step 1.5: Phase Velocity Warning (v3.7)

> Auto-check tốc độ hoàn thành phases — phát hiện batch processing thiếu kiểm soát.

1. **Đọc `roadmap.md`** → liệt kê phases có `✅ Done` và ngày completed
2. **Count phases completed today** (hoặc cùng ngày với phase đang verify)
3. **Verdict**:
   - 1-2 phases/ngày → ✅ Bình thường
   - 3-4 phases/ngày → `⚠️ High velocity: {N} phases completed today. Consider deeper functional verification in Step 2.5.`
   - 5+ phases/ngày → `🔴 Extreme velocity: {N} phases in one day. STRONGLY recommend thorough functional testing before accepting.`
4. **Advisory** — không block, nhưng hiển thị cho user

> Phases phức tạp (>3 plans, >10 files) completed cùng ngày → escalate severity thêm 1 bậc.

### Step 1.7: Auto-Detect Test Commands (Pre-Verify Hook)

Tự động phát hiện cách chạy test/build/lint từ project config:

| File | Check for | Command |
|------|-----------|----------|
| `package.json` | `scripts.test`, `scripts.build`, `scripts.lint` | `npm run test/build/lint` |
| `pubspec.yaml` | Flutter project | `flutter analyze`, `flutter test` |
| `pyproject.toml` | pytest/ruff config | `pytest`, `ruff check .` |
| `Makefile` | `test`, `build`, `lint` targets | `make test/build/lint` |
| `Cargo.toml` | Rust project | `cargo test`, `cargo clippy` |

> Nếu không tìm thấy config → dùng commands từ plan `<verification>` section. Nếu plan cũng không có → hỏi user.

### Step 2: Automated Verification (Evidence Required)
Run verification steps from each plan's `<verification>` section:
- Build check (compiles without errors)
- Test execution (all tests pass)
- Lint check (no new warnings)

**Evidence Rule:** Mỗi check PHẢI:
1. **RUN** command (fresh, complete — không dùng cache)
2. **READ** full output + exit code
3. **CITE** output khi claim pass/fail

> ⛔ "Should pass" = KHÔNG CHẤP NHẬN. Phải có output.

### Step 2.5: Functional Verification (BẮT BUỘC — v3.7)

> ⛔ **IRON RULE**: Build pass ≠ Feature complete. Agent PHẢI demo từng requirement.

Step 2 chỉ chứng minh "code compiles". Step này chứng minh "features work as specified".

1. **Load requirements**: đọc `requirements.md` → lọc REQ-xxx thuộc phase đang verify
2. **For each REQ**:
   a. **Extract expected behaviors** từ requirement description + spec.md
   b. **Verify implementation exists**:
      - Code path cho feature tồn tại? (search for handler, component, route)
      - UI component render đúng? (inspect JSX/template)
      - Backend endpoint xử lý đúng? (inspect handler logic)
   c. **Run functional check** (chọn phương pháp phù hợp):
      - **App-level**: run app → navigate → exercise feature → capture result
      - **Code-level**: trace code path từ route → handler → DB → response
      - **Browser-level**: nếu web app → open browser → interact → verify
   d. **Record verdict**: PASS / PARTIAL / FAIL + evidence
3. **Tạo Functional Verification Table**:

```
### Functional Verification — Phase {N}
| REQ | Expected Behavior | Verification Method | Evidence | Verdict |
|-----|-------------------|--------------------|-----------|---------|
| REQ-001 | CRUD đơn vị đa cấp | Code trace + DB check | Handler exists, 3-level tree works | ✅ PASS |
| REQ-002 | 53 fields CBCS | UI field count vs spec | Form has 15/53 fields | 🔴 FAIL |
```

4. **Verdict**:
   - ALL PASS → proceed to Step 2.7
   - ANY PARTIAL → `⚠️ Partial implementation: [REQ list]. Document gaps.`
   - ANY FAIL → `🔴 BLOCKING: [REQ list] not implemented. Cannot proceed. Create follow-up plan.`

> **FAIL = BLOCKING** — phase KHÔNG được đánh dấu complete khi có REQ FAIL.
> **PARTIAL = WARNING** — phase có thể proceed nếu user explicitly accepts gaps.

### Step 2.7: Completeness Audit (BẮT BUỘC — v3.7)

> Kiểm tra structural completeness — field coverage giữa DB schema, UI forms, và requirements.

1. **Scan DB schema** → đếm fields per entity (migration files hoặc DB inspect)
2. **Scan UI forms** → đếm form fields per entity (JSX/template files)
3. **Scan requirements** → đếm expected fields per entity (từ requirements.md hoặc spec.md)
4. **Compare** và tạo Completeness Table:

```
### Completeness Audit — Phase {N}
| Entity | DB Fields | UI Fields | REQ Fields | Coverage | Status |
|--------|-----------|-----------|------------|----------|--------|
| Personnel (CBCS) | 53 | 15 | 53 | 28% | 🔴 FAIL |
| Personnel (LĐHĐ) | 29 | 12 | 29 | 41% | 🔴 FAIL |
| Units | 7 | 7 | 7 | 100% | ✅ PASS |
```

5. **Detect code stubs**:
   - Search for: `# placeholder`, `# TODO`, `# FIXME`, `// TODO`, `// FIXME`
   - Search for: stub functions (empty body, `pass`, `return null`, `throw new Error('not implemented')`)
   - Se có → liệt kê trong report

6. **Verdict**:
   - ALL entities coverage ≥ 80% + 0 stubs → ✅ PASS
   - ANY entity coverage 50-79% → `⚠️ WARNING: [entity] at {X}% coverage`
   - ANY entity coverage < 50% → `🔴 FAIL: [entity] at {X}% coverage — incomplete implementation`
   - Stubs found → `⚠️ {N} placeholder/TODO found — must resolve before completion`

> **FAIL = BLOCKING** — entity dưới 50% coverage = chưa implement đủ.
> Skip audit nếu phase không có data entities (VD: config-only, documentation phases).

> **ON VERIFY FAIL** → Thêm vào tracking "Sự cố" trước khi tiến hành fix.

### Step 3: Cross-Plan Integration Check
Verify plans work together:
- No conflicting file changes
- API contracts match between consumer and provider
- No broken imports or references
- If design exists: UI matches wireframes, design tokens, responsive breakpoints
- **ck integration scan (v3.7)**: nếu ck khả dụng → `semantic_search("breaks interface contract")` tìm breaking changes ngoài scope grep

**Context7 API Verification** (BẮT BUỘC nếu code dùng thư viện ngoài):
- Với thư viện chính trong phase → gọi `resolve-library-id` + `query-docs`
- So sánh API usage trong code vs docs hiện tại → phát hiện deprecated/breaking changes
- Track vào MCP Tools: `context7 ({library}: API verification)`

### Step 3.5: Context7 Compliance Check (BẮT BUỘC)

> Kiểm tra xem thư viện ngoài có được tra Context7 đầy đủ trong quá trình plan + execute.

1. **Scan dependency files** → liệt kê tất cả thư viện ngoài (requirements.txt, package.json, etc.)
2. **Đọc Context7 checklist** → `.nexus/memory/context7-checklist.md`
3. **Cross-reference plan files** → kiểm tra `<context7-checklist>` đã điền cho mỗi plan
4. **Cross-reference usage log** → `.nexus/logs/usage-log.md` field `MCP Tools` có `context7` entries
5. **Tính compliance score**:

```
Context7 Compliance: {X}/{Y} thư viện đã tra ({Z}%)
  🔴 Chưa tra: {danh sách thư viện bị thiếu}
  ✅ Đã tra: {danh sách thư viện đã check}
```

6. **Verdict**:
   - Score ≥ 80% → ✅ PASS
   - Score 50-79% → ⚠️ WARNING — liệt kê thư viện bị bỏ sót, khuyến nghị tra bổ sung
   - Score < 50% → 🔴 FAIL — yêu cầu quay lại tra Context7 cho thư viện quan trọng

> Compliance Check KHÔNG block verification — advisory, nhưng hiển thị cho user biết.

### Step 4: Quality Gate
Invoke Reviewer agent → **track agent**:
- Code quality review on changed files
- Security quick scan
- Performance review (if applicable)
- Accessibility review (if applicable)

### Step 5: Gap Analysis
Identify any gaps:
- Requirements partially implemented → create follow-up plan
- Edge cases uncovered → add to requirements
- Technical debt introduced → log as todo

> Gaps found → document in gap analysis for future phases.

### Step 5.3: Phantom Completion Detection (v3.6)

> Inspired by spec-kit `verify-tasks`. Phát hiện tasks đánh dấu `[x]` nhưng không có implementation thực sự.

1. **Load task board**: đọc `.nexus/memory/task-board.md` → liệt kê tasks đánh dấu `[x]`
2. **Load plans**: đọc plan XML files → extract `<files>` tag cho mỗi task
3. **Cross-check** với actual changes:
   - `git diff --stat HEAD~{N}` — file thuộc task có thay đổi thực sự?
   - Kiểm tra files khai báo trong `<files>` tag tồn tại trên disk?
   - `<verify>` step — có evidence đã run? (evidence trong log hoặc summaries)
4. **Tạo Phantom Detection Table**:

```
### Phantom Detection — Phase {N}
| Task | Planned Files | Changed? | Verify Evidence? | Status |
|------|--------------|----------|------------------|--------|
| Task 1 | src/api.py | ✅ Yes | ✅ Yes | REAL |
| Task 2 | src/model.py | ❌ No | ❌ No | PHANTOM |
```

5. **Verdict**:
   - 0 PHANTOM → skip silently
   - 1+ PHANTOM → `⚠️ Phantom completion detected: [task names]. Re-verify or un-mark.`
   - PHANTOM tasks PHẢI được giải quyết trước khi Claim Audit (Step 5.5)

> **Khi nào skip**: không có `task-board.md`, không dùng git, hoặc plan không có `<files>` tags.

### Step 5.5: Claim Audit (BẮT BUỘC — v2.1)

> Inspired by Rune `completion-gate`. Kiểm chứng mọi claims bằng evidence.

1. **Thu thập claims**: liệt kê tất cả claims agent đã phát biểu (tests pass, build ok, fixed...)
2. **Match evidence**: với mỗi claim → tìm command output tương ứng (stdout từ Bash)
3. **Tạo Claim Audit table** theo format trong `evidence-first.md` → "Claim Audit Template"
4. **Evaluate**:
   - ALL CONFIRMED → proceed to Step 6
   - ANY UNCONFIRMED → run missing verification, cập nhật table
   - ANY CONTRADICTED → fix trước, re-verify

> Claim Audit table PHẢI được trình bày trong Step 6 (User Acceptance).

### Step 5.7: Score Patterns (Reasoning Bank)

Cập nhật reasoning-bank patterns dựa trên kết quả verify:

1. **Read** `.nexus/memory/reasoning-bank.json`
2. **For each pattern** được tạo trong phase này (từ execute Step 3.7):
   - Verify passed → `confidence = max(confidence, 0.8)`, `outcome = "success"`
   - Verify failed → `confidence = min(confidence, 0.4)`, `outcome = "failure"`
   - Partial pass → `confidence = 0.6`, `outcome = "partial"`
3. **Update** stats: recalculate `success_rate`

> Nếu reasoning-bank chưa tồn tại → skip.

### Step 6: User Acceptance (Present Evidence)
Present results to user (in `user_language`):
- Summary of what was built
- **Verification evidence**: test output, build log, lint results (không chỉ summary)
- Any gaps found
- Ask for sign-off

> User PHẢI thấy evidence cụ thể — không chỉ "tests pass" mà phải kèm output.

**Memory write**: ghi `.nexus/memory/verification-report.md` theo schema từ `memory-schema.md` (requirements coverage, automated checks, gaps, verdict).

### Step 7: Phase Transition
If user accepts:
- Mark phase complete in `roadmap.md`
- Update `state.md` → next phase
- Update progress bar
- Clear resolved blockers

**Requirements Status Update (BẮT BUỘC — v3.7)**:
- Đọc `requirements.md` → tìm REQ-xxx có Phase = phase vừa complete
- Với mỗi REQ:
  - Functional Verification (Step 2.5) = PASS → cập nhật status `⬚` → `✅`
  - Functional Verification = PARTIAL → cập nhật status `⬚` → `⚠️` + ghi note gap
  - Functional Verification = FAIL → GIỮ NGUYÊN `⬚` (phase không nên được accept nếu có FAIL)
- Verify: sau khi update → đọc lại `requirements.md` → confirm status đã đổi

**Phase Archive (v3.7)** — thay thế memory cleanup:
- **Archive** (KHÔNG XÓA): move các file sau vào `.nexus/archive/phase-{N}/`:
  - Plan XML files (`phase-{N}-*-PLAN.md`)
  - Summary files (`phase-{N}-*-SUMMARY.md`)
  - `wave-structure.md`
  - `task-board.md` (snapshot cuối)
  - `results-{phase}-*.md`
  - `verification-report.md` (copy)
  - `spec.md`, `research.md`, `clarifications.md` (nếu tồn tại)
- **Xóa** (volatile only): `progress-*.md` — file tạm theo dõi tiến độ realtime
- Cấu trúc archive:
  ```
  .nexus/archive/
  └── phase-{N}/
      ├── phase-{N}-1-PLAN.md
      ├── phase-{N}-1-SUMMARY.md
      ├── wave-structure.md
      ├── task-board.md
      ├── results-{N}-1.md
      ├── verification-report.md
      ├── spec.md
      └── research.md
  ```

> **Lý do**: Plan và evidence cần giữ lại cho audit trail. Phantom Detection (Step 5.3) phụ thuộc plan XML và task-board để hoạt động. Xóa chúng = vô hiệu hóa quality gates cho phases cũ.

### Step 7.5: Finalize Usage Log (BẮT BUỘC)

Ghi vào `.nexus/logs/usage-log.md`.

> **Format**: Theo ĐÚNG format trong `.agent/maintenance/usage-logger.md`.
> **Self-check**: 6 fields bảng? Bảng Chi tiết? Không prose? Skills ≠ "nexus"?

### Step 8: Guide → Next Steps
Invoke `guide.md`:
- If more phases → suggest `/nexus:plan [next_phase]`
- If all phases done → suggest final review
- If gaps found → suggest `/nexus:quick` or next plan
- If recurring error patterns detected (Step 5.7) → suggest `/learn` to extract patterns thủ công
- If reasoning-bank has ≥ 3 skill candidates → suggest `/evolve` trước phase tiếp theo

## Output
- Verification report
- Phase marked complete (or gaps documented)
- State advanced to next phase
- Usage logged (full format)
