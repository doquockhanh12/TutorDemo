# Admin UI, Navigation, Shells, and Components Exploration Report

**Survey Agent**: `teamwork_preview_explorer_survey_2`  
**Date**: 2026-10-04  
**Project**: TutorNearMe (Frontend-only interactive prototype)  
**Target Subsystem**: Admin Flow (`/admin/dashboard`, `/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`)  

---

## 1. Executive Summary & Inventory Overview

The TutorNearMe Admin subsystem currently exists only as an isolated prototype screen for the dashboard at `/admin/dashboard`. It is built with static, disconnected mock data (`src/data/adminDashboard.js`) and completely bypasses the canonical shared domain (`tnm.demo.domain.v1`).

### Current Status Matrix

| Subsystem Component | Implementation Status | Current File Location | Architectural Notes & Deficiencies |
|---|---|---|---|
| **Admin Route (`/admin/dashboard`)** | Implemented | `apps/web/src/App.jsx:38` | Only admin route in `App.jsx`. Wrapped in `<Protected role="admin">`. |
| **Operational Routes (`/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`)** | **Missing** | None | Not registered in `App.jsx`. No stub components exist. |
| **`AdminShell`** | **Missing** | Embedded in `AdminDashboard.jsx` | Layout markup (`.admin-workspace`, `.workspace__main`) is embedded directly in `AdminDashboard.jsx`. Needs extraction. |
| **`AdminHeader`** | **Missing** | Embedded in `AdminDashboard.jsx:98` | Header contains `RoleSwitcher`, missing red logout button, not a shared component. |
| **`AdminSidebar`** | Incomplete / Private | `AdminDashboard.jsx:27-36` | Private component inside `AdminDashboard.jsx`. Only `/admin/dashboard` has `to` defined; other nav items are inactive; no reactive badge count logic. |
| **`RoleSwitcher`** | Deprecated for Admin | `src/components/RoleSwitcher.jsx` | Currently rendered in admin topbar; must be removed per R1 / Acceptance Criteria. |
| **`/admin/dashboard` Metrics** | Disconnected Mock | `src/data/adminDashboard.js` | 4 summary metrics and 4 sections rely on static mock arrays; state changes remain local in `useState`. |
| **Shared Primitives** | Partial | `src/components/` | `Avatar`, `Badge`, `Brand`, `Button`, `SearchInput`, `SidebarItem`, `StatItem` exist. `Modal`, `Drawer`, `Table`, `Tabs`, `Input` are **missing**. |
| **CSS / Styling** | Semantic CSS Variables | `src/styles/tokens.css`, `admin.css` | Pure CSS with custom properties; **NO Tailwind CSS**. Responsive breakpoints at 1280px, 1024px, 768px. |
| **Slide-over Drawer** | **Missing** | None | No drawer primitive exists. Modal pattern exists in `LessonDetailModal.jsx` using `useDialogFocus(onClose)` and `createPortal`. |

---

## 2. Current Admin Files & Architecture Analysis

### 2.1 Route Registration in `src/App.jsx`
- **Location**: `apps/web/src/App.jsx`
- **Current Lines 8, 20, 22, 38**:
  ```jsx
  8:  import AdminDashboard from './features/admin/AdminDashboard.jsx';
  ...
  20: import { ProtectedRoute } from './features/auth/AuthNavigation.jsx';
  22: function Protected({ role, children }) { return <ProtectedRoute role={role}>{children}</ProtectedRoute>; }
  ...
  38: <Route path="/admin/dashboard" element={<Protected role="admin"><AdminDashboard /></Protected>} />
  ```
- **Findings**:
  - There is no `src/routes/` directory. All application routes are declared inline in `src/App.jsx`.
  - Only `/admin/dashboard` exists for the `admin` role.
  - The operational management routes required by R5 and R6 (`/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`) have **zero** route definitions in `App.jsx`.

