# Specification & Requirements Catalog: Admin Flow Subsystem

**Document Version:** 1.0.0  
**Investigator:** `teamwork_preview_spec_miner_survey_1`  
**Target Subsystem:** TutorNearMe Admin Flow Subsystem & Cross-Role Synchronizations  
**Authoritative Sources:**
- `d:/tutor demo/TutorDemo/.agents/teamwork/ORIGINAL_REQUEST.md`
- `d:/tutor demo/TutorDemo/AGENTS.md`
- `docs/planning/PRODUCT_SPEC.md`
- `docs/design/FIGMA_ANALYSIS.md`
- `docs/screens/SCREEN_INVENTORY.md`
- `docs/quality/FRONTEND_REGRESSION_NOTES.md`
- Existing codebase (`apps/web/src/features/`, `apps/web/src/data/`, `apps/web/tests/`)

---

## 1. Executive Summary & Authoritative Hierarchy

### 1.1 Project & Prototype Scope
TutorNearMe is an interactive frontend-only prototype built in React 19 + Vite (`apps/web`). There is no backend, database, or server-side authorization. All cross-role interactions (Learner, Tutor, Admin) operate on a single canonical shared domain persisted in `localStorage` under the single key:
```javascript
export const DOMAIN_STORAGE_KEY = 'tnm.demo.domain.v1';
```

### 1.2 Specification Hierarchy (per AGENTS.md)
1. **Latest explicit user request** (`ORIGINAL_REQUEST.md` — 2026-10-04T18:16:59Z).
2. **Current batch prompt & guardrails** (`AGENTS.md`).
3. **Product specification** (`docs/planning/PRODUCT_SPEC.md`).
4. **Architectural contract** (`docs/architecture/ARCHITECTURE.md`).
5. **Current React implementation & behavior** (55 passing unit tests, established components).
6. **Admin structural reference** (`docs/design/FIGMA_ANALYSIS.md` — 6 confirmed frames: `Flow3/Admin/Dashboard`, `Flow3/3F Tutor Approval Detail`, `Flow3/3G Live Classes`, `Flow3/3H Review Moderation`, `Flow3/3I Reports Complaints`, `Flow3/3J Suspended Requests Ticket`).
7. **Visual system** (`DESIGN.md` — Nunito / Nunito Sans, Lucide icons, semantic tokens, compact administrative density).

---

## 2. Comprehensive Requirements Catalog (R1 – R7)

### R1. Admin Shell & Navigation

| Field | Specification Details |
|---|---|
| **Objective** | Provide a unified, responsive `AdminShell` layout with persistent `AdminHeader` and `AdminSidebar`. |
| **Component Layout** | `AdminShell` wraps all admin routes (`/admin/dashboard`, `/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`). |
| **AdminHeader Requirements** | 1. **Complete removal of `RoleSwitcher`**: `<RoleSwitcher />` must be eliminated from Admin header.<br>2. **Identity**: Retain admin avatar with initials `AD`, label `Quản trị viên`, tone `slate`/neutral.<br>3. **Logout Button**: Add explicit red logout button using Lucide `LogOut` icon. Clicking invokes `logout()` from `useDemoAuth()`, clears user session, and navigates to `/login`.<br>4. **Location Breadcrumb**: Displays `Quản trị > [Tên trang hiện tại]`.<br>5. **Mobile Trigger**: Hamburger menu button (`Menu` icon) visible below 1024px to toggle sidebar. |
| **AdminSidebar Requirements** | 1. **Active Route Management**:<br>   - `/admin/dashboard`: "Tổng quan" (`LayoutDashboard`)<br>   - `/admin/tutors`: "Gia sư" (`ShieldCheck`), reactive badge: pending tutor approvals<br>   - `/admin/users`: "Người dùng" (`Users`)<br>   - `/admin/reviews`: "Đánh giá" (`MessageSquareWarning`), reactive badge: reviews needing moderation<br>   - `/admin/issues`: "Báo cáo & sự cố" (`AlertCircle` / `FileWarning`), reactive badge: open/unresolved issues (`status !== 'resolved'`)<br>2. **Visual Consistency**: Retains brand logo `<Brand compact />`, section header `QUẢN TRỊ HỆ THỐNG`, and environment footer `Bản demo frontend · TutorNearMe · Admin workspace`.<br>3. **Mobile Drawer Behavior**: Below 1024px, sidebar translates off-canvas (`transform: translateX(-100%)`). When open, renders backdrop scrim (`.workspace-scrim`); clicking scrim, close button (`X`), or navigating dismisses drawer. |

---

### R2. Canonical Shared Domain Architecture

