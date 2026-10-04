# Frontend Regression Notes

## Approved visual QA assessment — timetable/history reconciliation

### Why the previous review missed the defect
The previous suite reset demo state to 05–11/10/2026. The user's persisted session contained accepted lessons from 28/09–04/10/2026, then received absolute historical lessons. That combination was not covered. Page overflow assertions did not detect overlapping hit targets inside the timeline. Visual review did not inspect the evening content throughout the internally scrolling timetable. Completed lessons were not traced across the September/October boundary. Reporting broad visual confidence from that limited coverage was an agent review error.

### Required prevention checklist
- Test both fresh seed and older persisted state reconciled with new seed data, without resetting away the user's scenario.
- Scroll through the timetable's full time/day range; a page screenshot of the initial internal scroll position is insufficient.
- Assert rendered block/hit-target intersections, readable widths and independent clickability, not only document scrollWidth.
- Check collapsed and expanded hours at desktop/tablet/mobile sizes, including scrollable timeline content, alerts and modal bounds.
- Trace completed Lesson IDs, snapshot fees and lesson.date into Income; cover weeks crossing month/year boundaries and unknown fees.
- Report exactly which states/viewports were inspected. A green suite does not prove untested visual states are correct.

### Approval / context
2026-10-04 — user explicitly approved recording this assessment after reviewing the preceding report. No commit created.

## SCHED-003 — Historical reconciliation leaves occupied availability
### Symptom
The Friday IELTS lesson overlapped saved free time in the older demo session.
### Root cause
restoreDemoState appended historical lessons without subtracting their occupied intervals from existing availability.
### Invariant
Reconciliation preserves runtime Lessons and free portions of availability, but occupied time cannot remain advertised or rendered as free. Restore is idempotent.
### Regression test
`apps/web/tests/demoDomain.test.js` — `SCHED-003 historical reconciliation removes occupied time from legacy availability without losing runtime lessons` (RED CONFIRMED).
`apps/web/tests/e2e/timetable-history.spec.js` — `SCHED-003 restoring the previous demo week cuts IELTS out of saved Friday availability` (RED CONFIRMED; split ranges and reload verified).
### Files affected
demoDomain.js; demoDomain.test.js; timetable-history.spec.js; demoHelpers.js.
### Prevention
Whenever seed reconciliation introduces booked/completed Lessons, recheck the same runtime availability boundary; do not only update the Lesson collection.
### Date / context
2026-10-04 — approved review and note; targeted and full suites passed before this demo cleanup batch.

## SCHED-004 — Persisted overlapping Lessons cover each other
### Symptom
Thursday English / Nguyễn Minh Anh covered Math grade 8 / Phụ huynh bé An; one class could obscure the other.
### Root cause
Timeline rendered all blocks at full day-column width, with no collision lanes or warning for conflicting persisted Lesson times.
### Invariant
Conflicting records remain independently readable/clickable and explicitly reported. Layout metadata must not change domain dates/IDs. Minimum-height blocks and expanded hours must also avoid rendered collisions.
### Regression test
`apps/web/src/features/scheduling/timelineGeometry.test.js` — `SCHED-004 collision lanes preserve every block and handle chains, adjacent times and short rendered blocks`.
`apps/web/tests/e2e/timetable-history.spec.js` — `SCHED-004 persisted overlapping lessons remain separately readable and clickable at 1440px` (browser RED CONFIRMED), plus 1024px/390px coverage, expanded hours, alert layout and console checks.
### Files affected
WeeklyTimeline.jsx; timelineGeometry.js/tests; weekly-timeline.css; TutorTimetable.jsx; timetable.css; timetable-history.spec.js.
### Prevention
Never treat page-level overflow checks as proof that calendar contents do not overlap. Keep collision regression coverage even after curated demo conflicts are removed.
### Date / context
2026-10-04 — user approved removing only the conflicting Thursday demo Math occurrence in the subsequent cleanup; other overlapping runtime data must still use the protected renderer.