### 2.2 Shell, Header, and Sidebar Layout Architecture
In the Tutor subsystem, workspace layout is modularized cleanly:
- `TutorShell` (`src/features/tutor/TutorPages.jsx:63-108`) encapsulates the workspace wrapper, sidebar toggle state, mobile scrim, `TutorHeader`, and `<main>`.
- `TutorHeader` (`src/features/tutor/TutorHeader.jsx`) encapsulates topbar navigation, avatar, and logout logic.
- `TutorSidebar` (`src/features/tutor/TutorSidebar.jsx`) encapsulates navigation links, brand mark, and dynamic badge counts.

In contrast, the Admin subsystem in `AdminDashboard.jsx` is currently an all-in-one monolith:
- `AdminSidebar` is declared as a private function at `AdminDashboard.jsx:27-36`.
- The topbar is inlined directly at `AdminDashboard.jsx:98`:
  ```jsx
  <header className="workspace-topbar admin-topbar">
    <button className="icon-button workspace-topbar__menu" type="button" onClick={() => setSidebarOpen(true)} aria-label="Mở điều hướng"><Menu size={22} /></button>
    <span className="workspace-topbar__mobile-brand"><Brand compact /></span>
    <div className="workspace-topbar__location">Quản trị <ChevronRight size={15} /> <strong>Tổng quan</strong></div>
    <label className="sr-only" htmlFor="admin-search">Tìm hồ sơ gia sư</label>
    <SearchInput id="admin-search" className="workspace-topbar__search" value={search} onChange={setSearch} placeholder="Tìm hồ sơ gia sư..." />
    <RoleSwitcher />
    <span className="admin-topbar__user"><Avatar initials="AD" name="Quản trị viên" tone="slate" size="sm" /><span>Quản trị viên</span></span>
  </header>
  ```
- `RoleSwitcher` (`src/components/RoleSwitcher.jsx`) is present in the admin header. Per R1, it must be completely removed.
- Logout button is missing: The user cannot log out of the admin session from the header.

### 2.3 Required Component Refactoring
To fulfill Requirement R1:
1. **`AdminHeader.jsx`** (`src/features/admin/AdminHeader.jsx`):
   - Props: `onOpenSidebar`, `locationLabel` (or breadcrumb).
   - Display brand mark, location indicator (`Quản trị > ...`).
   - Retain admin avatar: `<Avatar initials="AD" name="Quản trị viên" tone="slate" size="sm" /><span>Quản trị viên</span>`.
   - **Remove `RoleSwitcher` completely**.
   - Add red logout button:
     ```jsx
     <button
       className="icon-button admin-topbar__logout"
       type="button"
       aria-label="Đăng xuất"
       title="Đăng xuất"
       onClick={() => { logout(); navigate('/login', { replace: true }); }}
     >
       <LogOut size={20} />
     </button>
     ```
2. **`AdminSidebar.jsx`** (`src/features/admin/AdminSidebar.jsx`):
   - Props: `open`, `onClose`, `pendingTutorsCount`, `pendingReviewsCount`, `openIssuesCount`.
   - Navigation array with full active routes:
     ```javascript
     const navigation = [
       { label: 'Tổng quan', icon: LayoutDashboard, to: '/admin/dashboard' },
       { label: 'Gia sư', icon: ShieldCheck, to: '/admin/tutors', badge: pendingTutorsCount },
       { label: 'Người dùng', icon: Users, to: '/admin/users' },
       { label: 'Đánh giá', icon: MessageSquareWarning, to: '/admin/reviews', badge: pendingReviewsCount },
       { label: 'Báo cáo & sự cố', icon: FileWarning, to: '/admin/issues', badge: openIssuesCount },
     ];
     ```
   - Renders items via `SidebarItem.jsx`, ensuring `NavLink` applies `is-active` class when navigating between operational screens.
3. **`AdminShell.jsx`** (`src/features/admin/AdminShell.jsx`):
   - A unified layout shell wrapping `AdminSidebar`, `workspace-scrim`, `AdminHeader`, and `<main className="admin-main">`.
   - Consumes live badge counts via canonical admin hooks (e.g. `useAdminOverview()`).

