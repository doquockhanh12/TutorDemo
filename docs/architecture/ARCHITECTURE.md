# Architecture và routing — frontend prototype

## Auth V4 update (implemented)

- Shared login: `/login`; learner/parent registration: `/register`; tutor registration: `/tutor/register`.
- `AuthFrame` resets scroll to the top before paint on every Router navigation into Auth, including a link to the current Auth route. Redirect queries are preserved.
- `features/auth/` owns the demo auth context, route helpers, pages, provider buttons and OTP modal. `ProtectedRoute` wraps the learner, tutor and admin product routes and checks the demo role.
- Mock auth persists in localStorage when Remember login is enabled, otherwise sessionStorage. Learner profile updates replace the matching demo account by ID and preserve the active storage mode. This is frontend-only state, not secure authentication or server authorization.
- `LEARNER_HOME_PATH` in `features/auth/authUtils.js` is the single default learner destination (`/learner/search`). Tutor and admin defaults are their dashboards.
- Internal `redirect` paths survive protected-route → login → registration; external, protocol-relative, backslash and auth-loop targets are rejected. A tutor redirect to a protected tutor route uses tutor registration when provider identity is new.
- Provider payloads are limited to fields in `MOCK_PROVIDER_PAYLOADS`; Google’s named/email payload is inherited from the approved V4 reference and marks the email verified. Facebook supplies only the reference name. Phone uses demo OTP `123456`.
- Provider verified fields remain editable and lose verified status after edits. New accounts always set a TutorNearMe password. Quick registration and its divider disappear after provider verification.
- Demo credentials: `minhanh`, `giabao`, or `admin` with `demo1234`.
- `/admin/login` is not a route; A01 is the shared `/login` screen.

Giai đoạn hiện tại chỉ có **một ứng dụng React/Vite tại `apps/web`**. Không có backend, API client, database, auth guard server-side hay authorization thực. Scaffold full-stack cũ được giữ nguyên văn trong [`PROJECT_HISTORY.md`](../archive/PROJECT_HISTORY.md) để tra cứu, không phải cấu trúc đang chạy.

## Cấu trúc source

Scheduling foundation nằm tại `features/scheduling/`: Tutor dùng `WeeklyTimeline` với geometry 72px/giờ thu gọn, 240px/giờ mở rộng, chỉ mở một giờ; chọn mốc 5 phút, kéo snap 10 phút khi thu gọn và 5 phút trong giờ mở. Tutor thêm theo ngày/giờ, kéo/xóa availability trong nháp và Lưu/Hủy; Lesson chỉ mở detail hiện có. `TimeConfirmation` dùng focus trap/ESC/return focus hiện có. Mobile/tablet cuộn ngang/dọc trong timeline, sticky ngày và giờ; không giảm chữ để ép đủ 7 ngày. Learner `ProfileCalendar` dùng bảng buổi học gọn riêng, đọc cùng public bookable ranges và session setting. `bookableSessions` trong `profileSelection.js` chia range thành các buổi đủ thời lượng từ đầu range, bỏ phần dư; nhấn chọn/bỏ đồng bộ concrete proposals trực tiếp với form. Không có mở rộng giờ, sửa mốc, drag, thêm lịch hoặc modal trên Learner. Bảng cuộn ngang trong container ở màn nhỏ; không lộ lesson data riêng tư.

Availability contract: `{ id, tutorId, date, start, end }`; `date` là ngày ISO địa phương, `start/end` là phút từ 00:00. Lesson giữ cùng date/minute geometry và metadata riêng của Tutor. Weekly adapter dùng Monday index 0 và Sunday index 6 chỉ cho các tutor demo khác; `quoc-bao` luôn dùng saved workspace ranges. Public bookable range = saved availability trừ các lesson chưa cancelled, merge các khoảng liền nhau; không tự lặp saved availability ở tuần khác.

Verification scheduling: chạy `node --test` và `npm run build` tại `apps/web`. Regression cần bao gồm Tutor dashboard/timetable/find-students/profile/requests/detail và Learner search/canonical profile/static profile/requests/detail; cross-role QA dùng `giabao` lưu range rồi `minhanh` xem/chọn cùng range. Request sync Learner → Tutor → Learner đã được kiểm thử bằng cross-role E2E trên shared domain state.