## INCOME-002 — Completed Lesson lacks visible accounting context
### Symptom
Completed Math / N.M.A on 29/09 was mistaken for missing October income. The modal omitted the year, fee and accounting month.
### Root cause
The modal exposed insufficient context for cross-screen reconciliation. The Income calculation itself correctly used lesson.date: the real session's September total was 1,320,000, including two completed operational Math Lessons; October remained 660,000.
### Invariant
Completed finite-fee Lessons contribute to their lesson-date month. Explain that month and snapshot fee in detail; never move September income into October or use current profile price as fallback.
### Regression test
`apps/web/tests/e2e/timetable-history.spec.js` — `INCOME-002 completed legacy Lesson explains its fee and accounting month without appearing in the wrong month` (RED CONFIRMED for missing full date/context; no claim of an arithmetic RED). The isolated test completes one September operational Lesson, so September is 1,100,000 and October remains 660,000.
### Files affected
LessonDetailModal.jsx; timetable-history.spec.js.
### Prevention
Distinguish missing income from a month-filter mismatch using the same Lesson ID/date/fee before changing calculations.
### Date / context
2026-10-04 — reviewed and approved; note recorded only after user approval.

## SCHED-005 — User-approved dated demo cleanup
### Symptom / decision
User approved removing only the Math grade 8 / Phụ huynh bé An occurrence on 01/10/2026 and the free ranges surrounding IELTS on 02/10/2026. Thursday English and Friday IELTS must remain.
### Root cause / scope
This is an explicit demo-data correction after SCHED-003/004, not a new general Lesson lifecycle or a fabricated regression claim.
### Invariant
Correction is limited to the canonical Tutor, dated request occurrence and Friday evening free intervals. Keep Tuesday's Math Lesson, historical fees, other dates/accounts and unrelated state. Remove the deleted occurrence's proposal from its accepted Request. Record appliedDemoCleanups in the existing domain state, so subsequent user edits are not repeatedly erased. Never reset demo state or modify the user's fixture to perform this cleanup.
### Regression test
`apps/web/tests/demoDomain.test.js` — `SCHED-005 approved demo cleanup removes only Thursday Math and Friday evening free ranges once` (failed before the new correction; passes including idempotence and later edits).
`apps/web/tests/e2e/timetable-history.spec.js` — `SCHED-005 approved cleanup keeps Thursday English and Friday IELTS across reload`.
### Files affected
demoDomain.js; demoDomain.test.js; timetable-history.spec.js.
### Prevention
Keep SCHED-004's deliberately conflicting test scenario after curated demo data is cleaned. A clean example does not remove the renderer's obligation to handle other persisted conflicts. Dated cleanup must not become a recurring Thursday/Friday deletion rule.
### Date / context
2026-10-04 — explicitly user-approved cleanup; uncommitted.

## INCOME-001 — Accepted Lesson loses its fee snapshot

### Symptom
An accepted Request had sessionFee but its generated Lessons did not, preventing completed Lessons from contributing their agreed fee to Income.
### Root cause
proposedLessons copied scheduling/identity fields without request.sessionFee.
### Invariant
Every newly accepted Lesson snapshots request.sessionFee. Unknown Request fee stays unknown; current profile price is never a historical Income fallback. Income is a derived shared Lesson projection, not another store.
### Regression test
`apps/web/tests/demoDomain.test.js` — `INCOME-001 accepted request snapshots its fee into each Lesson without profile fallback`: RED CONFIRMED (180000 was lost), then green for known and unknown fee.
`apps/web/tests/e2e/income.spec.js` — `INCOME-001 accepting and completing a Request uses its snapshot fee in both Income and Dashboard`: green, including reload persistence. The Income page itself is new feature work; no independent regression RED is claimed for its initial absence.
### Files affected
data/tutorSchedule.js; Income selectors/hooks/UI and their tests.
### Prevention
Preserve the agreed fee on Lesson creation, alongside concrete proposals and stable IDs. Do not derive historical Lesson income from mutable TutorProfile.price or read legacy dashboardIncome in functional screens.
### Date / context
2026-10-04 — approved Tutor Income batch, uncommitted. Historical lessons are seed-only and merge into canonical state.lessons by stable ID during create/restore; existing runtime history wins. Legacy seed fees hydrate only a missing/null field from the matching lessonTemplate. The earlier Phase-B illustration notes below describe that prior batch, not the current functional Income source.

