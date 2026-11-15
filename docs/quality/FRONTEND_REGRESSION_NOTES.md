# Frontend Regression Notes

## Wallet linking coming-soon UI — latest 2026-11-15

Supersedes the live bank-link UI described below. LearnerWalletPage no longer imports/renders provider selection or bank-link confirmation, including from the old bankLink query. Tài khoản liên kết always shows Chưa liên kết and the existing secondary Liên kết tài khoản button; clicking shows the exact requested sentence as role=status with existing learner-wallet-note styling. New nạp/rút attempts without eligible recipients use that same notice. Persisted wallet data/services remain untouched; existing recipient financial flows remain functional.

Build passed. Existing wallet financial E2E at 1440/390 and protected-route/legacy redirect tests passed with persisted recipients; replacement coming-soon test passed at 1440/390/320, including no provider choices/dialog, no link session storage mutations, and old query bypass prevention. Desktop/mobile screenshots visually reviewed. Earlier provider-confirmation E2E assertions were replaced because that UI is no longer exposed; service tests retained.

## Learner wallet linking and natural labels — 2026-11-15 (revised)

Supersedes the UI/contract and tuition scope in the earlier wallet entry below. Route/menu remain `/learner/wallet` with existing protection, icon, placement, close and active treatment. Page now has Tài khoản liên kết, naturally worded Nạp tiền/Rút tiền/Mã QR and no Ví demo/QR demo/Mock/Mô phỏng/Dữ liệu mẫu labels. Small Kiểm thử trạng thái groups sit at the end of dialogs, separate from primary actions. History lists nạp/rút only, with code/time/amount/status and masked account details. Tuition remains deferred; preexisting records are not deleted from storage.

Provider options and masked fixtures live in data/walletDemo.js. Production-facing walletService has nine methods; simulateBankLink/TopUp/Withdrawal remain mock-only. MoMo fixture returns an internal confirmation URL (not a real app); bank fixtures return local QR data. UI renders returned url/qrPayload, polls link status, retries failed/expired sessions, and resumes original nạp/rút intent after successful linkage. Eligible recipient dropdown comes from service; requestWithdrawal now accepts `{amount, linkedAccountId}`. Service rejects foreign/ineligible recipients and maintains hold/refund/terminal idempotency. Existing wallets gain absent link collections without resetting funds/history.

Verification: `node --test` 206 passed (11 wallet service cases), build passed with existing large-chunk warning. `E2E_BASE_URL=http://127.0.0.1:5174 npx playwright test tests/e2e/wallet.spec.js`: 5 passed. Full flows at 1440/390: menu route/active, link-first nạp then resume, +500000, withdraw 200000/hold/reload/success, overdraw rejected, withdraw 50000/failure/refund, topup expiry/recreate/failure, final 300000 persisted, read error/loading/retry. Two synchronous form submissions for both nạp and rút create exactly one transaction. All three providers tested with failure/expiry/retry/success, three recipients persisted, and URL confirmation at a second tab resumes original rút intent. Additional 1024/768/320px checks cover page overflow and dialog bounds. Desktop/mobile history, link QR and recipient dialogs visually reviewed. Browser page errors empty in full flows.

No real partner authentication or payment backend added. API shapes, mocked confirmation URL, persistence limitations and files are documented in features/learner/WALLET.md.

## Learner demo wallet — 2026-11-15

Protected `/learner/wallet` replaces query-only wallet page; old query redirects. Existing avatar wallet row/icon/order retained and points to new route, closes menu and exposes active aria-current. Wallet async service is separate from JSX; mock defaults/labels in data/walletDemo.js, per-account localStorage and transitions in mockWalletService, integration facade in walletService. No real payment/backend or changes to teaching domain.