`LessonDetailModal.jsx` là modal chi tiết lớp của Tutor, render qua portal tới body và dùng `useDialogFocus`. `DemoDomainContext.saveLessonNotes` cập nhật notes theo lesson ID và Tutor ownership trong canonical runtime state. Complete chỉ áp dụng cho confirmed/upcoming; pending/completed/cancelled không có action Complete. Hoàn tất và ghi chú dùng state cập nhật theo functional updater để giữ cả hai thay đổi; không sửa availability. Timeline áp dụng `is-completed` chỉ cho lesson hoàn tất, vẫn cho mở chi tiết.

Tutor class discovery: `TutorClassSearch.jsx` dùng TutorShell và shared workspace state; route `/tutor/find-students` yêu cầu role tutor. `data/tutorClassSearch.js` project metadata compatibility từ fixture; requests mới mang subjects/sessionFee/proposals riêng và không cần ID whitelist. Trang lọc multi-select/fee và kiểm tra mọi proposal được bao phủ hoàn toàn bởi availability range đã lưu đúng ngày, sau khi trừ lesson. Không dùng draft lịch. Không còn range rảnh thì khóa controls/báo lỗi; kết quả mở detail hiện có. Dashboard period preview và Find Students cùng đọc availability ranges. Tests: `node --test src/data/tutorClassSearch.test.js` từ `apps/web`.

Tutor scheduling: `TutorWorkspaceState.jsx` là facade/selectors trên `DemoDomainContext`, lọc requests/lessons/availability theo public Tutor ID của account hiện tại. Legacy workspace v2/v3 chỉ được đọc khi chưa có canonical state; migration giữ các key cũ. `TutorTimetable.jsx` giữ range draft riêng và chỉ Lưu mới cập nhật provider. Timeline chung 7 ngày chạy từ 06:00 đến 24:00; start muộn nhất 22:00, session dùng chung giữa Tutor profile, timetable và Learner là 45 hoặc 90 phút; registration dùng cùng tập giá trị. Learner chọn proposal cụ thể theo ngày/giờ và thời lượng trước khi gửi; `proposedLessons` ưu tiên các proposal đã lưu. Seed request proposals được resolve một lần khi seed/migration; `requestProposals` chỉ là compatibility export cho old callers/tests. Accept không resolve lại ngày của domain request. Acceptance kiểm tra overlap/duplicate, thêm lesson từ proposal và trừ lesson khỏi availability range. `/tutor/timetable` là trang lịch duy nhất; hai URL legacy `/tutor/availability` và `/tutor/lessons` vẫn protected redirect. Sidebar giữ một mục lịch. Dashboard period preview, request/detail/map và Find Students dùng chung workspace state; Find Students yêu cầu mọi proposal được bao phủ đầy đủ bởi saved range đúng ngày. Dữ liệu demo vẫn là local frontend state, không phải scheduling service hay quy tắc matching production.

`TutorProfilePage.jsx` and the request form share Learner selection state. `profileSelection.js` reexports proposal validation and labels from `data/tutorSchedule.js`; Learner chooses concrete date/start/end proposals whose duration matches the tutor's shared 45/90-minute session setting and whose full interval fits public bookable ranges. Public `/tutors/:id` uses saved, lesson-subtracted availability for canonical tutor `quoc-bao`; other public tutor profiles use a weekly-schedule adapter. The public scheduling projection allowlists only `id`, `tutorId`, `date`, `start`, and `end`; lesson identity and private lesson metadata are not returned. The request form persists selected subjects, levels, formats, areas and concrete proposals in local demo storage. `/requests/new` delegates to the profile form with query prefills preserved. Learner/Tutor resolve cùng Request ID qua shared domain selectors. Helper tests: `node --test tests/profileSelection.test.js` from `apps/web`.

`features/learner/TutorProfilePage.jsx` dùng LearnerHeader, profile.css và Search tokens. `TutorRequestForm.jsx` gọi domain action createRequest; action kiểm tra quyền demo/required selection/clock/containment/session duration rồi lưu concrete proposals và mở `/requests/:id`. Search/profile/saved dashboard đọc mutable profile qua selectors. `quoc-bao` giữ mapping `accountId: demo-tutor` / giabao; không đổi public ID. Tutor edits name/subjects/levels/area/fee/sessionMinutes/bio phản ánh vào Learner. Reviews seed vẫn là minh họa, không tự gán account ownership không có evidence. Profile actions dùng Router links, không quick-view modal.