## BUG-014 — Lesson completion eligibility
### Symptom
Pending Lesson cũng có nút Complete và domain action không guard status.
### Root cause
UI chỉ loại completed/cancelled, action mutate mọi lesson ID.
### Invariant
Chỉ confirmed/upcoming → completed, thuộc đúng Tutor. Pending/completed/cancelled không có transition này. Notes vẫn editable. Completed block muted gray.
### Regression test
`tests/demoDomain.test.js` — `BUG-014 only confirmed/upcoming lessons belonging to the tutor can complete`.
`tests/e2e/domain-regressions.spec.js` — pending + hai eligible N.M.A/P.K tests (pending red; sau fix 3 green, notes/reload/ESC/gray class).
### Files affected
demoDomain, DemoDomainContext, LessonDetailModal.
### Prevention
UI và action dùng cùng canCompleteLesson; không coi mọi status chưa terminal là confirmed.
### Date / commit context
2026-10-04 — approved eligibility decision; chưa commit. Compact block không hiển thị learner text, test dùng accessible name để giữ gray assertion, không bỏ assertion.

## BUG-013 — Duplicate domain seeds/catalogs
### Symptom
Tutor directory/profile/auth/catalogs có seed rời; new requests không được discovery nhận vì thiếu ID metadata.
### Root cause
Hard-coded metadata map cùng data copies trong nhiều modules.
### Invariant
Canonical fixture định nghĩa domain seed một lần; old modules chỉ projection/compatibility. New requests carry own fee/subjects/proposals, không cần ID whitelist.
### Regression test
`src/data/tutorClassSearch.test.js` — `BUG-013 a learner-created request can be discovered without an ID-specific metadata entry` (red empty result; green).
`tests/demoDomain.test.js` — `BUG-013 directory is a canonical fixture projection rather than another identity seed` (red/green).
`tests/e2e/domain-regressions.spec.js` BUG-001 kiểm tra new request hiện cả find-students trước accept (green).
### Files affected
data projection modules, RegistrationPage, TutorClassSearch, canonical fixture.
### Prevention
Không thêm parallel seed; seedLessons/requestProposals cũng project fixture. Không invent normalized subject metadata: req-* metadata giữ Toán/Vật lý từ source cũ.
### Date / commit context
2026-10-04 — Phase B, chưa commit. Giữ old decorative/compatibility exports khi cần, không bulk-delete. `BUG-013 public filter options represent the canonical directory without another catalog seed` pass trước/sau derive options (behavior giống nhau, không có red). Search options derive live profiles để edits không bị stale catalog. quoc-bao duration seed 45 giữ current workspace default; old static duration lưu legacyDuration, không dùng làm active setting. Optional request area/subject phải filter Boolean trước render choices để tránh React key warning.

## BUG-012 — Tutor profile propagation
### Symptom
Tutor edits persist nhưng Learner đọc static public profile; levels chỉ snapshot legacy storage một lần.
### Root cause
Public/profile/dashboard selectors không dùng cùng mutable canonical profile.
### Invariant
Name/subjects/levels/location/price/sessionMinutes/intro đọc cùng profile ID. Save editor cập nhật domain và auth display name; reload vẫn giữ.
### Regression test
`tests/e2e/domain-regressions.spec.js` — `BUG-012 tutor edits propagate to learner profile search and saved dashboard` (red old public name; green 7 fields, saved dashboard và reload).
### Files affected
DemoDomainContext, TutorProfilePage, LearnerDashboard, LearnerPages, TutorPages.
### Prevention
Không đọc static imports hoặc localStorage trực tiếp để render mutable profile; dùng hooks.
### Date / commit context
2026-10-04 — Phase B, chưa commit. Test edits lấy values từ existing approved Tutor fixture, không thêm seed data.