---

## 3. Analysis of Existing `/admin/dashboard` Implementation

### 3.1 Metrics and Calculations
- **File**: `apps/web/src/features/admin/AdminDashboard.jsx` (lines 82–106)
- **Data Source**: `apps/web/src/data/adminDashboard.js`
- **Current Summary Metrics**:
  ```jsx
  <div className="admin-summary" aria-label="Chỉ số hệ thống">
    <StatItem label="Hồ sơ chờ duyệt" value={String(pendingApprovals).padStart(2, '0')} note="Cần quyết định" icon={ShieldCheck} />
    <StatItem label="Lớp đang diễn ra" value={String(liveClasses.filter((item) => item.status === 'live').length).padStart(2, '0')} note="Theo dõi hôm nay" icon={Activity} />
    <StatItem label="Đánh giá cần xem" value={String(pendingReviews).padStart(2, '0')} note="Chờ kiểm duyệt" icon={MessageSquareWarning} />
    <StatItem label="Báo cáo & sự cố" value={String(issues.length).padStart(2, '0')} note="Trong hàng xử lý" icon={AlertCircle} />
  </div>
  ```
- **How they are calculated**:
  1. `Hồ sơ chờ duyệt`: `approvals.filter((item) => item.status === 'pending').length` from local state initialized with `initialApprovals` (3 items).
  2. `Lớp đang diễn ra`: `liveClasses.filter((item) => item.status === 'live').length` hardcoded against static array `liveClasses` (2 items).
  3. `Đánh giá cần xem`: `reviews.filter((item) => item.status === 'pending').length` from local state initialized with `initialReviews` (2 items).
  4. `Báo cáo & sự cố`: `issues.length` hardcoded against static array `issues` (3 items).

### 3.2 Dashboard Sections
1. **`ApprovalSection`** (lines 38–53):
   - Table of pending tutor applications (`name`, `subject`, `school`, `submitted`, `status`).
   - Actions: Approve (`Check`), Reject (`X`).
   - Statuses: `pending`, `approved`, `rejected`.
   - Flaw: Decisions only alter local state `setApprovals`; does NOT update `tutorProfiles` or canonical domain state.
2. **`LiveClassesSection`** (lines 55–62):
   - Displays `time`, `format`, `subject`, `tutor`, `learner`, `status`.
   - Flaw: Uses disconnected `liveClasses` fixture; does NOT project from canonical `lessons`.
3. **`ReviewSection`** (lines 64–71):
   - Displays learner review excerpt, rating, tutor name.
   - Actions: `Duyệt` (`approved`), `Ẩn` (`hidden`).
   - Flaw: Local state only; does NOT synchronize with canonical `reviews` or Learner tutor profile view.
4. **`IssueSection`** (lines 73–80):
   - Displays issue ID, label, related party, received time, status badge (`reviewing`, `pending`).
   - Flaw: Completely static; no action triggers or resolution flows.

### 3.3 Required Refactoring for R7
Replace the static state with reactive projections from canonical shared domain:
- Metric 1: Count of tutors with `status === 'pending'` from canonical `profiles`.
- Metric 2: Live/confirmed lessons today from canonical `lessons`.
- Metric 3: Count of reviews with `moderationStatus === 'pending'` from canonical `reviews`.
- Metric 4: Count of issues with `status !== 'resolved'` from canonical `issues`.
- Sections must consume `useAdminOverview()` hook, ensuring decisions update domain state persistently.

---

## 4. Management Pages & Operational Subsystem Investigation

### 4.1 Current Status
- Routes `/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues` do **NOT exist**.
- There are no components or stubs for them in `src/features/admin/`.

### 4.2 Module Requirements Breakdown (R5 & R6)