```text
apps/web/src/
  App.jsx, main.jsx       React Router và entry point
  components/             primitive dùng chung giữa role
  data/                   demoReferenceData.js canonical immutable seed; compatibility projections
  features/public/        homepage, Learner landing, Tutor acquisition, public chrome
  features/auth/          shared mock auth, registration pages, protected-route helpers, OTP modal
  features/domain/        canonical runtime provider, actions/selectors, status metadata
  features/learner/       search with illustrative split-view map, tutor detail, dashboard/account editing, request pages
  features/tutor/         dashboard, sidebar, profile, timetable, requests, shared mock schedule state
  features/scheduling/    shared weekly timeline, geometry, time confirmation và CSS
  features/admin/         operational dashboard, lists, moderation, reports, appeals
  features/appeals/       shared user submission, evidence and appeal history
  hooks/                  localStorage demo và dialog keyboard focus
  styles/                 semantic tokens, reset, global và shared flow styles
```

Mock data ở `src/data`; local state/localStorage chỉ phục vụ tương tác và đi qua route/reload trong prototype. `reference/final/*` quyết định appearance cho các trang tương ứng. Learner/Tutor dùng current React + current product behavior theo user requirements/PRODUCT_SPEC/ARCHITECTURE; Figma chỉ historical/reference evidence, không tự restore structure cũ. Admin future screens dùng active Admin Figma structural evidence cho đến khi user duyệt structure/reference mới, cùng current visual system; existing Admin React dùng ở phần tương thích. [`FIGMA_ANALYSIS.md`](../design/FIGMA_ANALYSIS.md) bảo tồn cả hai loại evidence. Policy này không thay runtime routes, state hoặc implemented/planned status. Public Learner, Tutor workspace và Admin có shell riêng. Không xem trạng thái demo là business rule cuối.

## Route đã implement

| Khu vực | Route | Nội dung |
|---|---|---|
| Public Auth | `/login`, `/register`, `/tutor/register` | Shared role-resolving mock login; Learner/Parent and Tutor registration. |
| Public | `/` | Trang chủ theo `reference/final/homepage/`. |
| Public Learner | `/learner` | Landing Người học/Phụ huynh theo `reference/final/learner/`. |
| Public Tutor | `/tutor` | Landing tuyển gia sư theo `reference/final/tutor/`; **không phải** dashboard. |
| Learner product | `/learner/search`, `/map`, `/learner/dashboard`, `/tutors/:id`, `/requests/new`, `/requests`, `/requests/:id` | Tìm/lọc với lưới gia sư full-width và link tới bản đồ minh họa `/map`, dashboard với hồ sơ/địa chỉ chỉnh sửa, lịch/yêu cầu và gia sư đã lưu; hồ sơ gia sư, tạo và theo dõi yêu cầu. `LearnerAccountPanel` dùng `DemoAuthContext.updateProfile` để cập nhật mock account theo ID, giữ phiên lưu hiện tại và bỏ verified khi email/phone đổi; `dashboard.css` được scope riêng. `/requests/:id` chứa trạng thái buổi học và form review demo khi hoàn tất. |
| Tutor workspace | `/tutor/dashboard`, `/tutor/profile`, `/tutor/timetable`, `/tutor/income`, `/tutor/map`, `/tutor/find-students`, `/tutor/requests`, `/tutor/requests/:id` | Profile, yêu cầu và bảng lịch dạy/lịch rảnh chung; Income từ completed Lessons; map minh họa và tìm học viên theo lịch rảnh đã lưu. Hai URL lịch cũ redirect tới timetable. Môn, phí, khu vực hiện gộp trong `/tutor/profile`. |
| Admin workspace | `/admin/dashboard`, `/admin/users`, `/admin/tutors`, `/admin/reviews`, `/admin/issues`, `/admin/appeals` | Dashboard, tài khoản, duyệt hồ sơ, review, báo cáo và kháng cáo; chi tiết mở drawer. |
| Account appeals | `/appeals` | Learner/Tutor gửi và theo dõi hồ sơ; chưa đăng nhập phải xác thực trước khi xem dữ liệu riêng. |

All learner product routes listed above are protected for the learner role, tutor workspace routes for tutor, and Admin workspace routes for admin. Unauthenticated users are redirected to `/login?redirect=...`; after login/registration a safe destination is restored, otherwise the role default is used. Appeal-only sessions cannot access protected product routes.

## Planned trong screen inventory, chưa implement