Verification: `node --test` 202 passed including 7 new wallet service tests; `npm run build` passed (existing large-chunk warning remains); `E2E_BASE_URL=http://127.0.0.1:5174 npx playwright test tests/e2e/wallet.spec.js` 4 passed using installed Chrome. Full desktop/mobile flow: menu open/close/active, empty wallet, nạp 500000 via local QR, withdraw 200000, reject 500001, reserve/reload/settle, fail withdrawal 50000 and release hold, expired/failed topups without credit, history newest first, loading/error/retry, persisted total 300000. Service tests exercise concurrent repeated outcomes, insufficient available money after hold, independent accounts, invalid amounts, QR expiry clock and storage failures. Extra UI check shows tuition/lesson metadata only when supplied by source, with 1024/768/320px layout and modal bounds checks. Desktop/mobile history and QR screenshots visually reviewed; mobile rows reflow without page overflow. Browser page errors empty in full flows.

Seed is 0 VND and empty history, not fabricated historical payments. QR is locally encoded `TUTORNEARME-DEMO|...|NOT-A-REAL-PAYMENT`, contains no bank destination; manual simulation controls live in mock. Holds/settlement are frontend demo arithmetic only; future backend must own authorization, idempotency and payment state. API method contracts and integration limits documented in features/learner/WALLET.md.

## Learner message action label — 2026-11-15

LearnerHeader's existing /learner/messages link now contains the chat icon followed by “Tin nhắn”, with intrinsic width, 7px gap and non-shrinking icon/control. Existing border/radius, 40px height, unread badge, accessible unread label, route and active behavior are retained. At <=480px the Learner header uses two rows (112px total): brand/menu above, message/account actions below, with mobile navigation offset aligned to 112px. This keeps the full label visible without overlapping the account control. Other role/public headers are unchanged.

Browser checks passed icon/text bounds and center hit targets at 1440/1024/768/480/390/320px, mobile menu position and chat navigation/active. Search and messages mobile screenshots reviewed; build passed.

## Request report neutral styling — 2026-11-15

User requested the request-detail report button match the profile's quieter gray treatment. Its existing outlined control now uses --text-muted/--color-border on white, with --text-primary/--color-border-strong hover. Position, sizing, status availability and form/payload are unchanged. Completed/pending desktop/mobile placement, gray colors and exact dialog identity E2E passed; desktop screenshot reviewed; build passed. Supersedes earlier red styling notes.

## Profile report moved into identity actions — 2026-11-15

Supersedes the previous profile price-card placement: the profile identity card keeps verification on its own upper row; favorite and the single report button share a lower, right-aligned flex-wrap row. Both controls are 44px high, content width; profile report is dark gray on white with a light-gray border. Price card contains booking/message only. Profile-scoped CSS handles this treatment; request-detail report remains red and keeps its current location. Shared form/domain/persistence are unchanged.

Build and six report E2E cases pass. Profile placement/geometry/identity checked at 1440/1024/390/320px, badge above buttons, equal heights, desktop same row, no page overflow, exact Tutor name in the existing form. Screenshots reviewed desktop/mobile. Existing completed/pending request placement and report flow regressions also pass.

## Report button visibility on profile and request detail — 2026-11-15

Profile now has its sole report button inside the price/booking card immediately below Nhắn tin, matching its full width; removed from the identity/favorite group. Request detail retains its one report action to the right of Xem hồ sơ gia sư, stacked on mobile, for pending and completed. Both opt into the same outlined style using existing --color-danger / --color-danger-bg tokens (the root muted danger palette), preserving Đặt lịch học as the primary CTA. No form/domain/mock/route/review/priority changes.

Six report E2E tests pass, including profile placement and equal widths at 1440/390/320px, default danger text/border, one trigger, booking primary treatment, completed/pending request geometry and exact form identities, plus existing send/reload/Admin/error-retry cases. Build passed; desktop/mobile screenshots reviewed.

## Request-detail report action placement — 2026-11-15

Moved the single existing report action from the Tutor-name row to an outlined button immediately right of “Xem hồ sơ gia sư” in the left Tutor card. Actions stack at narrow mobile widths. No new status gating: completion remains request.completed from the existing Lesson/legacy selector, so pending and completed both retain the same report form and exact tutorId/requestId. Missing-profile case still keeps the request target ID. Profile-page report placement and submission/domain flow are unchanged.

