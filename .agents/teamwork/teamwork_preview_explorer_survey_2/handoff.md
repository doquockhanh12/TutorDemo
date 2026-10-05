# Handoff Report — Admin UI, Navigation, Shells, and Components Exploration

**Agent**: `teamwork_preview_explorer_survey_2`  
**Working Directory**: `d:/tutor demo/TutorDemo/.agents/teamwork/teamwork_preview_explorer_survey_2`  
**Date**: 2026-10-04  
**Handoff Type**: Hard (Task Complete)  

---

## 1. Observation

1. **Current Admin Route & Files**:
   - `apps/web/src/App.jsx:38`: `<Route path="/admin/dashboard" element={<Protected role="admin"><AdminDashboard /></Protected>} />`. Only `/admin/dashboard` is registered. Routes for `/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues` do not exist in `App.jsx`.
   - `apps/web/src/features/admin/`: Contains only two files: `AdminDashboard.jsx` (11,205 bytes) and `admin.css` (9,435 bytes). No separate `AdminShell.jsx`, `AdminHeader.jsx`, or `AdminSidebar.jsx` files exist.
   - `apps/web/src/features/admin/AdminDashboard.jsx:27-36`: Defines a private `AdminSidebar` function inside the file.
   - `apps/web/src/features/admin/AdminDashboard.jsx:98`: Topbar is hardcoded inline with `<RoleSwitcher />`, Avatar `AD`, and no logout button.
   - `apps/web/src/features/admin/AdminDashboard.jsx:13-22`:
     ```javascript
     const navigation = [
       { label: 'Tổng quan', icon: LayoutDashboard, to: '/admin/dashboard' },
       { label: 'Người dùng', icon: Users },
       { label: 'Gia sư', icon: ShieldCheck },
       { label: 'Lớp đang diễn ra', icon: Activity },
       { label: 'Môn học', icon: BookOpen },
       { label: 'Đánh giá', icon: MessageSquareWarning },
       { label: 'Báo cáo & sự cố', icon: FileWarning },
       { label: 'Cài đặt', icon: Settings2 },
     ];
     ```
     Only `/admin/dashboard` has `to` defined. Other items have no routes or reactive badge counters.

2. **Current Metrics & Dashboard State**:
   - `apps/web/src/features/admin/AdminDashboard.jsx:11`: Imports `initialApprovals`, `initialReviews`, `issues`, `liveClasses` from `../../data/adminDashboard.js`.
   - `apps/web/src/data/adminDashboard.js`: Contains static, disconnected arrays (`initialApprovals` with 3 items, `liveClasses` with 3 items, `initialReviews` with 2 items, `issues` with 3 items).
   - `apps/web/src/features/admin/AdminDashboard.jsx:86-91`: State is local via `useState(initialApprovals)` and `useState(initialReviews)`. Mutations via `decideApproval` and `decideReview` do not touch `DemoDomainContext` or persist to `tnm.demo.domain.v1`.

3. **Management Pages & Operational Stubs**:
   - Searches for `/admin/tutors`, `/admin/users`, `/admin/reviews`, and `/admin/issues` return zero files across `apps/web/src`.
   - `docs/screens/SCREEN_INVENTORY.md:53-69`: Lists A03 (User List), A04 (User Detail), A05 (Tutor List), A06 (Tutor Detail), A08 (Review Management), A09/A10 (Issues) as "Planned".

4. **Shared UI Primitives & Missing Elements**:
   - `apps/web/src/components/`: Contains `Avatar.jsx`, `Badge.jsx`, `Brand.jsx`, `Button.jsx`, `RoleSwitcher.jsx`, `SearchInput.jsx`, `SidebarItem.jsx`, `StatItem.jsx`, `components.css`.
   - Missing primitives: No `Drawer`, `Table`, `Tabs`, `Input`, or `Modal` components exist in `src/components/`.
   - Modals are currently hand-rolled in `LessonDetailModal.jsx` and `PhoneAuthModal.jsx` using `useDialogFocus` hook (`src/hooks/useDialogFocus.js`) and `createPortal(..., document.body)`.

5. **Visual Styling, Tokens, and Icons**:
   - `apps/web/package.json`: No Tailwind CSS is installed. Dependencies are `@fontsource/nunito`, `@fontsource/nunito-sans`, `lucide-react` (v1.48.0), `react` (v19.3.0), `react-dom` (v19.3.0), `react-router-dom` (v7.18.4).
   - `apps/web/src/styles/tokens.css`: Pure CSS variables define `--brand-primary: #1346a0`, semantic status tokens (`--status-success`, `--status-warning`, `--status-danger`, `--status-info`), `--font-display: 'Nunito'`, `--font-ui: 'Nunito Sans'`, `--sidebar-admin: 216px`, and density class `.density-compact`.
   - Responsive rules in `admin.css`: Breakpoints at 1279px (grid collapse), 1023px (off-canvas fixed sidebar with `.workspace-scrim`), and 767px (2-column stat cards, 44px mobile touch targets).