- Learner lesson detail và review route riêng.
- Tutor onboarding mở rộng, subject/pricing/location settings riêng và lesson detail riêng.
- Admin subject/location management, settings/logs/permissions vẫn Planned. User/tutor/issue detail dùng drawer hiện có, không có route detail riêng. A01 uses the shared `/login` route; `/admin/login` is not implemented.

Xem [`SCREEN_INVENTORY.md`](../screens/SCREEN_INVENTORY.md) để biết ID/MVP của từng màn. Danh sách planned chỉ là hướng điều hướng dự kiến; không tạo route giả hoặc ngầm khẳng định chức năng đã chạy.

## Ranh giới dữ liệu và UI hiện tại

- `LearnerHeader` được reuse tại Search, map, profile, Dashboard và request list/detail/error. Search dùng lưới full-width và mở route bản đồ riêng `/map`. Header dựa vào mock auth hiện tại, không dùng các action Login/Register của public marketing. `LearnerPages.jsx` giữ footer public nhưng không thay đổi phiên đăng nhập.
- Nút tạo request nằm ở detail, truyền `tutor` vào `/requests/new`; không có nút này ở list. Khi thiếu query tutor, route legacy vẫn fallback về hồ sơ demo đầu tiên; đây là behavior hiện tại, không phải cơ chế chọn tutor mới.
- Runtime domain persist duy nhất tại `tnm.demo.domain.v1`: profiles, requests, lessons, availability, settings, savedByAccount và nextRequestNumber; Admin users/reviews/issues cùng appeals cũng thuộc shared domain. Learner private requests filter learnerId; saves keyed account ID. Legacy `tnm.savedTutors`, `tnm.learnerRequests`, `tnm.tutor.workspace.v2/v3`, `tnm.tutorRequests`, `tnm.tutor.referenceRequests.v1`, `tnm.tutor.scheduleChecks.v1`, `tnm.tutorProfile` chỉ migration/compatibility và không bị xóa.
- Tutor profile, timetable và Learner dùng một session setting 45 hoặc 90 phút trong workspace; registration dùng cùng tập giá trị và account duration cũ ngoài tập này được chuẩn hóa về 45. Tutor đăng ký mới tạo runtime profile từ đúng dữ liệu user nhập và settings/availability riêng theo ID; các field không được cung cấp (rating/experience/formats/levels) không được bịa. Cấp độ sửa tại profile; registration hiện chưa có field hình thức dạy nên profile mới không tự có Online/Tại nhà. Session setting điều khiển proposal mới; migration của lesson giữ ngày/giờ cụ thể hiện có. Timeline dùng khoảng 06:00–24:00 với thời điểm bắt đầu tối đa 22:00; độ dài availability/lesson không bị làm tròn về slot 45 phút.
- Header Tutor dùng auth identity; greeting/profile summary dùng cùng canonical mutable Tutor profile. Functional Income đọc shared Lessons qua useTutorIncome; progress vẫn là layout-support illustration. Không có ledger/account balance/payment thật.

## Canonical fixture và replacement boundary

`data/demoReferenceData.js` là immutable temporary frontend seed/reference, không phải database hoặc mutable store. Nó chứa accounts, learnerProfiles, tutorProfiles, requests/proposalTemplate, lessonTemplates, historicalLessons, availability từ schedule, reviews, subjects, teachingLevels, locations và providerPayloads; các legacy metadata/defaults chỉ phục vụ compatibility/migration. `createDemoState(referenceDate)` clone seed và resolve concrete dates của templates một lần; absolute historicalLessons join cùng state.lessons.

```text
demoReferenceData → demoDomain actions / DemoDomainProvider → selectors/hooks → screens
Future backend/API → same runtime boundary → selectors/hooks → screens
```

Domain request codes: pending/accepted/rejected/cancelled. Labels/tone dùng statusMetadata; Hoàn tất của Learner derive từ related completed Lessons (hoặc historical completed marker khi chưa có linked Lesson). Learner không tự complete; review chỉ lưu sau completion. Functional fee/budget là VNĐ / buổi, không convert số tiền. Session duration mutable đọc từ settings theo Tutor ID, seed quoc-bao là 45 phút từ current workspace default.

Migration không coi historical dashboard identity là canonical. Old untouched profile defaults bị bỏ qua; field đã chỉnh được giữ. Legacy global private state chỉ gán demo-learner đã biết; không gán account khác. Unknown ownership giữ null. Không đọc lại legacy khi canonical v1 đã tồn tại.

### Income projection và seed reconciliation