#### Module 1: `/admin/tutors` (Quản lý gia sư)
- **Tabs**:
  1. `all`: "Tất cả"
  2. `pending`: "Chờ duyệt"
  3. `approved`: "Đã duyệt"
  4. `rejected`: "Đã từ chối"
  5. `suspended`: "Tạm khóa"
- **Table Columns**:
  - Gia sư (Avatar, Họ tên, Trường/Đơn vị, Email/SĐT)
  - Môn dạy chính
  - Mức học phí (VNĐ / buổi)
  - Ngày nộp / cập nhật
  - Trạng thái (`Badge`: Chờ duyệt / Đã duyệt / Từ chối / Tạm khóa)
  - Thao tác (Button: "Xem xét" / "Chi tiết")
- **Detail Drawer**:
  - Profile snapshot: Avatar, họ tên, học vấn, kinh nghiệm, giới thiệu, môn học, khu vực dạy, học phí.
  - Verification documents: Thẻ sinh viên / bằng tốt nghiệp / chứng chỉ sư phạm minh họa (illustrative document cards).
  - Decision Actions:
    - If `pending`: "Duyệt hồ sơ" (Approve) & "Từ chối" (Reject with reason prompt/input).
    - If `approved`: "Tạm khóa tài khoản" (Suspend).
    - If `suspended`: "Mở khóa tài khoản" (Unsuspend).

#### Module 2: `/admin/users` (Quản lý người dùng)
- **Tabs**:
  1. `all`: "Tất cả"
  2. `learner`: "Học viên / Phụ huynh"
  3. `tutor`: "Gia sư"
  4. `active`: "Đang hoạt động"
  5. `suspended`: "Đang bị khóa"
- **Table Columns**:
  - Người dùng (Avatar, Họ tên, Username)
  - Liên hệ (Email, Số điện thoại)
  - Vai trò (`Badge`: Người học / Gia sư)
  - Hoạt động (Số yêu cầu học / Số buổi dạy từ canonical domain)
  - Trạng thái (`Badge`: Hoạt động / Bị khóa)
  - Thao tác (Button: "Xem chi tiết")
- **Detail Drawer**:
  - User identity, registration date, email/phone verification status.
  - Canonical activity summary: linked tutor profile or learner request count, confirmed lesson count.
  - Account action: "Khóa tài khoản" (Suspend) / "Mở khóa tài khoản" (Unsuspend) with confirmation note.

#### Module 3: `/admin/reviews` (Kiểm duyệt đánh giá)
- **Tabs**:
  1. `pending`: "Cần duyệt / Xem xét"
  2. `approved`: "Đã hiển thị"
  3. `hidden`: "Đã ẩn"
  4. `all`: "Tất cả"
- **Table Columns**:
  - Người gửi (Tên, vai trò: Học viên / Phụ huynh)
  - Gia sư được đánh giá (Tên gia sư)
  - Đánh giá (Số sao: 1-5 sao `Star`)
  - Nội dung trích dẫn (Excerpt)
  - Ngày gửi
  - Trạng thái (`Badge`: Cần duyệt / Đã hiển thị / Đã ẩn)
  - Thao tác (Button: "Kiểm duyệt")
- **Detail Drawer**:
  - Full review text & rating score.
  - Linked Lesson Snapshot: Môn học, ngày học, học phí, hình thức (Online/Tại nhà), khu vực.
  - Moderation Actions:
    - "Duyệt hiển thị" (Approve / Make Public)
    - "Ẩn đánh giá" (Hide from public profiles)

#### Module 4: `/admin/issues` (Xử lý khiếu nại & báo cáo sự cố)
- **Tabs**:
  1. `new`: "Mới tiếp nhận"
  2. `reviewing`: "Đang xử lý"
  3. `resolved`: "Đã giải quyết"
  4. `all`: "Tất cả"
