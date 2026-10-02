# Architecture và routing — frontend prototype

## Auth V4 update (implemented)

- Shared login: `/login`; learner/parent registration: `/register`; tutor registration: `/tutor/register`.
- `AuthFrame` resets scroll to the top before paint on every Router navigation into Auth, including a link to the current Auth route. Redirect queries are preserved.
- `features/auth/` owns the demo auth context, route helpers, pages, provider buttons and OTP modal. `ProtectedRoute` wraps the learner, tutor and admin product routes and checks the demo role.
- Mock accounts and newly registered demo accounts persist in localStorage. This is frontend-only state, not secure authentication or server authorization.
- `LEARNER_HOME_PATH` in `features/auth/authUtils.js` is the single default learner destination (`/learner/search`). Tutor and admin defaults are their dashboards.
- Internal `redirect` paths survive protected-route → login → registration; external, protocol-relative, backslash and auth-loop targets are rejected. A tutor redirect to a protected tutor route uses tutor registration when provider identity is new.
- Provider payloads are limited to fields in `MOCK_PROVIDER_PAYLOADS`; Google’s named/email payload is inherited from the approved V4 reference and marks the email verified. Facebook supplies only the reference name. Phone uses demo OTP `123456`.
- Provider verified fields remain editable and lose verified status after edits. New accounts always set a TutorNearMe password. Quick registration and its divider disappear after provider verification.
- Demo credentials: `minhanh`, `giabao`, or `admin` with `demo1234`.
- `/admin/login` is not a route; A01 is the shared `/login` screen.

Giai đoạn hiện tại chỉ có **một ứng dụng React/Vite tại `apps/web`**. Không có backend, API client, database, auth guard server-side hay authorization thực. Scaffold full-stack cũ được giữ nguyên văn trong [`PROJECT_HISTORY.md`](../archive/PROJECT_HISTORY.md) để tra cứu, không phải cấu trúc đang chạy.

## Cấu trúc source

```text
apps/web/src/
  App.jsx, main.jsx       React Router và entry point
  components/             primitive dùng chung giữa role
  data/                   mock data; tutors.js là nguồn hồ sơ gia sư gốc
  features/public/        homepage, Learner landing, Tutor acquisition, public chrome
  features/auth/          shared mock auth, registration pages, protected-route helpers, OTP modal
  features/learner/       search, tutor detail, request pages
  features/tutor/         dashboard, sidebar, profile, availability, requests, lessons
  features/admin/         operational dashboard
  hooks/                  localStorage demo và dialog keyboard focus
  styles/                 semantic tokens, reset, global và shared flow styles
```

Mock data ở `src/data`; local state/localStorage chỉ phục vụ tương tác và đi qua route/reload trong prototype. `reference/final/*` quyết định appearance; [`FIGMA_ANALYSIS.md`](../design/FIGMA_ANALYSIS.md) lưu evidence cấu trúc. Public Learner, Tutor workspace và Admin có shell riêng. Không xem trạng thái demo là business rule cuối.

## Route đã implement

| Khu vực | Route | Nội dung |
|---|---|---|
| Public Auth | `/login`, `/register`, `/tutor/register` | Shared role-resolving mock login; Learner/Parent and Tutor registration. |
| Public | `/` | Trang chủ theo `reference/final/homepage/`. |
| Public Learner | `/learner` | Landing Người học/Phụ huynh theo `reference/final/learner/`. |
| Public Tutor | `/tutor` | Landing tuyển gia sư theo `reference/final/tutor/`; **không phải** dashboard. |
| Learner product | `/learner/search`, `/tutors/:id`, `/requests/new`, `/requests`, `/requests/:id` | Tìm/lọc, hồ sơ, tạo và theo dõi yêu cầu. `/requests/:id` chứa trạng thái buổi học và form review demo khi hoàn tất. |
| Tutor workspace | `/tutor/dashboard`, `/tutor/profile`, `/tutor/availability`, `/tutor/requests`, `/tutor/requests/:id`, `/tutor/lessons` | Agenda, profile, lịch rảnh, yêu cầu và lịch dạy demo. Môn, phí, khu vực hiện gộp trong `/tutor/profile`. |
| Admin workspace | `/admin/dashboard` | Dashboard vận hành demo. |

All learner product routes listed above are protected for the learner role, tutor workspace routes for tutor, and Admin dashboard for admin. Unauthenticated users are redirected to `/login?redirect=...`; after login/registration a safe destination is restored, otherwise the role default is used.

## Planned trong screen inventory, chưa implement

- Learner lesson detail và review route riêng.
- Tutor onboarding mở rộng, subject/pricing/location settings riêng và lesson detail riêng.
- Admin `/admin/users`, `/admin/users/:id`, `/admin/tutors`, `/admin/tutors/:id`, `/admin/subjects`, `/admin/reviews`, `/admin/issues`, `/admin/issues/:id`, `/admin/locations`; các màn reports/settings/logs để sau core. A01 uses the shared `/login` route; `/admin/login` is not implemented.

Xem [`SCREEN_INVENTORY.md`](../screens/SCREEN_INVENTORY.md) để biết ID/MVP của từng màn. Danh sách planned chỉ là hướng điều hướng dự kiến; không tạo route giả hoặc ngầm khẳng định chức năng đã chạy.