## BUG-011 — Private Learner state ownership
### Symptom
Saved Tutors được persist bằng global key, account khác thấy cùng danh sách.
### Root cause
Global saved storage không có account ID; requests cũng từng dùng global store.
### Invariant
Saved state keyed account ID, request lookup filter learnerId. Anonymous saves chỉ transient, không lấy danh sách của account đã logout.
### Regression test
`tests/e2e/account-scoping.spec.js` — `BUG-011 private saved tutors and requests are scoped by account ID` (red leaked saved Tutor; green saved/list/detail).
### Files affected
DemoDomainContext, LearnerSearch/Profile/Dashboard, public Home/LearnerLanding saved hooks.
### Prevention
Legacy global keys chỉ migrate cho known demo-learner. Không gán private data cũ cho account đang đăng nhập bất kỳ.
### Date / commit context
2026-10-04 — test synthetic ownership ID chỉ dùng setup, identity fields lấy fixture; không thêm domain identity vào seed. Additional `BUG-011 newly registered tutor owns profile schedule and no canonical tutor lessons` trong account-scoping.spec.js đã red vì chưa có public profile/schedule theo account mới, green sau tạo runtime profile từ đúng registration fields và dùng current tutorId. Không invent rating/formats/levels; Tutor mới cần tự chọn levels/lịch, teaching format vẫn UNKNOWN vì registration chưa có field đó.

## BUG-010 — Past learner sessions
### Symptom
Past-week sessions và buổi đã kết thúc hôm nay vẫn selectable.
### Root cause
Geometry validation kiểm tra containment/duration nhưng không kiểm tra clock.
### Invariant
Learner chỉ chọn buổi chưa bắt đầu, nằm trọn saved availability và đúng 45/90 phút; submit rechecks clock.
### Regression test
`tests/e2e/domain-regressions.spec.js` — `BUG-010 learner cannot select past-week or ended-today sessions` (red 23 enabled past-week sessions; green).
`tests/profileSelection.test.js` — `BUG-010 concrete sessions reject past dates and elapsed starts with a fixed local clock`.
`tests/demoDomain.test.js` — `BUG-010 submit rechecks the clock and rejects stale selections without changing state` (red missing guarded action; green validates creation and elapsed selection).
### Files affected
tutorSchedule, ProfileCalendar, TutorWorkspaceState, demoDomain.addLearnerRequest, TutorRequestForm.
### Prevention
Không trộn geometry helper với Date.now mặc định; giữ time validation riêng để test fixed clock.
### Date / commit context
2026-10-04 — Phase B, chưa commit.

## BUG-009 — Dashboard pending total
### Symptom
Dashboard chỉ đếm ref-* trong khi inbox/sidebar đếm cả tập requests.
### Root cause
Layout subset bị dùng như business count.
### Invariant
Count dùng toàn bộ owned pending requests; cards được giới hạn 3 nhưng total không giới hạn.
### Regression test
`tests/e2e/domain-regressions.spec.js` — `BUG-009 dashboard pending total matches the same tutor inbox after decision` (red 3 vs 6; green trước/sau reject).
### Files affected
TutorDashboard.
### Prevention
Đếm trước khi slice layout; không filter bằng historical ID prefix.
### Date / commit context
2026-10-04 — Phase B, chưa commit.

## BUG-007 — Tutor geography
### Symptom
Functional dashboard/editor geography khác public canonical Tutor.
### Root cause
Historical dashboard profile và editor default được dùng như domain data.
### Invariant
Tutor geography lấy canonical location Thủ Đức. Request origins không tự đổi vì khác Tutor location.
### Regression test
`tests/e2e/domain-regressions.spec.js` — `BUG-007 tutor geography and public profile agree without rewriting request origins`.
### Files affected
TutorDashboardSupport, TutorPages, domain profiles.
### Prevention
Không xoá mọi string Hà Nội bằng search/replace; phân biệt owner profile với Request geography.
### Date / commit context
2026-10-04 — cùng root cause BUG-006; đã fixed qua prerequisite trước test này; green, không có red độc lập.