- **Table Columns**:
  - Mã sự cố (ID: e.g. `IS-2048`)
  - Loại vấn đề (Vắng mặt / Sai giờ / Hủy buổi / Tranh chấp học phí / Thái độ)
  - Bên liên quan (Học viên & Gia sư)
  - Thời gian tiếp nhận
  - Trạng thái (`Badge`: Mới tiếp nhận / Đang xử lý / Đã giải quyết)
  - Thao tác (Button: "Xử lý")
- **Detail Drawer**:
  - Detailed description of report/dispute.
  - Linked entities (Learner profile, Tutor profile, Lesson ID if applicable).
  - Admin resolution notes input field (`textarea`).
  - Action buttons: "Chuyển sang Đang xử lý", "Xác nhận Đã giải quyết".

---

## 5. Shared UI Primitives Inventory (`src/components/`)

### 5.1 Existing Primitives Audit

| Component | Path | Key Props | Rendered HTML / Variants | Quality & Reuse Assessment |
|---|---|---|---|---|
| **`Avatar`** | `src/components/Avatar.jsx` | `initials`, `name`, `tone` (`blue`, `coral`, `yellow`, `cyan`, `violet`, `slate`), `size` (`xs`, `sm`, `md`, `lg`, `xl`) | `<span className="avatar avatar--{tone} avatar--{size}">` | **High**. Fully reusable across all admin tables and drawers. |
| **`Badge`** | `src/components/Badge.jsx` | `tone` (`neutral`, `brand`, `success`, `warning`, `danger`, `info`), `children`, `dot` (boolean) | `<span className="badge badge--{tone}">` | **High**. Standardized status pills with optional dot indicator. |
| **`Brand`** | `src/components/Brand.jsx` | `compact` (boolean) | `<a className="brand brand--compact">` | **High**. Standard logo mark. |
| **`Button`** | `src/components/Button.jsx` | `variant` (`primary`, `secondary`, `quiet`), `size` (`md`, `sm`, `xs`), `type`, `className`, `...props` | `<button className="button button--{variant} button--{size}">` | **High**. Clean, supports standard button attributes. |
| **`RoleSwitcher`** | `src/components/RoleSwitcher.jsx` | None | `<nav className="role-switcher">` | **Deprecated for Admin**. Must be removed from AdminHeader. |
| **`SearchInput`** | `src/components/SearchInput.jsx` | `id`, `value`, `onChange`, `placeholder`, `className` | `<div className="search-input"><Search /><input type="search" /></div>` | **High**. Standardized search input with Lucide `Search` icon. |
| **`SidebarItem`** | `src/components/SidebarItem.jsx` | `icon`, `label`, `to`, `active`, `badge`, `onClose` | `<NavLink className="sidebar-item">` or `<span className="sidebar-item--unavailable">` | **High**. Supports active styling and counter pill (`.sidebar-item__count`). |
| **`StatItem`** | `src/components/StatItem.jsx` | `label`, `value`, `note`, `icon` | `<div className="stat-item"><div className="stat-item__top">...</div><strong>...</strong></div>` | **High**. Standard card for summary dashboard metrics. |

### 5.2 Missing UI Primitives & Implementation Strategy

1. **Slide-Over Drawer Primitive (`AdminDrawer` / `Drawer`)**:
   - *Status*: Does not exist.
   - *Strategy*: Build `AdminDrawer.jsx` in `src/components/` or `src/features/admin/` with focus trap, backdrop click, Escape key dismiss, sticky header, scrollable body, and action footer.
2. **Table Container Primitive (`AdminTable`)**:
   - *Status*: Does not exist as a component; currently written as raw HTML `<table>` with `.admin-table` in `admin.css`.
   - *Strategy*: Build a reusable pattern or wrapper `<div className="admin-table-container">` with sticky `<thead>` (`position: sticky; top: 0; z-index: 2; background: #eef3fb;`).