`features/domain/incomeSelectors.js` cung cấp pure numeric eligibility, monthly total/count/subject groups/top subject và last N calendar months. `DemoDomainContext.useTutorIncome` nối canonical lessons/current Tutor ID với selectors; `TutorIncome.jsx`, Dashboard và support dùng cùng boundary, không đọc fixture hoặc legacy dashboardIncome. Không có Income storage riêng. Future backend Lesson adapter thay provider data mà UI không cần rewrite.

`restoreDemoState` reconcile historical seed theo stable ID trên cả v1 và legacy migration: chỉ thêm ID thiếu, runtime record cùng ID thắng, giữ mọi state khác và runtime-created Lessons. Legacy operational Lesson có ID khớp template chỉ được hydrate sessionFee nếu field thiếu/null và seed fee hữu hạn; fee runtime hiện có không đổi. Repeated restore không duplicate hoặc reset state. `proposedLessons` snapshot request.sessionFee cho mỗi Lesson, không lấy profile.price; unknown fee vẫn unknown. Income theo lesson.date, chỉ completed với finite numeric fee thuộc Tutor hiện tại.

## Regression verification

Timetable reconciliation trừ occupied Lessons khỏi saved availability; renderer tách các khung trùng thành cột đủ rộng và cảnh báo, không tự đổi ngày/giờ. Modal completed Lesson hiển thị snapshot fee và tháng thu nhập theo lesson.date. User-approved cleanup 2026-10-04 loại đúng buổi Math req-1 ngày 01/10/2026 và khoảng rảnh tối 02/10/2026 quanh IELTS; `appliedDemoCleanups` trong shared state làm correction một lần, không reset fixture/state hoặc xóa các chỉnh sửa sau đó. Ghi chú QA và invariant tại FRONTEND_REGRESSION_NOTES.

Tại apps/web: `node --test`, `npm run build`, `npm run test:e2e`. Playwright Chromium dùng một worker, fixed clock/timezone và reset state từ canonical fixture cho mỗi test; không phụ thuộc thứ tự test. Không chạy hai Playwright runner đồng thời trên cùng output folder. Browser route coverage gồm public/Auth và toàn bộ current Learner/Tutor connected screens, 1440/1024/390px, modal, console và page overflow. Legacy Maps smoke test được giữ, không mở rộng Maps. Root cause/invariants tại [FRONTEND_REGRESSION_NOTES.md](../quality/FRONTEND_REGRESSION_NOTES.md).

## Admin reports / appeals — 2026-10-05

- `accountHistory` và `issueTargetId` trong `features/domain/appeals.js` resolve stable account/profile IDs; lịch sử hai bên derive từ cùng issues và user warnings. Không tạo lịch sử giả cho field thiếu; UI nói rõ thiếu chi tiết.
- `/appeals` dùng shared domain `appeals[]`, `nextAppealNumber`; không store/storage riêng. Old v1 restore thêm array rỗng khi thiếu, giữ hồ sơ runtime. Submit kiểm tra ownership, reason, tối thiểu 20 ký tự giải trình, 1–3 bằng chứng và truthful declaration. Pending/in_review cùng sự cố không được gửi trùng.
- Bằng chứng là URL http/https hoặc nội dung tệp ảnh/PDF thực được đọc bằng FileReader, không chỉ tên tệp. Mỗi tệp tối đa 500 KB, tổng 1 MB trong demo; không upload server. Admin đối chiếu nội dung, không có xác thực bằng chứng tự động.
- `/admin/appeals` dùng cùng entity ID, review action chỉ Admin, bắt buộc phản hồi/căn cứ. pending → in_review/accepted/rejected; kết quả lưu và phản ánh lại cho người gửi. Không tự xóa warnings hoặc unsuspend sau acceptance vì policy đó chưa được duyệt.
- `loginForAppeal` xác thực credentials demo và lưu sessionStorage với appealOnly; ProtectedRoute chặn mọi product route và về `/appeals`. Standard login cho account suspended vẫn bị từ chối như trước. `/login`, Learner Dashboard và Tutor sidebar nối tới kháng cáo.
- AdminSlideOver dùng shared useDialogFocus cho focus trap/ESC/return focus/body-scroll lock. Drawer đối soát xếp một cột vì container hẹp; tables cuộn trong vùng riêng, action buttons wrap giữ tap targets. Backend thay provider/adapter sau này; không thay UI bằng fixture import.