## BUG-008 — Fee semantics
### Symptom
Tutor class filters/cards/dashboard dùng /giờ, Learner/editor dùng /buổi.
### Root cause
Legacy fee metadata hourly được giữ làm business source.
### Invariant
Functional fees/budgets là VNĐ / buổi. Numeric values không convert.
### Regression test
`tests/e2e/domain-regressions.spec.js` — `BUG-008 functional tutor fees use session units and keep existing amounts` (red/green).
Existing `src/data/tutorClassSearch.test.js` giữ đủ 7 assertions/behaviors, pass. Dashboard card fee assertion đã red vì fee trống; green sau render canonical sessionFee. Test lấy amount từ fixture (req-1 = 180000); expectation 200000 ban đầu là lỗi test data, đã sửa theo source chứ không đổi/convert giá trị nghiệp vụ.
### Files affected
Fixture, tutorClassSearch, TutorClassSearch, canonical dashboard profile.
### Prevention
Chỉ một sessionFee value; không tạo hourlyRate song song để duy trì mock cũ.
### Date / commit context
2026-10-04 — approved fee decision; chưa commit.

## BUG-006 — Canonical Tutor identity
### Symptom
Header Gia Bảo nhưng dashboard/profile dùng các tên Minh Anh từ historical visual mock.
### Root cause
Auth/public/editor/dashboard lấy identity từ bốn seed độc lập.
### Invariant
`demo-tutor` / `giabao` / `quoc-bao` là cùng Tutor; functional identity dùng canonical profile/account.
### Regression test
`tests/e2e/domain-regressions.spec.js` — `BUG-006 tutor identity stays consistent across header dashboard profile and public profile` (red dashboard greeting; green cả bốn nơi).
### Files affected
DemoAuthContext, DemoDomainContext, TutorPages, TutorDashboard, TutorDashboardSupport.
### Prevention
Reference visual mock không được override identity. Auth seed/payload cũng import fixture thay vì duplicate.
### Date / commit context
2026-10-04 — Phase B, chưa commit.

## Canonical Demo Data Rules

1. Không invent domain data trong component; dữ liệu seed nằm trong `apps/web/src/data/demoReferenceData.js`.
2. `demo-tutor` / `giabao` chỉ map public Tutor `quoc-bao`; không duplicate identity.
3. Learner và Tutor phải đọc cùng request ID từ domain provider; không tạo second request store.
4. Business status dùng code; display label chỉ dành cho presentation.
5. Fixture immutable là seed, không phải mutable store.
6. UI dùng hooks/selectors, không đọc localStorage trực tiếp khi domain provider đã cung cấp dữ liệu.
7. Backend integration sau này phải preserve entity IDs và state boundary.
8. Thay đổi cross-role state luôn cần E2E regression.

## BUG-001 — Shared Learner/Tutor requests

### Symptom
Learner tạo request nhưng Tutor inbox không thấy nó.

### Root cause
Hai role persist request trong `tnm.learnerRequests` và `tnm.tutor.workspace.v3` độc lập.

### Invariant
Cả hai role resolve cùng entity ID từ `tnm.demo.domain.v1`. Proposals giữ concrete date/time từ lúc tạo/seed; Accept không tính lại tuần. Legacy keys chỉ migrate một lần; không bị xóa.

### Regression test
`apps/web/tests/e2e/domain-regressions.spec.js` — `BUG-001 learner-created request appears for the canonical tutor and decision returns to learner` (red: Tutor không có request; green: toàn flow).
`apps/web/tests/demoDomain.test.js` — hai test BUG-001 kiểm tra seed immutable và migration.

### Files affected
`features/domain/`, `features/tutor/TutorWorkspaceState.jsx`, `features/learner/TutorRequestForm.jsx`, `features/learner/LearnerPages.jsx`, canonical fixture, E2E reset helper.

### Prevention
Không thêm persistence riêng theo role. Selector trả array stable cho effect consumers; timetable draft không được reset vòng lặp do array identity mới ở mỗi render.

### Date / commit context
2026-10-04 — approved Phase B; chưa commit. Fixture/migration assertions bổ sung sau foundation; cross-role test đã red trước fix.