3. **Filter Tabs (`AdminTabs` / `flow-tabs`)**:
   - *Status*: In `TutorPages.jsx`, tabs are written as `<div className="flow-tabs"><button ... /></div>`. In `AdminDashboard.jsx`, status filter is a `<select>`.
   - *Strategy*: Standardize tab bar for operational pages:
     ```jsx
     <div className="admin-tabs" role="tablist">
       {tabs.map((tab) => (
         <button
           key={tab.key}
           role="tab"
           aria-selected={activeTab === tab.key}
           className={`admin-tab ${activeTab === tab.key ? 'is-active' : ''}`}
           onClick={() => onTabChange(tab.key)}
         >
           {tab.label} {tab.count !== undefined && <span className="admin-tab__count">({tab.count})</span>}
         </button>
       ))}
     </div>
     ```
4. **Record Counter**:
   - *Status*: Missing on operational pages.
   - *Strategy*: Standard component or element:
     ```jsx
     <span className="admin-table-counter">Hiển thị {filteredCount} / {totalCount} bản ghi</span>
     ```
5. **Modal / Confirmation Dialog**:
   - *Status*: Exists in `LessonDetailModal.jsx` and `PhoneAuthModal.jsx`.
   - *Strategy*: For rejection reason or destructive suspension prompts, reuse modal pattern with `useDialogFocus` hook.

---

## 6. Visual Design System, Tokens, Icons, and Responsive Architecture

### 6.1 Pure CSS & Tokens Configuration
- **No Tailwind CSS**: The project does not use Tailwind or any utility-first CSS preprocessors.
- **Token Source**: `apps/web/src/styles/tokens.css`
  - **Colors**:
    - `--brand-primary`: `#1346a0` (Admin accent & link color)
    - `--brand-primary-deep`: `#0a2e73`
    - `--surface-white`: `#ffffff` (Card & table surface)
    - `--surface-page`: `#f7f9ff` (Canvas background)
    - `--surface-light-blue`: `#eaf6ff` (Row highlight & subtle badges)
    - `--border-default-color`: `#dce3f0`
    - `--text-primary`: `#18213b`
    - `--text-muted`: `#52617c`
  - **Semantic Status Tokens**:
    - Success: `--status-success`: `#287957`, `--status-success-bg`: `#e7f6ec`
    - Warning: `--status-warning`: `#8a5d08`, `--status-warning-bg`: `#fff1c7`
    - Danger: `--status-danger`: `#b63747`, `--status-danger-bg`: `#ffe9eb`
    - Info: `--status-info`: `#185e9f`, `--status-info-bg`: `#e7f3ff`
  - **Typography**:
    - Heading: Nunito (`--font-display: 'Nunito', 'Nunito Sans', sans-serif`)
    - UI / Body: Nunito Sans (`--font-ui: 'Nunito Sans', 'Nunito', 'Segoe UI', sans-serif`)
    - Body default: `1rem` (16px) or `.875rem` (14px for compact tables).
  - **Density & Controls**:
    - Density class for Admin: `.density-compact`
    - Control height: `38px` desktop, `44px` mobile.
    - Admin Sidebar width: `--sidebar-admin: 216px`.

### 6.2 Lucide Icons Audit
- **Package**: `lucide-react` version `^1.48.0`
- **Already Used in Admin**:
  `Activity`, `AlertCircle`, `BookOpen`, `Check`, `ChevronRight`, `FileWarning`, `LayoutDashboard`, `Menu`, `MessageSquareWarning`, `Settings2`, `ShieldCheck`, `SlidersHorizontal`, `Users`, `X`.
- **Additional Icons for Operational Modules & Drawers**:
  - `LogOut`: Red logout button in `AdminHeader`
  - `Search`: Table instant search
  - `Eye`, `EyeOff`: Review visibility moderation
  - `UserX`, `UserCheck`: Account suspension & restoration
  - `CheckCircle`, `XCircle`, `AlertTriangle`: Status indications
  - `FileText`, `ExternalLink`, `FileCheck`: Verification documents & diplomas
  - `Clock`, `Calendar`, `MapPin`, `Mail`, `Phone`, `GraduationCap`: Drawer meta fields