| Field | Specification Details |
|---|---|
| **Objective** | Integrate the complete Admin subsystem into the existing canonical domain without creating secondary stores or duplicate catalogs. |
| **Storage Invariant** | Strictly maintain single storage key `tnm.demo.domain.v1`. **NO** secondary keys (e.g. no `tnm.admin.*`, no `tnm.admin.dashboard`). |
| **Entity Extensions** | Extend `src/data/demoReferenceData.js` and `src/features/domain/demoDomain.js`: <br>1. **Tutors (`state.profiles`)**: add `moderationStatus` (`'pending' \| 'approved' \| 'rejected' \| 'suspended'`), `submitted`, `rejectionReason`, `verificationDocuments`.<br>2. **Users / Accounts (`state.users` / `accounts`)**: add account status (`'active' \| 'suspended'`), join with canonical activity stats.<br>3. **Reviews (`state.reviews`)**: add canonical moderation status (`'pending' \| 'approved' \| 'hidden'`), visibility (`'public' \| 'hidden'`), reviewer info, rating, excerpt, and lesson link.<br>4. **Issues (`state.issues`)**: add issue ticket entities with category (`absence`, `lesson_dispute`, `cancellation`, `fee_dispute`, `attitude`), related entities, status (`new`, `in_progress`, `resolved`), admin resolution note. |
| **Adapter Hooks** | Build clean Admin hooks residing in `src/features/domain/` / `src/features/admin/hooks/`:<br>- `useAdminOverview`: system metrics, recent approvals, live classes, pending reviews, open issues.<br>- `useAdminTutors`: tutor list, filter tabs, instant search, approve, reject (with reason), suspend, unsuspend.<br>- `useAdminUsers`: user list, filter tabs, instant search, activity projections, suspend, unsuspend.<br>- `useAdminReviews`: reviews list, filter tabs, instant search, approve, hide.<br>- `useAdminIssues`: issues list, filter tabs, instant search, update status, resolve (with note). |
| **UI Layer Decoupling** | Admin UI components must **only consume these hooks**. Zero direct `localStorage` access, zero mock calculations inside presentation components. |

---

### R3. Deterministic Admin Demo Seed Data

| Entity | Deterministic Seed Fixtures |
|---|---|
| **Tutors** | - **Approved Tutors**: `mai-anh`, `quoc-bao`, `ha-linh`, `duc-minh` (existing canonical tutors, approved, active in learner discovery).<br>- **Pending Tutors**: `thao-vy` (Lê Thảo Vy, ĐH Sư phạm TP.HCM, Tiếng Anh, 160.000đ), `hoang-phuc` (Nguyễn Hoàng Phúc, ĐH Bách khoa TP.HCM, Toán · Vật lý, 180.000đ), `minh-chau` (Trần Minh Châu, ĐH KHXH&NV, Ngữ văn, 150.000đ). Must include submission date, bio, university, and verification document cards.<br>- **Rejected Tutor**: `tuan-anh` (Nguyễn Tuấn Anh, ĐH Quốc tế, rejection reason: "Thông tin văn bằng và chứng chỉ không trùng khớp").<br>- **Suspended Tutor**: `quang-huy` (Vũ Quang Huy, ĐH Kinh tế, suspended status due to unresolved complaints). |
| **Users** | - **Active Learners**: `minhanh` (Nguyễn Minh Anh, account `demo-learner`), plus learner profiles for demo requests.<br>- **Active Tutors**: `giabao` (Trần Gia Bảo, account `demo-tutor`, mapped to `quoc-bao`), plus other active tutors.<br>- **Admin**: `admin` (Quản trị viên, account `demo-admin`).<br>- **Suspended Accounts**: At least one suspended learner account and one suspended tutor account (e.g. `user-suspended-learner`, `user-suspended-tutor`) with reason for suspension recorded. |
| **Reviews** | - **Approved / Public**: `review-1` (Ngọc Lan, 5 stars), `review-2` (Hoàng Minh, 5 stars), `review-3` (Quỳnh Trang, 4 stars).<br>- **Pending Moderation**: `review-pending-1` (Phụ huynh Minh Khang, Mai Anh, 5 stars, "Cách giảng dễ hiểu, bé tự tin hơn sau vài buổi."), `review-pending-2` (Ngọc Hà, Đức Minh, 4 stars, "Gia sư đúng giờ và chuẩn bị bài kỹ.").<br>- **Hidden / Rejected**: `review-hidden-1` (Spam / inappropriate language, hidden from public profiles). |
| **Issues** | Deterministic tickets covering all required categories:<br>- `IS-2048` (Vắng mặt / absence): "Gia sư không đến buổi học ngày 02/10 và không thông báo trước", status: `new` (Mới tiếp nhận).<br>- `IS-2045` (Tranh chấp giờ học / lesson_dispute): "Bất đồng về thời lượng buổi học thực tế (30 phút thay vì 45 phút)", status: `in_progress` (Đang xử lý).<br>- `IS-2041` (Hủy buổi đột xuất / cancellation): "Gia sư hủy buổi học sát giờ 30 phút trước khi bắt đầu", status: `in_progress`.<br>- `IS-2038` (Tranh chấp học phí / fee_dispute): "Phụ huynh yêu cầu hoàn phí do gia sư đến muộn", status: `resolved` (Đã giải quyết), admin note: "Đã hoàn 50% phí và cảnh cáo gia sư".<br>- `RP-1172` (Phản ánh thái độ / attitude): "Gia sư sử dụng điện thoại liên tục trong giờ dạy", status: `new`. |

---

### R4. Cross-Role Reactive Synchronization & Login Enforcement