6. **Cross-Role Domain Status**:
   - `apps/web/src/data/demoReferenceData.js`: Accounts and tutor profiles currently lack explicit `status` fields (`'approved' | 'pending' | 'rejected' | 'suspended'` for tutors; `'active' | 'suspended'` for accounts). `reviews` contains only 3 static approved reviews. `issues` collection does not exist in canonical fixture.
   - `apps/web/src/features/auth/DemoAuthContext.jsx:49-51`: Does not check account suspension during login.

---

## 2. Logic Chain

1. **Step 1 (Shell & Routing Gap)**: From Observation 1, `AdminDashboard.jsx` embeds its own topbar and sidebar while `App.jsx` only defines `/admin/dashboard`. Therefore, to support the 4 new operational pages (`/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues`), layout architecture must mirror `TutorShell` by extracting `AdminShell.jsx`, `AdminHeader.jsx`, and `AdminSidebar.jsx` into `src/features/admin/`, and registering the 4 routes in `App.jsx`.
2. **Step 2 (Header Compliance)**: From Observation 1, `RoleSwitcher` is embedded in the topbar and no logout button exists. To meet Requirement R1 and Acceptance Criteria, `RoleSwitcher` must be stripped out, and a red `LogOut` button calling `useDemoAuth().logout()` and navigating to `/login` must be placed beside the avatar `AD`.
3. **Step 3 (Domain Integration Gap)**: From Observation 2 and Observation 6, the dashboard metrics and table actions in `AdminDashboard.jsx` operate on an isolated fixture (`data/adminDashboard.js`). Per R2 and R7, these must be replaced by live projections from `DemoDomainContext` using clean hooks (`useAdminOverview()`, `useAdminTutors()`, etc.).
4. **Step 4 (Slide-over Drawer & State Preservation)**: From Observation 4, drawers do not yet exist. To satisfy R5 (slide-over drawer without losing table scroll or filter position), the page component must retain `activeTab` and `searchQuery` state, maintain the table in an internally scrollable container (`max-height: calc(100vh - 280px); overflow-y: auto;`) with sticky headers, and render `AdminDrawer` conditionally based on a `selectedEntityId` pointer. Action executions within the drawer update canonical domain state, triggering reactive in-place re-renders of the table without resetting scroll position or filters.

---

## 3. Caveats

- **No Caveats on Codebase Exploration**: All source files, test suites, design references, and documentation were directly inspected.
- **Backend/API Out of Scope**: Per `AGENTS.md`, TutorNearMe is strictly a frontend interactive prototype. All data structures are in-memory and local-storage backed via `tnm.demo.domain.v1`.
- **E2E Browser Runner**: Playwright browser dependencies were not executed in this survey turn to avoid unnecessary overhead; unit test suite structure was inspected in `apps/web/tests/`.

---

## 4. Conclusion

The Admin subsystem requires:
1. **Extraction of Shell Primitives**: `AdminShell.jsx`, `AdminHeader.jsx` (with red `LogOut`, avatar `AD`, no `RoleSwitcher`), and `AdminSidebar.jsx` (with active routes and badge counters).
2. **Registration of 4 Routes in `App.jsx`**: `/admin/tutors`, `/admin/users`, `/admin/reviews`, `/admin/issues` protected with `<Protected role="admin">`.
3. **Canonical Domain Extensions**: Add `status` to tutor profiles and accounts, canonical `issues` collection, and reactive admin hooks in `DemoDomainContext.jsx`.
4. **Implementation of 4 Management Pages & `AdminDrawer`**: Operational pages with instant search, status tabs, record counters, sticky header tables, and slide-over drawers preserving table scroll and filter state.
5. **Dashboard Refactor**: Connect `/admin/dashboard` metrics and sections to `useAdminOverview()`.

All details, code snippets, visual tokens, and implementation guidelines have been fully documented in `admin_ui_report.md`.

---

## 5. Verification Method

To verify these findings independently:
1. **Inspect Route Definitions**:
   `view_file` on `d:/tutor demo/TutorDemo/apps/web/src/App.jsx` to confirm lines 38-39 contain only `/admin/dashboard`.
2. **Inspect Existing Admin Implementation**:
   `view_file` on `d:/tutor demo/TutorDemo/apps/web/src/features/admin/AdminDashboard.jsx` to confirm local mock state and embedded sidebar/header.
3. **Inspect CSS & Dependencies**:
   `view_file` on `d:/tutor demo/TutorDemo/apps/web/package.json` to verify absence of Tailwind CSS and presence of Lucide React.
4. **Inspect Shared Primitives**:
   `list_dir` on `d:/tutor demo/TutorDemo/apps/web/src/components` to confirm available and missing UI components.
5. **Run Unit Test Baseline**:
   In `apps/web`: `npm run test` (or `node --test`) to verify all 55 existing unit tests pass before implementation.

**Invalidation Conditions**:
- If someone has already committed `AdminShell.jsx`, `AdminTutors.jsx`, or routes in `App.jsx`, the findings regarding missing files would be invalidated.