### 6.3 Responsive Breakpoints & Layout Adaptations
- **Desktop (>= 1280px)**:
  - Sidebar sticky at left (`216px`).
  - Table fits full column definitions without truncation.
  - Drawers slide over from right (`min(600px, 45vw)`).
- **Tablet (768px – 1279px)**:
  - At `<= 1023px`, `.admin-sidebar` transforms to off-canvas slide-in drawer (`transform: translateX(-100%)`).
  - Scrim backdrop (`.workspace-scrim`) covers page on sidebar open.
  - Tables maintain scroll container (`overflow-x: auto;`).
  - Detail drawer width expands to `min(540px, 90vw)`.
- **Mobile (< 768px)**:
  - Topbar menu button (`.workspace-topbar__menu`) opens sidebar.
  - Summary metrics switch to 2x2 grid (`grid-template-columns: repeat(2, minmax(0, 1fr))`).
  - Min touch target height increases to `44px`.
  - Tables scroll horizontally inside `.admin-table-container` with preserved header visibility.
  - Detail drawer expands to `100vw` (full screen overlay).

---

## 7. Slide-Over Drawer Architecture & Zero-Loss State Preservation

### 7.1 The Problem
When reviewing records in a management table (e.g. 50 tutors filtered by "Chờ duyệt" with search query "Hóa"), clicking a row to inspect evidence must open a drawer. Executing an action (e.g. "Duyệt hồ sơ") or closing the drawer must **never**:
1. Reset the active filter tab back to "Tất cả".
2. Clear the search input text.
3. Reset the table container's scroll position back to top.
4. Cause page flash or layout shift.

### 7.2 Core Architectural Principles for Zero-Loss Drawers

```
+-------------------------------------------------------------------------+
| AdminOperationalPage (e.g. AdminTutors)                                 |
|                                                                         |
|  State:                                                                 |
|   - activeTab: 'pending'                                                |
|   - searchQuery: 'Toán'                                                 |
|   - selectedEntityId: 'tutor-123'  <--- (Selection Pointer Only)       |
|                                                                         |
|  +-----------------------------------+   +----------------------------+ |
|  | Table View (Persistent DOM)       |   | Slide-Over Drawer          | |
|  |                                   |   | (Rendered alongside table) | |
|  | [Tab Bar]  [Search] [Record Count]|   |                            | |
|  | +-------------------------------+ |   | +------------------------+ | |
|  | | .admin-table-container        | |   | | Header & Close (X)     | | |
|  | | (Internal overflow-y: auto)   | |   | +------------------------+ | |
|  | | [Sticky Table Header]         | |   | | Document Evidence      | | |
|  | | Row 1 ...                     | |   | | Full Bio & Details     | | |
|  | | Row 2 [Selected] <----------+ | |   | +------------------------+ | |
|  | | Row 3 ...                     | |   | | Action Buttons:        | | |
|  | +-------------------------------+ |   | | [Duyệt] [Từ chối]      | | |
|  +-----------------------------------+   | +------------------------+ | |
|                                          +----------------------------+ |
+-------------------------------------------------------------------------+
```

1. **State Isolation**:
   - Operational page manages search query, active tab, and `selectedId` via React `useState`.
   - The table renders the filtered list based on `activeTab` and `searchQuery`.
   - The drawer renders conditionally based on `Boolean(selectedEntityId)`.
   - The table component is **never unmounted** when the drawer opens or closes.
2. **Internal Scroll Container**:
   - The table is enclosed in `.admin-table-container` with `overflow: auto`, `max-height: calc(100vh - 280px)`, and `position: relative`.
   - Headers have `position: sticky; top: 0; z-index: 2;`.
   - Opening the drawer does NOT toggle `document.body.style.overflow = 'hidden'` on desktop, preventing any page scroll resets. Only mobile viewports lock background scrolling.