This requirement defines the dynamic contracts between Admin actions and Learner / Tutor experiences.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ADMIN OPERATIONAL ACTIONS                       │
└──────────────┬─────────────────────────┬───────────────────────────────┘
               │                         │
               ▼                         ▼
      Tutor Approval/Rejection    Review Moderation         Account Suspension
               │                         │                         │
               ▼                         ▼                         ▼
     `state.profiles[i]`        `state.reviews[j]`        `accounts[k].status`
     moderationStatus           moderationStatus /        = 'suspended'
                                visibility                         │
               │                         │                         ▼
               ▼                         ▼                 SHARED AUTH GUARD
        Learner Search             Tutor Profile             (`/login`)
      (`/learner/search`)        (`/tutors/:id`)                   │
               │                         │                         ▼
      Only 'approved'            Only 'approved' &         Rejects login with:
      tutors appear in           'public' reviews          "Tài khoản của bạn
      search results             render in list            đã bị tạm khóa bởi
                                                           Quản trị viên.
                                                           Vui lòng liên hệ
                                                           hỗ trợ."
```

#### Exact Synchronization Rules:

1. **Tutor Approval Propagation**:
   - **Trigger**: Admin clicks "Duyệt" (Approve) on a pending tutor.
   - **Domain State**: `profile.moderationStatus` changes from `'pending'` to `'approved'`.
   - **Learner Search (`/learner/search`)**: `useScheduledTutors` filters `state.profiles.filter(p => p.moderationStatus === 'approved')`. The tutor appears immediately with their subjects, area, fee, and availability.
   - **Tutor Profile (`/tutors/:id`)**: The public profile becomes accessible and enables submitting requests.
   - **Negative Case**: Tutors in `'pending'`, `'rejected'`, or `'suspended'` state are omitted from search results.

2. **Review Moderation Propagation**:
   - **Trigger**: Admin clicks "Ẩn" (Hide) or "Duyệt" (Approve) on a review in `/admin/reviews`.
   - **Domain State**: `review.moderationStatus` updates to `'hidden'` or `'approved'`; `review.visibility` updates to `'hidden'` or `'public'`.
   - **Public Profile (`/tutors/:id`)**: The reviews section in `TutorProfilePage.jsx` consumes canonical reviews matching `tutorId` where `moderationStatus === 'approved' && visibility === 'public'`.
   - **Immediate Reaction**: Hiding removes the review instantly from the page without requiring reload; approving restores it immediately.

3. **Account Suspension & Auth Boundary Enforcement**:
   - **Trigger**: Admin clicks "Tạm khóa" (Suspend) on a user or tutor account in `/admin/users` or `/admin/tutors`.
   - **Domain State**: User record status becomes `'suspended'`.
   - **Shared Auth Boundary (`DemoAuthContext.jsx`)**:
     - Both username/password login (`login(identity, password)`) and social/phone provider login (`loginProvider(...)`) must inspect `user.status`.
     - When `user.status === 'suspended'`, login is blocked and returns:
       ```
       "Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ."
       ```
     - Case Sensitivity & Punctuation: Exact string match required.
   - **Unsuspending**: Admin clicks "Mở khóa" / "Kích hoạt lại" -> status restored to `'active'` -> user can log in normally.

---

### R5. Admin Table & Detail Drawer UX

All 4 operational management pages (`/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`) follow this unified interaction architecture:

1. **Instant Text Search**:
   - Text input (`<SearchInput />`) with real-time filtering across relevant text fields (name, email, school, subjects, issue labels, etc.) using case-insensitive Vietnamese comparison: `toLocaleLowerCase('vi-VN')`.

2. **Status/Category Filter Tabs**:
   - Horizontal tab bar allowing one-click filtering.
   - Tab switching updates the filtered dataset and record counter without reloading the page.

3. **Standard Record Counter**:
   - Must render strictly in format:
     ```
     "Hiển thị X / Y bản ghi"
     ```
     Where `X` is the number of currently visible/filtered rows, and `Y` is the total count of items in the current scope.

4. **Internally Scrollable Table with Sticky Header**:
   - Table wrapper has internal scroll: `overflow-y: auto`, `max-height` (or calc based on viewport).
   - Sticky header: `thead th { position: sticky; top: 0; z-index: 2; background: #eef3fb; }`.
   - Table row click opens the detail drawer for that entity.

5. **Slide-Over Detail Drawer**:
   - Fixed slide-over overlay from the right (desktop width: 480px–540px; tablet: 60–75%; mobile: 100%).
   - Semi-transparent scrim (`.admin-drawer-scrim`).
   - State Preservation Invariant: Opening the drawer, interacting within it, or executing decision actions does **NOT** reset the background table's scroll position, active search input, or selected tab filter.
   - Accessibility & Dismissal:
     - Dismissible via `ESC` key, backdrop click, or header close button (`X`).
     - Uses focus trap and returns focus to the triggering row upon closing.

6. **Responsive Layout**:
   - Desktop (`1440px`): Full table with sticky headers, fixed width slide-over drawer, persistent sidebar.
   - Tablet (`1024px`): Collapsed off-canvas sidebar with hamburger button, horizontal table scroll inside scroll container, drawer occupies 65% width.
   - Mobile (`390px`): Collapsed sidebar, horizontal scroll table without document overflow, drawer occupies 100% full screen width.

---

### R6. Core Admin Operational Modules: Detailed Specifications

#### Module 1: `/admin/tutors` ("Quản lý gia sư" / "Hồ sơ gia sư")
- **Tabs**:
  1. `Tất cả` (All)
  2. `Chờ duyệt` (Pending)
  3. `Đã duyệt` (Approved)
  4. `Đã từ chối` (Rejected)
  5. `Tạm khóa` (Suspended)
- **Counter**: `"Hiển thị X / Y bản ghi"`
- **Table Columns**:
  - `Gia sư`: Avatar, Họ và tên, Trường đại học / Trình độ
  - `Môn dạy`: Danh sách môn học
  - `Học phí`: VNĐ / buổi (e.g. `220.000đ/buổi`)
  - `Ngày gửi`: Thời điểm nộp hồ sơ (e.g. `04/10/2026`)
  - `Trạng thái`: Badge (`Chờ duyệt` [warning], `Đã duyệt` [success], `Đã từ chối` [danger], `Tạm khóa` [neutral/danger])
  - `Thao tác`: Button "Xem hồ sơ" / "Chi tiết"
- **Drawer Contents**:
  - Header: Avatar, Họ tên, ID, Status Badge, Close button
  - Section 1: Thông tin liên hệ (Email, Số điện thoại, Khu vực)
  - Section 2: Học vấn & Năng lực (Trường đại học, Chuyên ngành, Kinh nghiệm, Giới thiệu [Bio], Phương pháp dạy)
  - Section 3: Môn học & Học phí (Môn dạy, Cấp độ dạy, Mức học phí/buổi, Thời lượng buổi học 45/90 phút)
  - Section 4: Hồ sơ xác minh (Verification Documents): Thẻ sinh viên / Giáo viên, CCCD, Chứng chỉ năng lực (hiển thị dạng card/preview xác thực)
  - Section 5: Lý do từ chối (hiển thị khi trạng thái là `Đã từ chối`)
- **Drawer Actions**:
  - Khi `Chờ duyệt`:
    - Button `Duyệt hồ sơ` (Approve): Updates status to `approved`.
    - Button `Từ chối` (Reject): Prompts for rejection reason; updates status to `rejected`.
  - Khi `Đã duyệt`:
    - Button `Tạm khóa tài khoản` (Suspend): Updates status to `suspended`.
  - Khi `Tạm khóa`:
    - Button `Mở khóa / Kích hoạt lại` (Unsuspend): Updates status to `approved`.
  - Khi `Đã từ chối`:
    - Button `Xem xét lại / Duyệt lại`: Updates status to `approved`.

---

#### Module 2: `/admin/users` ("Quản lý người dùng")
- **Tabs**:
  1. `Tất cả` (All)
  2. `Học viên/Phụ huynh` (Learners/Parents)
  3. `Gia sư` (Tutors)
  4. `Đang hoạt động` (Active)
  5. `Đang bị khóa` (Suspended)
- **Counter**: `"Hiển thị X / Y bản ghi"`
- **Table Columns**:
  - `Người dùng`: Avatar, Họ tên, Username
  - `Vai trò`: Badge (`Học viên` [info], `Phụ huynh` [info], `Gia sư` [warning])
  - `Liên hệ`: Email / Số điện thoại
  - `Hoạt động`: Tóm tắt hoạt động từ canonical domain (e.g. "3 yêu cầu học", "4 lớp đã dạy")
  - `Trạng thái`: Badge (`Đang hoạt động` [success], `Đang bị khóa` [danger])
  - `Thao tác`: Button "Chi tiết"
- **Drawer Contents**:
  - Header: Avatar, Họ tên, Username, Role Badge, Status Badge
  - Section 1: Chi tiết tài khoản (Email, Số điện thoại, Địa chỉ, Ngày tham gia, Trạng thái xác thực email/SĐT)
  - Section 2: Thống kê hoạt động (tính trực tiếp từ shared domain `requests`, `lessons`, `reviews`):
    - Học viên: Số yêu cầu đã gửi (phân bổ: pending, accepted, completed, cancelled), danh sách yêu cầu gần đây.
    - Gia sư: Số yêu cầu nhận được, số buổi học đã dạy, tổng thu nhập tạo ra.
  - Section 3: Lịch sử quản trị (Lý do tạm khóa nếu có)
- **Drawer Actions**:
  - Khi `Đang hoạt động`:
    - Button `Khóa tài khoản` (Suspend): Sets user account status to `suspended`.
  - Khi `Đang bị khóa`:
    - Button `Mở khóa tài khoản` (Unsuspend): Sets user account status to `active`.

---

#### Module 3: `/admin/reviews` ("Kiểm duyệt đánh giá")
- **Tabs**:
  1. `Cần duyệt / Xem xét` (Pending moderation)
  2. `Đã hiển thị` (Approved / Visible)
  3. `Đã ẩn` (Hidden / Rejected)
- **Counter**: `"Hiển thị X / Y bản ghi"`
- **Table Columns**:
  - `Người đánh giá`: Avatar, Tên học viên / phụ huynh
  - `Gia sư`: Tên gia sư nhận đánh giá
  - `Đánh giá`: Số sao (★ 5/5)
  - `Trích đoạn`: Excerpt văn bản nhận xét
  - `Ngày gửi`: Ngày tạo đánh giá
  - `Trạng thái`: Badge (`Cần duyệt` [warning], `Đã hiển thị` [success], `Đã ẩn` [neutral/danger])
  - `Thao tác`: Button "Kiểm duyệt" / "Chi tiết"
- **Drawer Contents**:
  - Header: Mã review ID, Số sao đánh giá, Status Badge
  - Section 1: Thông tin người đánh giá (Họ tên, Vai trò)
  - Section 2: Gia sư & Buổi học liên quan (`lessonSnapshot`: Môn học, Cấp độ, Thời gian buổi học, Học phí)
  - Section 3: Toàn văn nhận xét (Full text)
  - Section 4: Thời điểm gửi
- **Drawer Actions**:
  - Button `Duyệt hiển thị` (Approve): Updates `moderationStatus` to `approved`, immediately reveals review on `/tutors/:id`.
  - Button `Ẩn đánh giá` (Hide): Updates `moderationStatus` to `hidden`, immediately hides review from `/tutors/:id`.

---

#### Module 4: `/admin/issues` ("Báo cáo & sự cố")
- **Tabs**:
  1. `Mới tiếp nhận` (New / Open)
  2. `Đang xử lý` (In progress / Reviewing)
  3. `Đã giải quyết` (Resolved)
- **Counter**: `"Hiển thị X / Y bản ghi"`
- **Table Columns**:
  - `Mã sự cố`: ID (e.g. `IS-2048`, `RP-1172`)
  - `Phân loại`: Category (Vắng mặt, Tranh chấp giờ học, Hủy lớp, Tranh chấp học phí, Phản ánh thái độ)
  - `Bên liên quan`: Học viên & Gia sư
  - `Thời gian`: Thời điểm tiếp nhận
  - `Trạng thái`: Badge (`Mới tiếp nhận` [warning], `Đang xử lý` [info], `Đã giải quyết` [success])
  - `Thao tác`: Button "Xử lý" / "Chi tiết"
- **Drawer Contents**:
  - Header: Mã sự cố, Category, Status Badge
  - Section 1: Thời gian báo cáo & Mức độ ưu tiên
  - Section 2: Các bên liên quan (Học viên, Gia sư, Buổi học/Yêu cầu liên quan nếu có)
  - Section 3: Toàn văn nội dung khiếu nại / mô tả vấn đề
  - Section 4: Ghi chú xử lý của Quản trị viên (Admin Resolution Note) — trường văn bản / textarea
- **Drawer Actions**:
  - Button `Chuyển sang Đang xử lý` (khi đang ở `Mới tiếp nhận`)
  - Trường nhập `Ghi chú giải quyết` (Admin Note textarea)
  - Button `Đánh dấu đã giải quyết` (Mark Resolved): Sets status to `resolved` and saves resolution note.
  - Button `Mở lại sự cố` (Reopen): Khi đang ở `Đã giải quyết`.

---

### R7. Admin Dashboard Integration & Scope Protection

1. **Live Reactive Projections (No Static / Random Mock Data)**:
   - Metric Cards:
     - `Hồ sơ chờ duyệt`: Reactive count of tutors with `moderationStatus === 'pending'`.
     - `Lớp đang diễn ra`: Reactive count of lessons scheduled for today or live.
     - `Đánh giá cần xem`: Reactive count of reviews with `moderationStatus === 'pending'`.
     - `Báo cáo & sự cố`: Reactive count of issues with `status !== 'resolved'`.
   - Synchronized Sections on Dashboard:
     - `Gia sư chờ duyệt` (`ApprovalSection`): Displays pending tutors; quick Approve/Reject buttons directly mutate domain state and update metric counter.
     - `Đánh giá cần xem` (`ReviewSection`): Displays pending reviews; quick Approve/Hide buttons directly mutate domain state and update metric counter.
     - `Báo cáo & sự cố` (`IssueSection`): Displays open issues; quick status toggles.
   - Deep Links:
     - Each dashboard section provides clear navigation links to its dedicated operational page (`/admin/tutors`, `/admin/reviews`, `/admin/issues`).

2. **Scope Protection & System Invariants**:
   - Zero modifications to Learner search filtering logic or Tutor timetable algorithms.
   - Invariant preservation: `SCHED-003`, `SCHED-004`, `SCHED-005`, `INCOME-001`, `BUG-014` remain 100% intact.
   - Do not redesign Learner or Tutor app shells.

---

## 3. Acceptance Criteria & Quality Gates

### 3.1 Suite & Build Invariants
- **Existing Unit Tests**: All 55 existing tests in `node --test` MUST pass with zero assertion softening.
- **New Unit Tests**: Must introduce comprehensive unit tests for Admin domain operations:
  1. `adminDomain.test.js`:
     - Tutor approve / reject transitions & reason recording.
     - User suspend / unsuspend transitions.
     - Review approve / hide transitions and filter projection.
     - Issue status transitions and resolution note persistence.
     - Auth suspension guard: login rejected with exact string `"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ."`.
     - Unsuspending allows successful login.
- **Production Build**: `npm run build` must succeed with exit code 0 and zero bundling errors.

### 3.2 Responsive & Visual Quality Gates
- **1440px (Desktop)**: Full Admin workspace layout, sticky table headers, slide-over drawer properly overlaid without layout shifting.
- **1024px (Tablet)**: Off-canvas sidebar toggled by hamburger menu, internally scrollable table containers with no horizontal window overflow, drawer occupies 65% width.
- **390px (Mobile)**: Off-canvas sidebar, 2-column metric cards on dashboard, internally scrollable table without document `scrollWidth` overflow, full-width (100%) drawer with accessible controls.

---

## 4. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Shell | AdminHeader Identity & Logout | Header displays avatar `AD`, label `Quản trị viên`, red Lucide `LogOut` button; `RoleSwitcher` removed. | User clicks Logout | Session cleared, redirected to `/login` | If unauthenticated, redirect to `/login` | ORIGINAL_REQUEST.md R1, AGENTS.md |
| 2 | Navigation | AdminSidebar Routing & Reactive Badges | Sidebar manages `/admin/dashboard`, `/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues` with reactive badge counters. | Navigation clicks, domain state | Active route highlighted, badge counts rendered | Unavailable items flagged | ORIGINAL_REQUEST.md R1 |
| 3 | Domain | Single Canonical Domain Storage | All admin state stored under `tnm.demo.domain.v1` in `localStorage`. | Domain actions | Updated domain state in localStorage | Storage error handled gracefully | ORIGINAL_REQUEST.md R2, ARCHITECTURE.md |
| 4 | Domain | Admin Domain Hooks | `useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues` abstract domain layer. | Hook parameters (filters, searches) | Selected data & action callbacks | Throw if outside provider | ORIGINAL_REQUEST.md R2 |
| 5 | Fixture | Deterministic Admin Demo Seed | Rich deterministic seed for tutors, users, reviews, issues in `demoReferenceData.js`. | Fixture initialization | Normalized initial domain state | No random generation | ORIGINAL_REQUEST.md R3 |
| 6 | Cross-Role Sync | Tutor Approval Discovery Propagation | Admin approving tutor in `/admin/tutors` immediately reflects in Learner Search (`/learner/search`) and public profile. | Tutor ID, approve action | `moderationStatus: 'approved'`; discoverable in search | Pending/rejected tutors excluded from search | ORIGINAL_REQUEST.md R4 |
| 7 | Cross-Role Sync | Review Moderation Public Profile Propagation | Admin hiding review in `/admin/reviews` immediately removes it from public profile (`/tutors/:id`); approving makes it visible. | Review ID, hide/approve action | Review visibility updated in public profile | Hidden reviews omitted from profile | ORIGINAL_REQUEST.md R4 |
| 8 | Cross-Role Sync | Account Suspension Login Guard | Admin suspending user sets status to `suspended`; shared `/login` rejects with exact message. | Suspended credentials at `/login` | Error: "Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ." | Prevents login attempt | ORIGINAL_REQUEST.md R4 |
| 9 | Cross-Role Sync | Account Unsuspension Restoration | Admin unsuspending user sets status to `active`; user can log in normally. | Unsuspend action, subsequent login | Login succeeds, role destination restored | Invalid credentials error if wrong password | ORIGINAL_REQUEST.md R4 |
| 10 | UX | Operational Search & Filtering | Instant text search, status tabs, and standard record counter `"Hiển thị X / Y bản ghi"`. | Search string, tab click | Filtered list & updated counter | "Không có dữ liệu phù hợp bộ lọc" if empty | ORIGINAL_REQUEST.md R5 |
| 11 | UX | Sticky Header Internally Scrollable Table | Operational table with fixed header (`thead th`) during internal scrolling. | Table scroll | Headers remain visible at top of table container | No page scroll jump | ORIGINAL_REQUEST.md R5 |
| 12 | UX | Slide-Over Detail Drawer | Slide-over drawer for entity inspection and actions without losing table scroll or filter position. | Row click, action buttons | Drawer opened, decisions executed, table state preserved | ESC, scrim click, or close button dismisses | ORIGINAL_REQUEST.md R5 |
| 13 | Module | Tutor Management Page (`/admin/tutors`) | Tabs (`Tất cả`, `Chờ duyệt`, `Đã duyệt`, `Đã từ chối`, `Tạm khóa`), verification documents drawer, approve/reject/suspend. | Tab, search, drawer actions | Tutor table & detail drawer | Reject requires reason | ORIGINAL_REQUEST.md R6 |
| 14 | Module | User Management Page (`/admin/users`) | Tabs (`Tất cả`, `Học viên/Phụ huynh`, `Gia sư`, `Đang hoạt động`, `Đang bị khóa`), activity counts, suspend/unsuspend. | Tab, search, drawer actions | User table & detail drawer | Cannot suspend self | ORIGINAL_REQUEST.md R6 |
| 15 | Module | Review Moderation Page (`/admin/reviews`) | Tabs (`Cần duyệt / Xem xét`, `Đã hiển thị`, `Đã ẩn`), lesson snapshot drawer, approve/hide actions. | Tab, search, drawer actions | Review table & detail drawer | Empty state handled | ORIGINAL_REQUEST.md R6 |
| 16 | Module | Issue Management Page (`/admin/issues`) | Tabs (`Mới tiếp nhận`, `Đang xử lý`, `Đã giải quyết`), related entities drawer, resolution note, resolve action. | Tab, search, drawer actions | Issue table & detail drawer | Resolve saves admin note | ORIGINAL_REQUEST.md R6 |
| 17 | Dashboard | Live Projections Dashboard (`/admin/dashboard`) | Live reactive metrics and operational sections reflecting shared domain state with quick actions. | Domain state changes | Updated stat counts and quick decision lists | No hardcoded or static numbers | ORIGINAL_REQUEST.md R7 |

---

## 5. Edge Cases & Invariant Observations

| # | Feature | Input | Observed / Expected Behavior |
|---|---------|-------|------------------------------|
| 1 | Auth Suspension Guard | Login attempt with suspended account username & valid password | Fails login with exact error: `"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ."` |
| 2 | Auth Suspension Guard | Provider login (Google/Facebook/Phone) for suspended account | Fails provider login with exact error: `"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ."` |
| 3 | Tutor Moderation | Direct URL visit to unapproved tutor (`/tutors/thao-vy`) | Shows notice that tutor profile is pending approval or redirects to `/learner/search`; does not allow booking. |
| 4 | Search & Accents | Searching with Vietnamese diacritics (e.g. "thảo vy" or "thao vy") | Case-insensitive and accent-aware matching via `toLocaleLowerCase('vi-VN')`. |
| 5 | Empty Filter Result | Filtering by tab or search with no matches | Renders empty state row/message: `"Không có bản ghi phù hợp bộ lọc."` and counter `"Hiển thị 0 / Y bản ghi"`. |
| 6 | Drawer State Preservation | User scrolls table to row 15, clicks row, approves in drawer | Drawer updates, table row updates to `Đã duyệt`, table scroll position stays at row 15, active filter remains unchanged. |
| 7 | Keyboard Accessibility | Drawer open; user presses `Escape` key | Drawer closes cleanly; focus returns to the table row trigger element; table retains scroll position. |
| 8 | Rejection Reason | Rejecting a tutor without providing a reason | Form requires rejection reason before submitting rejection transition. |
| 9 | Issue Resolution Note | Resolving an issue ticket | Admin resolution note is persisted on the issue record and displayed in the drawer history. |
| 10 | Live Reactive Counters | Approving a pending tutor from `/admin/dashboard` or `/admin/tutors` | Sidebar badge for Gia sư decrements immediately across both pages. |
| 11 | Viewport 390px | Opening table and drawer on iPhone screen (390px) | Table scrolls horizontally within container; drawer covers 100% width; no horizontal body window scrollbar. |

---

## 6. Comprehensive Feature Inventory

| Item ID | Subsystem Component | Description | Authoritative Source | Verification Condition |
|---|---|---|---|---|
| **FEAT-ADM-001** | AdminHeader | Header with avatar `AD`, label `Quản trị viên`, red `LogOut` button, no `RoleSwitcher`. | ORIGINAL_REQUEST.md R1 | Header renders avatar `AD`, label `Quản trị viên`, red `LogOut` button; `RoleSwitcher` absent. Clicking logout navigates to `/login`. |
| **FEAT-ADM-002** | AdminSidebar | Persistent sidebar with 5 active routes, reactive badge counters, and mobile drawer reflow. | ORIGINAL_REQUEST.md R1 | Links to `/admin/dashboard`, `/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`. Badges reactively count pending tutors, pending reviews, open issues. |
| **FEAT-ADM-003** | Canonical Domain | Single storage key `tnm.demo.domain.v1` containing profiles, accounts, reviews, and issues. | ORIGINAL_REQUEST.md R2 | Verify `localStorage` has only `tnm.demo.domain.v1`; no secondary admin keys exist. |
| **FEAT-ADM-004** | Admin Adapters | Clean custom hooks `useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`. | ORIGINAL_REQUEST.md R2 | Hooks return derived states and actions; Admin UI components only consume these hooks. |
| **FEAT-ADM-005** | Demo Seed Data | Deterministic fixtures in `demoReferenceData.js` for pending/approved/rejected tutors, users, reviews, issues. | ORIGINAL_REQUEST.md R3 | Fixture loads deterministically; all required categories and states present without random generator. |
| **FEAT-ADM-006** | Tutor Sync | Admin tutor approval updates canonical state and immediately reflects in Learner Search (`/learner/search`). | ORIGINAL_REQUEST.md R4 | Approving tutor in Admin causes tutor to appear in Learner Search immediately. Rejecting/suspending hides them. |
| **FEAT-ADM-007** | Review Sync | Admin review hide/approve immediately updates visibility in public tutor profile (`/tutors/:id`). | ORIGINAL_REQUEST.md R4 | Hiding review in Admin removes it from `/tutors/:id` immediately; approving restores it. |
| **FEAT-ADM-008** | Suspension Guard | Admin account suspension blocks login with exact error message. | ORIGINAL_REQUEST.md R4 | Suspended account attempting `/login` receives `"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ."`. |
| **FEAT-ADM-009** | Table Toolbar | Search input, filter tabs, and standard record counter `"Hiển thị X / Y bản ghi"`. | ORIGINAL_REQUEST.md R5 | Toolbar renders search input, tabs, and counter `"Hiển thị X / Y bản ghi"` on all 4 operational pages. |
| **FEAT-ADM-010** | Table Layout | Internally scrollable table with sticky header (`position: sticky`). | ORIGINAL_REQUEST.md R5 | Table scrolls internally; header stays fixed at top of scroll viewport. |
| **FEAT-ADM-011** | Detail Drawer | Slide-over drawer for detail inspection and action execution without resetting table position. | ORIGINAL_REQUEST.md R5 | Drawer opens on row click, allows actions, closes on ESC/scrim click, preserves table scroll and filter state. |
| **FEAT-ADM-012** | Tutor Module | `/admin/tutors` page with 5 tabs, verification documents drawer, approve/reject/suspend actions. | ORIGINAL_REQUEST.md R6 | Renders tabs `Tất cả`, `Chờ duyệt`, `Đã duyệt`, `Đã từ chối`, `Tạm khóa`. Drawer shows documents and executes decisions. |
| **FEAT-ADM-013** | User Module | `/admin/users` page with 5 tabs, activity stats drawer, suspend/unsuspend actions. | ORIGINAL_REQUEST.md R6 | Renders tabs `Tất cả`, `Học viên/Phụ huynh`, `Gia sư`, `Đang hoạt động`, `Đang bị khóa`. Drawer shows canonical activity stats and suspend button. |
| **FEAT-ADM-014** | Review Module | `/admin/reviews` page with 3 tabs, lesson info drawer, approve/hide actions. | ORIGINAL_REQUEST.md R6 | Renders tabs `Cần duyệt / Xem xét`, `Đã hiển thị`, `Đã ẩn`. Drawer shows lesson info and approve/hide actions. |
| **FEAT-ADM-015** | Issue Module | `/admin/issues` page with 3 tabs, related entities drawer, resolution note, resolve action. | ORIGINAL_REQUEST.md R6 | Renders tabs `Mới tiếp nhận`, `Đang xử lý`, `Đã giải quyết`. Drawer shows issue details, resolution note textarea, and resolve action. |
| **FEAT-ADM-016** | Dashboard Sync | `/admin/dashboard` metrics and operational sections reflect live canonical domain state. | ORIGINAL_REQUEST.md R7 | Stat cards show live counts; quick decision actions update domain and reflect across all views. |
| **FEAT-ADM-017** | Unit Test Suite | 55 existing tests pass + new unit tests for all Admin domain transitions and auth guard pass. | Acceptance Criteria | `npm run test` executes successfully; 100% pass rate. |
| **FEAT-ADM-018** | Production Build | Clean Vite build with exit code 0. | Acceptance Criteria | `npm run build` exits 0 with no errors. |
| **FEAT-ADM-019** | Responsive Layout | Validated at 1440px, 1024px, 390px viewports without horizontal page overflow. | Acceptance Criteria | Tested on Desktop, Tablet, and Mobile viewports with zero horizontal document overflow. |

---

## 7. Technical Implementation Guidance for Development Team

1. **State Extension**:
   - In `demoReferenceData.js`: Expand `accounts`, `tutorProfiles`, `reviews`, and introduce `issues` and `verificationDocuments` seed collections.
   - In `demoDomain.js`: Update `createDemoState` and `restoreDemoState` to include `state.reviews` and `state.issues`. Add domain action functions:
     - `decideTutorApproval(state, tutorId, decision, rejectionReason)`
     - `toggleUserSuspension(state, userId, status)`
     - `moderateReview(state, reviewId, decision)`
     - `updateIssue(state, issueId, patch)`
2. **Auth Integration**:
   - In `DemoAuthContext.jsx`:
     - Inspect `user.status === 'suspended'` in both `login` and `loginProvider`.
     - Return `{ error: 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.' }`.
     - Ensure `allAccounts()` reads updated account statuses from shared domain or auth state.
3. **Admin Shell & Header**:
   - Create `src/features/admin/AdminShell.jsx` and `src/features/admin/AdminHeader.jsx`.
   - Remove `<RoleSwitcher />` from Admin header.
   - Attach Lucide `LogOut` button that triggers `logout()` from `useDemoAuth()`.
4. **Operational Pages & Drawers**:
   - Create reusable table & drawer primitives: `AdminDataTable.jsx`, `AdminDrawer.jsx`, `AdminToolbar.jsx`.
   - Implement pages:
     - `src/features/admin/AdminTutors.jsx`
     - `src/features/admin/AdminUsers.jsx`
     - `src/features/admin/AdminReviews.jsx`
     - `src/features/admin/AdminIssues.jsx`
   - Wire routes in `App.jsx` under `Protected role="admin"`.
5. **Cross-Role Hook Consumers**:
   - Update `useScheduledTutors` in `TutorWorkspaceState.jsx` to filter `tutor.moderationStatus === 'approved'`.
   - Update `TutorProfilePage.jsx` to load reviews from `useDemoDomain().reviews` filtered by `tutorId` and `moderationStatus === 'approved'`.
