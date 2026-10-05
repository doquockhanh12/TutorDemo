# Handoff Report: Domain, Storage & Cross-Role Architecture Survey

## 1. Observation

- **Domain Storage Key & State Reducer**:
  - `apps/web/src/features/domain/demoDomain.js:4`: `export const DOMAIN_STORAGE_KEY = 'tnm.demo.domain.v1';`
  - `apps/web/src/features/domain/demoDomain.js:47-57`: `createDemoState(now = new Date())` returns:
    `{ version: 1, profiles: seed.tutorProfiles, requests, lessons, availability, settings, savedByAccount, nextRequestNumber: 1 }`
  - `seed.accounts` (lines 13-56) and `seed.reviews` (lines 907-1027) exist in `apps/web/src/data/demoReferenceData.js`, but are not initialized in `createDemoState`.
  - `issues` does not exist in `demoReferenceData.js`; it only exists as a static mock array in `apps/web/src/data/adminDashboard.js:18-22`.
- **Domain Persistence & Reactivity**:
  - `apps/web/src/features/domain/DemoDomainContext.jsx:10`: `const [state, setState] = useState(() => restoreDemoState(localStorage));`
  - `apps/web/src/features/domain/DemoDomainContext.jsx:28`:
    `useEffect(() => { try { localStorage.setItem(DOMAIN_STORAGE_KEY, JSON.stringify(state)); } catch { /* Demo storage may be unavailable. */ } }, [state]);`
  - `apps/web/src/App.jsx:25`: `<TutorWorkspaceProvider><Routes>...</Routes></TutorWorkspaceProvider>` where `TutorWorkspaceProvider = DemoDomainProvider;` wraps all routes.
- **Auth System & Session**:
  - `apps/web/src/features/auth/DemoAuthContext.jsx:6`: `const STORAGE_KEY = 'tutornearme.demo-auth.v1';`
  - `apps/web/src/features/auth/DemoAuthContext.jsx:47-52`:
    ```javascript
    const login = (identity, password, remember = true) => {
      const key = identityKey(identity);
      const user = allAccounts().find((item) => [item.username, item.email, item.phone].some((v) => identityKey(v) === key));
      if (!user || user.password !== password) return { error: 'Thông tin đăng nhập chưa chính xác. Tài khoản demo: minhanh / demo1234, giabao / demo1234, admin / demo1234.' };
      persist({ ...state, user }, remember); return { user };
    };
    ```
- **Learner & Tutor Consumers**:
  - `apps/web/src/features/learner/LearnerSearch.jsx:20`: `const tutors = useScheduledTutors();`
  - `apps/web/src/features/tutor/TutorWorkspaceState.jsx:23-29`: `useScheduledTutors()` maps over `state.profiles` unconditionally without filtering for moderation status.
  - `apps/web/src/features/learner/TutorProfilePage.jsx:28 & 573`: imports static `profileReviews` from `../../data/tutorProfiles.js` and renders all reviews without checking `tutorId`, `visibility`, or `moderationStatus`.
- **Existing Tests & Invariants**:
  - Command: `npm run test` in `apps/web` executes `node --test`. Currently **55 tests pass**, 0 fail.
  - `apps/web/tests/demoDomain.test.js:172`: `assert.equal(state.requests.length, 9);` (Strict invariant: requests array length must remain 9).
  - `apps/web/tests/demoDomain.test.js:87`: `assert.equal(tutors, demoReferenceData.tutorProfiles);`
  - Vite production build (`npm run build` in `apps/web`) completes with code 0.

## 2. Logic Chain

1. **R2 Invariant**: The user prompt and `AGENTS.md` explicitly forbid creating a second storage key or duplicate entity store for Admin.
   - *Observation*: `DOMAIN_STORAGE_KEY` (`'tnm.demo.domain.v1'`) is mounted globally at `App.jsx` and already persists `profiles`, `requests`, `lessons`, and `availability`.
   - *Inference*: Admin must extend this single state object by including `users`, `reviews`, and `issues`, rather than creating any `tnm.admin.*` storage key.
2. **R4 Suspension Guard**:
   - *Observation*: `DemoAuthContext.jsx:47` handles authentication at `/login`. It currently checks password match against `allAccounts()`.
   - *Inference*: Inserting an `isAccountSuspended(user.id)` check immediately before persisting the session directly enforces the required error message `"Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ."` without changing `/login` page structure or violating single-route rules.
3. **R4 Cross-Role Tutor & Review Synchronization**:
   - *Observation*: `LearnerSearch` queries `useScheduledTutors()`, which does not filter out pending/suspended tutors. `TutorProfilePage` renders static `profileReviews` from file.
   - *Inference*: Filtering `useScheduledTutors()` by `moderationStatus === 'approved'` and switching `TutorProfilePage` reviews to `useDemoDomain().reviews.filter(r => r.tutorId === id && r.visibility === 'public')` guarantees instant reactive synchronization when Admin approves/hides records.
4. **Existing Test Invariance**:
   - *Observation*: `tests/demoDomain.test.js:172` strictly tests `assert.equal(state.requests.length, 9)`.
   - *Inference*: Seed requests in `demoReferenceData.requests` must be left intact with exactly 9 items to avoid failing existing test `BUG-010`.

## 3. Caveats

- **No Caveats** on domain and storage architecture: the mechanisms are fully explored, deterministic, and mapped directly to source code lines.
- For Admin Drawer presentation, CSS styling for slide-over animations and backdrop scrim should reuse the existing `.admin-workspace` tokens and `useDialogFocus` hook.

## 4. Conclusion

The canonical shared domain in `tnm.demo.domain.v1` is the single source of truth for the entire application. The recommended implementation plan is:
1. Extend `demoReferenceData.js` with canonical `issues`, pending/rejected/suspended `tutorProfiles`, suspended `accounts`, and review moderation states (leaving `requests` at length 9).
2. Update `createDemoState` and `restoreDemoState` in `demoDomain.js` to initialize and reconcile `users`, `reviews`, and `issues`.
3. Add pure reducer functions in `demoDomain.js` and action callbacks in `DemoDomainContext.jsx`.
4. Add the suspension guard in `DemoAuthContext.jsx` returning the exact Vietnamese error string.
5. Create Admin adapters/hooks (`useAdminOverview`, `useAdminTutors`, `useAdminUsers`, `useAdminReviews`, `useAdminIssues`) so Admin UI components consume pure domain hooks.
6. Connect `useScheduledTutors` and `TutorProfilePage` to the domain filters.
7. Implement `AdminShell` (with `AdminHeader` having no RoleSwitcher and red LogOut, plus `AdminSidebar` with reactive badges) and the 4 management views with slide-over drawers.

## 5. Verification Method

- Run unit test suite:
  ```powershell
  cd "d:/tutor demo/TutorDemo/apps/web"
  npm run test
  ```
  Expected: All 55 existing tests pass without modification.
- Run production build:
  ```powershell
  cd "d:/tutor demo/TutorDemo/apps/web"
  npm run build
  ```
  Expected: Clean build with 0 errors.
- Invalidation Conditions:
  - If `state.requests.length !== 9`, test `BUG-010` will fail.
  - If `tnm.demo.domain.v1` is bypassed in favor of an Admin-specific storage key, R2 is violated.
  - If `/login` is modified to a role-specific login route, Auth V4 guardrails in `AGENTS.md` are violated.