3. **Reactive In-Place Mutation**:
   - When an action is dispatched inside the drawer (e.g. `approveTutor(selectedId)`):
     - The domain hook updates the canonical shared domain state in `DemoDomainContext`.
     - Reactively, the domain state emits the updated entity list.
     - The page re-renders: the table row updates its badge immediately from "Chờ duyệt" to "Đã duyệt".
     - Because the DOM container was never unmounted, the `.scrollTop` of the table container remains unchanged.
     - The drawer updates its display in-place or dismisses smoothly based on user action.

### 7.3 Reference Implementation Pattern

```jsx
// src/components/AdminDrawer.jsx
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import useDialogFocus from '../hooks/useDialogFocus.js';

export default function AdminDrawer({
  open,
  onClose,
  title,
  kicker,
  children,
  footer,
  width = 'min(580px, 92vw)',
}) {
  const dialogRef = useDialogFocus(onClose, open);

  if (!open) return null;

  return (
    <div className="admin-drawer-scrim" onClick={onClose} role="presentation">
      <aside
        ref={dialogRef}
        className="admin-drawer"
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="admin-drawer__head">
          <div>
            {kicker && <span className="eyebrow">{kicker}</span>}
            <h2>{title}</h2>
          </div>
          <button
            type="button"
            className="icon-button admin-drawer__close"
            onClick={onClose}
            aria-label="Đóng bảng chi tiết"
          >
            <X size={20} />
          </button>
        </header>

        <div className="admin-drawer__body">
          {children}
        </div>

        {footer && (
          <footer className="admin-drawer__footer">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}
```

```css
/* Drawer CSS Pattern in admin.css */
.admin-drawer-scrim {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(18, 33, 59, 0.45);
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 150ms ease;
}

.admin-drawer {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-surface);
  border-left: var(--border-default);
  box-shadow: -8px 0 24px rgba(18, 33, 59, 0.15);
  animation: slideInRight 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.admin-drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: var(--border-default);
}

.admin-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin-drawer__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: var(--border-default);
  background: var(--surface-page);
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## 8. Actionable Guidance for Downstream Agents

### For Domain / Architect Agent:
1. **Extend `demoReferenceData.js`**:
   - Add status to `tutorProfiles`: `'approved' | 'pending' | 'rejected' | 'suspended'`, plus verification documents (CCCD, diploma images/links).
   - Add status to `accounts`: `'active' | 'suspended'`.
   - Expand `reviews`: ensure approved, pending moderation, and hidden reviews exist with linkable entity IDs.
   - Add canonical `issues` collection: categorized by absence, time dispute, cancellation, fee dispute, attitude complaint across new/open, reviewing, resolved.
2. **Build Admin Domain Hooks in `DemoDomainContext.jsx`**:
   - `useAdminOverview()`: reactive counts for pending approvals, reviews, open issues, and live classes.
   - `useAdminTutors()`, `useAdminUsers()`, `useAdminReviews()`, `useAdminIssues()`.
   - In `DemoAuthContext.jsx`: check account status upon login and reject with exact required error message if suspended.

### For Implementer Agent:
1. Create `AdminShell.jsx`, `AdminHeader.jsx`, `AdminSidebar.jsx` in `src/features/admin/`.
2. Remove `RoleSwitcher` and integrate Lucide `LogOut` into `AdminHeader`.
3. Build the 4 operational pages (`AdminTutors.jsx`, `AdminUsers.jsx`, `AdminReviews.jsx`, `AdminIssues.jsx`) and connect to routes in `src/App.jsx`.
4. Refactor `AdminDashboard.jsx` to consume `useAdminOverview()`.
5. Implement `AdminDrawer.jsx` and sticky table layout in `src/features/admin/admin.css`.

### For QA / Verification Agent:
1. Verify 55 existing tests continue to pass.
2. Add unit tests for Admin domain mutations and suspension auth guards.
3. Verify no horizontal viewport clipping or overflow regressions on 1440px, 1024px, 390px.