Build and all five tutor-report E2E tests pass. New geometry/identity test opens completed demo-03 (Phạm Hà Linh, #YC-1003) and pending demo-01 (Nguyễn Mai Anh, #YC-1001), checks one report button, desktop side-by-side/mobile stacked actions, exact form identity and cancel. Desktop/mobile screenshots visually reviewed. Existing send/persist/Admin, quota retry, request priority/review and missing-profile tests also pass.

## Learner tutor reports — 2026-11-15

- Shared `TutorReportForm.jsx` opens inline via a portal from profile (under favorite, right aligned) and request detail (alongside Tutor name in the left card). Uses existing focus-trap/Escape/restore-focus hook and shared Button; 44px targets and internally scrollable dialog on mobile. No new routes or fixture changes. MyRequests priority/filter/count/action treatments and the review form remain intact.
- `domain/tutorReports.js` validates learner ownership, exact request/tutor association, mandatory reason and Other description. Five profile reasons plus three request-only reasons; optional image evidence reuses existing file/total size limits and evidence validation. PNG/JPEG/WebP only, max 3, 500 KB each / 1 MB total. Missing profile retains the request's tutor ID, never the first profile.
- Context action adds a new record to existing shared issues and confirms success only after localStorage write. Failure does not update state or dismiss/reset the form; reason, description and images remain available for retry. Admin selector/drawer expose reporter, target, reason, description, requestId and actual image data. Reporting itself does not warn, suspend or alter requests/reviews.
- Build and 195 unit tests pass. Four report E2E tests pass: both entry points, pending/completed, required reason/Other validation, image format rejection, quota failure/retry with draft retention, reload and Admin identity/evidence, missing profile, Escape/focus return, 320/390px dialog geometry, preserved request list order/counts/primary action and review section. Desktop/mobile screenshots visually reviewed.
- Additional existing Admin regression suite: 16 pass; one existing Learner appeal-entry test cannot find the Kháng cáo link on the current Dashboard. Existing account-menu suite: 9 fail against current expanded menu/long-username geometry (tests expect the old four-item menu). These current-code discrepancies are outside this report feature; menu, Dashboard and legacy tests were not changed.

## Learner requests visual hierarchy (2026-11-14)

Only MyRequests opts into `.learner-requests-view`; request detail and other roles/pages retain existing styles. Statistics keep their calculations/text but use quieter surfaces, smaller numbers and no shadow. Selected status tab has stronger weight/background/count; other tabs are muted. Subject/Tutor heading and status remain primary, secondary metadata/fee are subdued. “Chi tiết yêu cầu” is the primary card action; other links keep their URLs/state with secondary treatment and 44px targets.

Display sorting is pending → accepted ongoing → completed → cancelled → remaining statuses, newest valid ISO createdAt first within each group, stable original order for undated ties. Sorting operates on a filtered copy, never domain state. Existing All excludes cancelled and counts are unchanged. Cancelled tab no longer truncates to one record. Unknown/rejected records and labels remain intact.

Browser checks with isolated multi-status test storage verified all five tabs/counts, multiple cancelled records, timestamp ordering including invalid dates, unknown label, no records lost by sorting, unchanged domain storage and class/detail navigation. Screenshots reviewed desktop/mobile; no page overflow at 1440/1024/768/390/320px. Build passed. Fixture, services, Context and actions unchanged.

## Immediate live-session demo (2026-11-14)

User requested a session to test immediately: fixture `demo-live-session-2026-11-14`, existing demo-02/quoc-bao/demo-learner, confirmed 22:00–22:45 UTC+07 on November 14. Explicit note identifies this as an additional UI test session, separate from the six-session planned demo sequence. Added to the existing absolute-date seed collection so normal reconciliation loads it without resetting storage. No render-time time shifting, recurrence or completion. Live progress verified in the browser against the actual clock; 191 unit tests passed. After 22:45 this one-off session will no longer appear in the ongoing section. Existing class progress remains the six-session prototype display, not an attendance counter for this extra test.

## Learner live session display (2026-11-14)

User repurposed the removed status-check area as “Buổi học đang diễn ra”. It appears above the other session lists only for actual confirmed/upcoming Lessons with valid date/time and start <= current local time < end. Completed/cancelled/pending, undated schedules, invalid intervals and elapsed sessions are excluded. The existing one-second UI clock drives elapsed-duration percentage, elapsed minutes and remaining minutes; this measures scheduled time, not attendance or completion. End 24:00 resolves to midnight of the following day. At end the section disappears without changing persisted business status.

Browser fixed-clock checks passed before start, at start (0%), midpoint (50%), per-second bar growth and exact end, with the existing November 21 seed lesson. Upcoming counts transition 4 → 3, history stays based on completed status and domain storage is unchanged. Class link preserved. Screenshots reviewed at 1440/390px; layout also checked at 320px. Production build passed.

## Learner schedule overdue section removed — user request (2026-11-14)

Supersedes the separate uncertain/past-session section described below: remove “Buổi học cần kiểm tra trạng thái” from the schedule page. Past non-completed or unknown-time Lessons remain in shared data and the dated week board, but do not appear in upcoming/history lists. No status conversion or deletion. Build and browser checks passed for four future sessions, then no future sessions after clock advancement, retained history and unchanged stored domain data; mobile screenshot reviewed.

## Learner dated demo refresh (2026-11-14)

- `demoReferenceData.js` adds six absolute dated Lessons to the existing `historicalLessons` seed collection, which is already reconciled by stable ID into shared state. All belong to existing class/request `demo-02`, learner `demo-learner`, tutor `quoc-bao`, subject Tiếng Anh, 09:00–09:45 Saturday, snapshot fee 220000. November 7/14 have explicit completed status/completedAt; November 21/28 and December 5/12 remain confirmed. Other existing history and operational templates are unchanged. These are fixed demo dates, not an evergreen or render-time recurrence.
- Request demo-02's obsolete dated schedule label becomes “Thứ 7 · 09:00–09:45”. Existing reconciliation updates only that exact old label for the same request/learner/tutor; runtime schedule edits and same-ID Lesson edits win. No reset of localStorage, new store or schema change.
- Tests cover 2/6 completion, future timestamps, matching identities/subject/duration/fee and idempotent old-state reconciliation preserving edits. Browser QA verifies four future sessions as of November 14, correct Saturday placement, empty later week, class/detail progress 33%, shared Tutor records and reload without duplicates. Build and unit suite pass. Existing class progress remains the prototype's current presentation logic; this refresh aligns its initial 2/6 state and does not redesign that logic.

## Learner schedule — dated weeks and display status (2026-11-14)

- `/learner/schedule` shows Monday–Sunday date columns with previous/next/current-week controls and today's indicator. Only owned, non-cancelled Lessons with matching concrete dates appear in the week; accepted Requests without linked Lessons remain separate undated class schedules. Removed the page's fabricated fallback Request; no provider, fixture or service changes.
- Upcoming requires confirmed/upcoming status and a valid future local start timestamp, refreshed while the page stays open. History requires actual completed Lesson status. Past/started or unknown/incomplete records remain visible separately without writing status changes. Fixed schedules are never repeated into concrete Lessons.
- Start time is emphasized over end time for upcoming sessions; fees are hidden and the existing class action reads “Vào lớp học”. New CSS opts in through `.learner-schedule-view`; seven columns scroll inside a keyboard-focusable region on narrow screens.
- Verification: production build; Edge browser checks for month/year boundaries, current week/today, matching Lesson dates, unchanged domain storage after navigation/reload, class route/navigation state, future/past/missing date-time classification, and 1440/768/390/320px layout/internal scroll. Fresh canonical seed was checked separately from isolated persisted test scenarios using existing operational Lesson records. Screenshots reviewed on desktop/mobile. Fresh seed may contain no owned future dated Lessons; empty weeks/upcoming lists are expected and are not filled from recurring class text.

## LACCOUNT-002 — Learner account identity accent (2026-10-10)

### Scope and behavior

Only two scoped rules in Learner `account-menu.css` change the UI. Account initials avatars (trigger and dropdown identity) use existing brand-primary #1346A0 with white text, contrast approximately 8.71:1. Trigger avatar remains circular and 28px. Trigger username retains real auth data and 14px size, with weight 700, brand-primary-deep #0A2E73 and -.01em tracking. Current minhanh trigger width does not increase (about 129.31px before / 129.30px after on desktop); target heights stay 40px desktop / 44px mobile/tablet. Navigation/header CSS, JSX, shared Avatar, menu items, auth/logout and data are untouched. Closed trigger remains transparent with no visible border; hover/open/focus states remain as in LHEADER-002.

### Verification

- Build passed; existing ~548 kB main JS chunk warning remains.
- All nine `learner-account-menu.spec.js` cases passed via installed Edge and the existing ignored config: viewport geometry, keyboard/Tab/Escape, dismissal, routes/saved state/logout, parent identity and long username after reload.
- Before/after browser comparison at 1440, 1366, 1024, 768, 390, 375 and 320px: no page overflow, unchanged header/main bounds and navigation styles, navigation geometry within 0.05px subpixel tolerance, trigger width no greater than before, heights and 28px avatar unchanged. Desktop/mobile hover and open states preserve trigger geometry; Escape returns focus. No permanent tests or dependencies added.
- Visually reviewed before/after desktop, closed/hover/open desktop/mobile. Ignored artifacts: `apps/web/tmp/account-accent-*.png`, `account-accent-baseline.json` and `account-accent-results.json`.

## LHEADER-002 — Balanced controls and a quiet closed account trigger (2026-10-10)

### Scope and behavior

Supersedes the visual sizing/state choices in LHEADER-001 following user review. Only Learner `header.css` and `account-menu.css` change in the UI. Shared control height is 40px above 900px, 44px in the existing mobile/tablet navigation mode; radius is 11px and the trigger avatar is 28px across viewports. Header heights and Search/hero/filter/card layouts remain unchanged. Desktop dropdown offsets compensate for the shorter trigger so the panel stays below the header.

Default navigation/account trigger: transparent background and reserved transparent border, navy #33415C, weight 600. Hover: #F3F7FF with 160ms transitions. Navigation active: existing aria-current, #EAF1FF, #153F91, weight 700 and #CBDCF6 border; no underline or shadow. Closed account trigger has no persistent fill/visible border. Open account trigger uses the paler hover fill and a subtle border, with the existing chevron rotation; dimensions and username weight remain fixed. Keyboard focus remains a separate outline and global reduced motion still applies. Dropdown contents/handlers, routes including /learner#stories, auth/logout and domain data are unchanged; no JSX/shared/Public/Tutor/Admin styles changed.

### Verification

- Build passed; existing main JS chunk warning remains (~548 kB).
- `learner-account-menu.spec.js` and `learner-search.spec.js`: 18 passed using installed Edge via ignored `tmp/playwright-edge.config.js`. Existing size assertions now check 40px desktop / 44px mobile, 28px avatar and identical trigger geometry when opened. Keyboard, Escape/Tab, dismissal, all account destinations, saved state/reload, parent/long identity and Search/filter behavior pass.
- Browser review at 320, 375, 390, 768, 900, 901, 1024, 1366 and 1440px: expected navigation/account height, header height, bounds and center hit targets pass. Desktop/mobile state review checks transparent closed account background/border, a single active item on Search/Requests/detail, no active navigation on account Dashboard, stable navigation geometry on hover, stable trigger geometry when opened, keyboard focus and reduced motion.
- Public landing header snapshots still match the earlier baseline; disabling Learner header/account styles leaves computed styles and geometry of Public/Tutor/Admin headers unchanged.
- Screenshots visually reviewed: desktop/mobile default, active, hover, focus and open dropdown. Ignored artifacts: `apps/web/tmp/header-balanced-*.png` and `header-balanced-review-results.json`.

## LHEADER-001 — Learner navigation pills (2026-10-10)

Historical visual settings; superseded by LHEADER-002 above. Original verification is retained.

### Scope and behavior

LearnerHeader imports its own `header.css`; header rules previously in `search.css` move there without changing the Search layout. All selectors opt in through `.learner-app-header`. The three navigation links share 12px corners and 44px minimum targets with the account trigger. Default navy text, pale blue hover, and a stronger active fill/border/weight replace the underline. Active styling consumes existing `aria-current="page"` from the unchanged pathname matching, including request detail. Navigation and account trigger have visible keyboard outlines; global reduced-motion remains effective.

Only the account trigger's visual treatment changes. Dropdown JSX, content, routes, keyboard handlers, dismissal, identity and logout are unchanged. At ≤360px the trigger hides its visual username to fit beside the brand and navigation button, retaining its accessible name and the full identity in the dropdown. Search header remains 72px desktop / 64px mobile; other header heights and scroll behavior remain unchanged. Public/Tutor/Admin, auth/domain and `/learner#stories` behavior are untouched, including the existing SPA anchor limitation recorded in LACCOUNT-001.

### Verification

- `npm.cmd run build` passed; the existing main JS chunk warning (>500 kB, approximately 548 kB) remains.
- Existing Playwright suites `learner-account-menu.spec.js`, `learner-search.spec.js` and `responsive.spec.js`: 22 passed using installed Edge via the existing ignored `tmp/playwright-edge.config.js`. Coverage includes Search/filter behavior, dropdown keyboard/dismissal, saved state after reload, parent/long identity and connected public/Learner/Tutor screens.
- Additional browser review at widths 320, 375, 390, 768, 900, 901, 1024, 1366 and 1440px: no header overflow or obscured control centers, navigation targets ≥44px and unchanged compact height. Request list/detail active state, navigation Tab focus and reduced motion checked. Public landing header snapshots match the before state; toggling Learner header/account CSS leaves Public/Tutor/Admin header geometry and computed styles identical.
- Screenshots visually reviewed for desktop, tablet, narrow mobile, hover, focus, request active and account open. Ignored artifacts: `apps/web/tmp/header-before-*.png`, `header-after-*.png`, `header-hover.png`, `header-focus.png`, `header-requests.png`, `header-account.png` and `header-review-results.json`.

## LACCOUNT-001 — Learner account dropdown (2026-10-10)

### Scope and behavior

LearnerHeader replaces the account link and standalone logout with one avatar/username/chevron button. The 280px menu shows session identity and accountType, with existing Dashboard, Requests and Dashboard saved-tutors destinations. Logout calls the unchanged auth callback. Menu buttons/items expose menu semantics and support arrows, Home/End, Enter/Space, Escape, Tab, outside pointer/focus dismissal and navigation dismissal. Escape restores trigger focus; outside clicks retain destination focus.

PublicHeader's opt-in `persistentActions` renders this account control once, including mobile. Focusing/clicking Learner actions closes mobile navigation; clicking/focusing outside the dropdown closes it. Default public header behavior remains unchanged. CSS is scoped to `.learner-app-header`. Dashboard now honors existing hash targets instead of always resetting scroll; `#saved-tutors` receives focus. No auth/domain/route/data changes.

### Parent corner analysis — unchanged

“Góc phụ huynh” targets `/learner#stories`, three public guidance articles about choosing a tutor, maintaining a schedule and describing learning goals. It is not a parent account-management feature. Learner/Parent share role `learner`, distinguished by accountType. Browser inspection found an existing SPA anchor limitation: clicking from Search updates URL but does not scroll to stories (1366×600: scrollY=0, section y≈6337). This navigation/landing was deliberately left unchanged as requested.

### Verification

- Build passed (approximately 548 kB main JS chunk; existing >500 kB warning). Unit tests: 186 passed.
- `learner-account-menu.spec.js`: six viewport cases plus keyboard, real routes/saved focus/logout persistence, and long parent identity. Browser screenshots reviewed at desktop, tablet and mobile, including the parent label. Menu bounds/hit testing, unchanged header/search positions and mobile navigation exclusion are asserted.
- Responsive coverage: 1440×650, 1366×600, 1024×768, 768×1024, 390×844, 375×667. Existing Search, auth, account isolation and connected public/Tutor responsive suites passed (34 E2E cases including the nine account cases).
- Final focused pass: 12 passed, rerunning the nine account cases with Space activation/mobile keyboard navigation, plus Admin header/logout and Learner appeal-entry regression checks (37 distinct E2E cases across both runs).
- Browser: installed Microsoft Edge/Chromium via ignored temporary Playwright config; no library or runner-config changes committed. Screenshots remain ignored artifacts in `apps/web/test-results/`.

## LSEARCH-001 — Search-first Learner UI (2026-10-10)

### Scope and behavior

`/learner/search` has a dedicated compact cream hero, keyword search inside the hero, one multi-select filter set, removable filter chips, and a full-width tutor grid at 3/2/1 columns. The “Xem bản đồ” link opens the illustrative Learner map at `/map`; tutor coordinates and distances there are examples only. Mobile reuses the same filter controls in a scrollable dialog. Search CSS uses the exclusive `.learner-search-view` scope because other Learner pages also use `.learner-search-page`.

Learner app navigation replaces the Tutor acquisition link with `/requests` and exposes route-based `aria-current`, including request detail. Only Search opts into the compact header. PublicHeader adds optional class/current-link rendering; public landing structure, Tutor/Admin workspaces, auth guards and shared domain data are unchanged.

### Regression found and fixed

At 390×844 and 375×667, signing in from the scrolled mobile login form carried the scroll offset into Search. The keyword field started at y=-237.61 / -322.61 instead of appearing in the first viewport. The two viewport tests failed before the fix and passed after Search resets scroll on mount before paint. Do not hide this regression by resetting scroll in test setup after login.

Desktop filter popovers measure available viewport space, open above when needed, and scroll internally. Test the last checkbox as well as panel bounds; page-level overflow alone does not prove the dropdown is usable. Resizing an open mobile dialog to desktop closes it and releases the body scroll lock.

### Verification

- `npm run build`: passed; Vite reports a bundle over 500 kB (approximately 545 kB minified). Bundle splitting is outside this Learner UI batch.
- `npm test`: 186 passed, 0 failed/skipped.
- `tests/e2e/learner-search.spec.js`: 9 passed after the scroll fix. Covers first viewport, control bounds, dropdown scrolling, OR/AND multi-select, fee, keyword, sorting, empty reset, keyboard/focus/ESC, resize, saved-state reload and Learner navigation.
- Existing `learner-tutor-interface`, `account-scoping`, `domain-regressions` and `responsive` suites: 25 passed. These exercise Learner routes, request propagation, account isolation and connected public/Tutor screens without React/page console errors.
- Browser: installed Microsoft Edge (Chromium) through an ignored temporary Playwright config, because this environment does not have Playwright's downloaded Chromium binary. No dependency or committed runner-config change.
- Visual review: 1440×650, 1366×600, 1024×768, 768×1024, 390×844 and 375×667. No page overflow or horizontally clipped controls. Hero is about 240–245px desktop/tablet and 281px mobile; keyword field ends at y≈283 desktop and y≈263 mobile. At 1366×600 the first tutor row begins at y≈548.
- Screenshots are local ignored artifacts in `apps/web/tmp/` and `apps/web/test-results/`; the search page uses no remote illustration. Public landing image loading still depends on its existing external assets.

## ADM-REG-005 — Mobile table actions clipped inside cells

### Symptom
At 390px, some Tutor approval/suspension controls were partly clipped even with no page overflow.
### Root cause
Mobile enlarged buttons to 44px, but their nowrap flex row no longer fit the fixed table column; td overflow hidden clipped actions.
### Invariant
Every action button fits within its cell and remains independently usable after horizontal table scrolling. Keep tap target size; wrap actions instead of hiding/shrinking them.
### Regression test
`tests/e2e/admin-improvements.spec.js` — `ADM-REG-005 mobile table action buttons stay inside their cell`: RED CONFIRMED (button bounds exceeded cell); green after allowing row wrap. Connected-screen QA checks the same bounds in every Admin table.
### Files affected
`features/admin/admin.css`.
### Prevention
Check button bounds against their clipped cell, not just viewport bounds. Scroll to the final table columns during visual review.
### Date / context
2026-10-05 — Admin QA; no commit.

## ADM-REG-004 — Dashboard totals incorrectly displayed zero

### Symptom
The dashboard showed zero reviews/issues despite populated lists.
### Root cause
UI requested totalReviews/totalIssues that selectAdminStats did not return, and silently fell back to zero.
### Invariant
Functional summary values derive from shared collection counts; missing selector output must not masquerade as a legitimate empty collection.
### Regression test
`tests/adminReviewMetrics.test.js` — `ADM-REG-004 dashboard totals match the shared review and issue collections`: RED CONFIRMED (undefined versus 6); passed after fix. `tests/e2e/admin-improvements.spec.js` — `ADM-REG-004 visible dashboard metrics match shared records`: browser green verification added after prerequisite fix; no independent browser red claimed.
### Files affected
`features/domain/useAdminDomain.js`.
### Prevention
Compare summary totals with list data during QA, not merely the presence of metric cards.
### Date / context
2026-10-05 — Admin QA; no commit.

## ADM-REG-003 — Admin Dashboard mobile grid overflow

### Symptom
390px viewport rendered a 637px-wide dashboard; summary/table headers and actions were outside the visible page.
### Root cause
The single `1fr` track retained its automatic minimum from an unbounded subgrid; nonwrapping header actions inflated that minimum. A nowrap review excerpt also exceeded its column after the real font loaded.
### Invariant
Dashboard sections fit the page; wide tables scroll inside their region. Header/title/count/links reflow without hiding controls.
### Regression test
`tests/e2e/admin-improvements.spec.js` — `ADM-REG-003 mobile dashboard stays within the viewport without clipping header actions`. RED CONFIRMED: scrollWidth 637 at 390px; a font-ready rerun exposed remaining width 624px. Both passed after bounding the grid and excerpt.
### Files affected
`features/admin/admin.css`.
### Prevention
Use minmax(0,1fr) and bounded inner grids/excerpts; wait for document.fonts.ready before measuring. Inspect section headers and both columns after real data/copy is added. Wait for drawer motion to finish before measuring its bounds. Do not accept a screenshot whose canvas silently expanded past the test viewport.
### Date / context
2026-10-05 — Admin QA; no commit.

## ADM-REG-002 — Comparison cards in a narrow drawer

### Symptom
At 1440px, two account cards were squeezed into the 520px detail drawer; identity/contact/history text had insufficient room.
### Root cause
Two equal columns were chosen using page width even though their container remained narrow.
### Invariant
Comparison must adapt to the drawer's usable width; full-page overflow checks do not prove the inner cards are readable.
### Regression test
`apps/web/tests/e2e/admin-improvements.spec.js` — `ADM-REG-002 desktop comparison preserves readable party cards in the narrow drawer`. RED CONFIRMED: card width 219px, below 260px; green after stacking in this drawer.
### Files affected
`features/admin/admin.css`.
### Prevention
Review inner container widths and long Vietnamese text at every breakpoint; do not choose columns only from viewport width.
### Date / context
2026-10-05 — Admin reports/appeals batch; no commit.

## ADM-REG-001 — Admin drawer keyboard boundary

### Symptom
Opening an Admin detail drawer left focus on the table behind the modal; keyboard users could operate obscured controls.
### Root cause
AdminSlideOver only handled ESC, with no focus capture, trap or return.
### Invariant
Every Admin drawer captures focus, traps Tab/Shift+Tab, closes with ESC and returns focus to its trigger; background scrolling is locked.
### Regression test
`apps/web/tests/e2e/admin-improvements.spec.js` — `ADM-REG-001 drawer traps keyboard focus and restores its trigger`. RED CONFIRMED: active element remained outside dialog; targeted test passed after reuse of useDialogFocus.
### Files affected
`features/admin/AdminSlideOver.jsx`.
### Prevention
Reuse the established dialog hook; role=dialog alone does not provide keyboard behavior. QA must exercise keyboard navigation, not just click/ESC.
### Date / context
2026-10-05 — Admin reports/appeals batch; no commit.

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