## BUG-002 — Learner cannot complete a Request
### Symptom
Accepted Request có nút “Đánh dấu đã học xong” dành cho Learner.
### Root cause
Learner detail trực tiếp mutate display status thành Hoàn tất.
### Invariant
Learner chỉ cancel pending request; completion được derive từ related Lessons do Tutor hoàn tất. Embedded review chỉ ghi khi hoàn tất.
### Regression test
`tests/e2e/domain-regressions.spec.js` — `BUG-002 learner cannot complete an accepted request` (red: button count 1; green: 0).
`tests/demoDomain.test.js` — `BUG-002 learner updates cannot complete requests or edit another owner`.
### Files affected
LearnerPages, demoDomain, DemoDomainContext.
### Prevention
Không expose generic request mutation cho Learner. Domain action phải allowlist transition/fields/owner.
### Date / commit context
2026-10-04 — Phase B, chưa commit.

## BUG-005 — Tutor reject feedback
### Symptom
Sau từ chối, feedback vẫn dùng màu success.
### Root cause
Accepted/rejected cùng class flow-success.
### Invariant
Decision feedback phải cùng semantic với request status; rejected/cancelled danger.
### Regression test
`tests/e2e/domain-regressions.spec.js` — hai `BUG-005 tutor ... decision feedback uses correct semantics` (rejected red trước fix; cả hai green sau fix).
### Files affected
TutorPages, scoped tutor flow-error CSS.
### Prevention
Không dùng success như một class “action đã chạy”; màu phải mô tả kết quả nghiệp vụ.
### Date / commit context
2026-10-04 — Phase B, chưa commit.

## BUG-003 — Canonical request status codes
### Symptom
Learner dùng Vietnamese labels làm business state trong storage/filter/actions.
### Root cause
Presentation và domain state dùng cùng field.
### Invariant
Request status chỉ pending/accepted/rejected/cancelled. Completed là related-Lesson presentation, accepted code không bị đổi.
### Regression test
`tests/demoDomain.test.js` — `BUG-003 persisted requests use codes and completed lessons do not change accepted code`.
`tests/e2e/domain-regressions.spec.js` — `BUG-003 learner filters use canonical states with separate completed lesson presentation`; `BUG-003 tutor sees learner cancellation as cancelled rather than rejected` kiểm tra cross-role cancellation, badge danger và không có Accept.
### Files affected
demoDomain, DemoDomainContext, statusMetadata, LearnerPages, LearnerDashboard.
### Prevention
Không compare display label trong actions/filter. Labels derive từ shared metadata.
### Date / commit context
2026-10-04 — cancellation UI regression bổ sung đã red (Đã từ chối thay vì Đã hủy), rồi green qua shared metadata. Prerequisite BUG-001 đã normalize persisted status; test BUG-003 không có red độc lập sau prerequisite. UI filter test pass trước và sau chuyển UI sang codes; không tuyên bố red.

## BUG-004 — Learner status semantics
### Symptom
Các request statuses dùng một blue treatment.
### Root cause
`.flow-status` không derive semantic tone.
### Invariant
Pending warning, accepted success, completed Lesson info, rejected/cancelled danger; luôn có text label.
### Regression test
`tests/e2e/domain-regressions.spec.js` — `BUG-004 learner request badges expose distinct semantic tones` (red/green browser).
### Files affected
statusMetadata, LearnerPages, LearnerDashboard.
### Prevention
Reuse Badge + requestTone; không tự hard-code màu cho status ở từng màn.
### Date / commit context
2026-10-04 — Phase B, chưa commit.

## BUG-015 — Deterministic Playwright regression infrastructure

### Symptom
Existing E2E không có cấu hình/script hoàn chỉnh và phụ thuộc browser state/ngày chạy; mobile logout nằm trong menu đóng.
### Root cause
Test setup không reset known demo storage/clock và chưa khởi động Vite tự động.
### Invariant
Mỗi test có context sạch, seed từ canonical fixture, fixed clock 2026-10-05 06:00 +07 và timezone Asia/Ho_Chi_Minh. Không sửa state giữa cross-role user journey; setup-only synthetic account IDs không thêm fixture identities.
### Regression test
playwright.config.js; tests/e2e/demoHelpers.js; toàn bộ tests/e2e/*.spec.js. Existing learner-tutor-interface.spec.js giữ assertions; bổ sung deterministic reset, mobile logout và vào timetable trước mở Lesson modal. Existing Maps smoke coverage giữ nguyên, không mở rộng Maps.
### Files affected
package.json/package-lock.json, playwright.config.js, .gitignore, demoHelpers và E2E specs.
### Prevention
Không chạy hai Playwright runner trên cùng test-results folder: runner cleanup gây ENOENT artifacts nếu chạy đồng thời. Không phụ thuộc thứ tự test hoặc ngày thật; không bỏ/skip assertions để đạt green. Console React/DOM/page errors phải fail QA; chỉ external Unsplash load failures được attach riêng như environment/asset limitation.
### Date / commit context
2026-10-04 — Phase B, chưa commit. Package @playwright/test 1.63.0; Chromium, một worker. NO_COLOR/FORCE_COLOR warning của runner chỉ ảnh hưởng màu terminal.

## AUTH-004 — Phone modal returns keyboard focus

### Symptom
ESC đóng Phone modal nhưng focus không quay về provider trigger.
### Root cause
Input autoFocus chạy trước hook capture previous focus, khiến hook nhớ input nằm trong modal đã đóng.
### Invariant
Capture trigger trước khi focus input; focus trap/ESC/return focus giữ nguyên qua phone → OTP.
### Regression test
`tests/e2e/auth-regressions.spec.js` — `AUTH-004 phone validation invalid OTP success and ESC close` (invalid phone/OTP, verification success và ESC return focus); return-focus assertion red trước fix, green sau fix.
### Files affected
features/auth/PhoneAuthModal.jsx.
### Prevention
Không dùng native autoFocus trước dialog focus hook; focus input sau capture bằng local effect theo open/step. Không thay shared dialog hook chỉ để xử lý một modal.
### Date / commit context
2026-10-04 — lỗi accessibility block QA của current screen, không mở rộng Auth scope.

## Legacy data classification

| Source | Classification | Boundary / reason retained |
|---|---|---|
| tutors.js, tutorProfiles.js, learner.js | Migrated / read-only projection | Seed lấy từ canonical fixture; runtime screens dùng hooks. Formatting helpers và illustrative reviews giữ. |
| tutorDashboard.js | Projection + decorative/legacy exports | initial profile/requests project fixture; unused historical income/weekly presentation không làm business source. |
| tutorDashboardReference.js | Projection + decorative layout support | Profile/requests project fixture; historical income/progress/scheduledCells chỉ reference, không override identity/domain. |
| tutorClassSearch metadata | Legacy compatibility projection | Derived fixture cho old callers; new Request tự có subjects/sessionFee/proposals. |
| requestProposals / weeklyScheduleRanges | Legacy compatibility / seed adapter | Old callers/tests có fallback; active seed resolves date một lần, mutable account Tutor đọc saved ranges. |
| Old localStorage keys | Legacy migration only | Read khi chưa có v1; giữ nguyên, không delete, không write như active store. |
| Public marketing copy/images | Decorative only | Không gom vào canonical fixture; không phải account/domain facts. |

Không bulk-delete old exports chỉ vì runtime không dùng: compatibility tests/reference vẫn có thể cần. Thay backend sau này giữ IDs/ownership/status/proposals và thay domain boundary, không bắt screens rewrite.

## BUG-013 — Missing data stays unknown in current screens

### Symptom
Legacy request Tại nhà không có areas lại hiển thị học online; Tutor mới chưa có rating nhưng dashboard/profile hiển thị rating trống với filled stars hoặc /5.
### Root cause
Absence bị dùng như một giá trị mặc định nghiệp vụ/visual thay vì kiểm tra field được cung cấp.
### Invariant
Chỉ nói không yêu cầu khu vực khi format thực sự chỉ Online. Missing area hiển thị Chưa có khu vực được gửi; missing rating hiển thị Chưa có đánh giá, không invent rating/contact/format.
### Regression test
`tests/e2e/domain-regressions.spec.js` — `BUG-013 missing legacy request areas do not imply an online lesson` (red false Online → green unknown).
`tests/e2e/account-scoping.spec.js` — `BUG-011 newly registered tutor owns profile schedule and no canonical tutor lessons` mở rộng assertions missing rating ở dashboard/public profile (red empty rating → green).
### Files affected
RequestSelectionDetails, TutorCard, TutorProfilePage, TutorDashboardSupport.
### Prevention
Không suy ra domain value từ falsy/missing field. Unknown không phải Online hoặc rating zero/five.
### Date / commit context
2026-10-04 — canonical data/current-screen QA; không thêm field/route.

## UI-QA-001 — Mobile Tutor request text width

### Symptom
390px Tutor inbox ép nội dung subject/learner còn khoảng 82px do badge margin và flex widths; nhiều từ xuống từng dòng.
### Root cause
Mobile badge margin-left 55px lấy thêm chỗ trong cùng row với title.
### Invariant
Subject/learner giữ đủ bề ngang đọc; badge xuống dòng riêng trên mobile, desktop giữ layout. Không ép font nhỏ hoặc giấu trạng thái.
### Regression test
`tests/e2e/responsive.spec.js` — `UI-QA-001 mobile Tutor request text retains readable width beside status` (red width 81.8px < 150px; green, badge visible và screenshot review).
### Files affected
styles/flows.css, scoped mobile .tutor-flow .flow-row.
### Prevention
Page overflow pass không đảm bảo content column đọc được; QA kiểm tra text width và xem screenshot ngoài page dimensions.
### Date / commit context
2026-10-04 — P4 responsive QA; không redesign shell hoặc thêm screen.

## Verification evidence — approved Phase B

Commands run from `apps/web` on 2026-10-04:

| Command | Result | Duration |
|---|---|---|
| `node --test` | 45 passed, 0 failed, 0 skipped; existing scheduling assertions retained | 2573.7527ms |
| `npm run build` | Exit 0; Vite 8.3.1, 1986 modules, no important build warning | 4.21s |
| `npm run test:e2e` | Exit 0; 34 passed, 0 failed, 0 skipped, one Chromium worker | 3.9m |
| `git diff --check` | Exit 0 | — |

Routes verified: shared Login/Register/Tutor Register; Learner Search/Dashboard/Tutor Profile/Request list/detail/new redirect; Tutor Dashboard/Profile/Timetable/Find Students/Request list/detail; legacy availability/lessons redirects. Public homepage/Learner/Tutor landing regression coverage retained. Existing Maps smoke tests retained without changing Maps implementation.

Responsive QA: 1440/1024/390px, phone/lesson modal bounds, no accidental page overflow, React/DOM/page-error checks. 67 ignored screenshot artifacts in `apps/web/test-results/`, with visual review of current screens and role-specific density. External Unsplash failures attached separately; they remain an asset/network limitation, not a successful image-load claim. NO_COLOR/FORCE_COLOR warning only affects terminal coloring.

Red evidence exists for cross-role inbox, Learner Complete button, status tone/reject feedback, identity, fee, pending count, past sessions, account isolation/profile propagation, metadata discovery, completion eligibility, missing-field presentation, phone focus and mobile request text width. BUG-003 code normalization and BUG-007 geography were already changed by prerequisites before their independent tests; those tests provide green regression coverage without an invented red result.

Known boundaries: legacy Requests/Lessons with unknown account ownership retain null rather than invented identities; illustrative review/income/progress data remains explicitly mock. Newly registered Tutor has no inferred teaching format/rating/experience; current registration lacks a teaching-format field, so full booking of that new profile is deferred rather than fabricating Online/Tại nhà. Saved availability stays date-specific and does not recur automatically into future weeks. No new screens/Admin/Maps expansion/backend work in this batch.
