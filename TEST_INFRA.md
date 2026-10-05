# E2E Test Infra: TutorNearMe Admin Flow Subsystem

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on internal implementation details.
- Derived strictly from `ORIGINAL_REQUEST.md` and `PROJECT.md § Feature Inventory`.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial + Real-World Workload Testing across Tiers 1-4.

## Feature Inventory & Tier Mapping
| # | Feature | Requirement | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Scenario) |
|---|---------|-------------|:-----------------:|:-----------------:|:-----------------:|:-----------------:|
| 1 | Admin Shell & Routes | R1 | 5 | 5 | ✓ | ✓ |
| 2 | Header Identity & Logout | R1 | 5 | 5 | ✓ | ✓ |
| 3 | Sidebar Navigation & Badges | R1 | 5 | 5 | ✓ | ✓ |
| 4 | Canonical Domain Persistence | R2 | 5 | 5 | ✓ | ✓ |
| 5 | Admin Domain Hooks | R2 | 5 | 5 | ✓ | ✓ |
| 6 | Deterministic Seed Fixtures | R3 | 5 | 5 | ✓ | ✓ |
| 7 | Tutor Moderation & Search Sync | R4 | 5 | 5 | ✓ | ✓ |
| 8 | Review Moderation & Profile Sync | R4 | 5 | 5 | ✓ | ✓ |
| 9 | Account Suspension & Auth Guard | R4 | 5 | 5 | ✓ | ✓ |
| 10 | Table Sticky Header & Record Count | R5 | 5 | 5 | ✓ | ✓ |
| 11 | Slide-over Drawer UX & Non-loss State | R5 | 5 | 5 | ✓ | ✓ |
| 12 | Responsive Layout (1440/1024/390px) | R5 | 5 | 5 | ✓ | ✓ |
| 13 | Tutor Management Page | R6 | 5 | 5 | ✓ | ✓ |
| 14 | User Management Page | R6 | 5 | 5 | ✓ | ✓ |
| 15 | Review Moderation Page | R6 | 5 | 5 | ✓ | ✓ |
| 16 | Issue Resolution Page | R6 | 5 | 5 | ✓ | ✓ |
| 17 | Dashboard Live Projections | R7 | 5 | 5 | ✓ | ✓ |
| 18 | Unit Test Invariant Protection | AC | 5 | 5 | ✓ | ✓ |
| 19 | Production Build Integrity | AC | 5 | 5 | ✓ | ✓ |

## Test Architecture
- Test Runner: Node.js test runner (`node --test tests/*.test.js`) executed in `apps/web`.
- Verification mechanism: Pure requirement-based assertions against domain state, auth boundary responses, and UI component outputs.
- Test Files:
  - `apps/web/tests/adminDomain.test.js`: Domain reducers, hooks, fixtures, and cross-role state mutations.
  - `apps/web/tests/adminAuthGuard.test.js`: Auth suspension rejection with exact error string and unsuspension login recovery.
  - `apps/web/tests/adminCrossRoleSync.test.js`: Tutor approval discovery and review moderation visibility.
  - `apps/web/tests/adminOperational.test.js`: Table filters, search matching, record counter formatting (`"Hiển thị X / Y bản ghi"`), drawer actions.
  - `apps/web/tests/adminE2EScenarios.test.js`: End-to-end multi-step flows simulating real-world admin workflows.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Onboarding New Tutor Workflow: Pending application review, document inspection, approval decision, verification that tutor immediately appears in Learner search | F1, F6, F7, F10, F11, F13 | High |
| 2 | Dispute & Suspension Workflow: Learner files attitude complaint issue, Admin reviews issue in Drawer, suspends Tutor, verifies Tutor is blocked at /login with exact error message | F6, F9, F11, F14, F16 | High |
| 3 | Inappropriate Review Moderation: Flagged 1-star abusive review hidden by Admin, verified instantly absent from Tutor profile page, verified approved reviews remain visible | F6, F8, F11, F15 | Medium |
| 4 | Dashboard Reactive Metric Integrity: Bulk operational actions executed, dashboard counters and recent activity widgets reflect updated counts reactively | F3, F4, F5, F17 | Medium |
| 5 | Full Recovery & Unsuspend: Suspended account unsuspended by Admin in User Drawer, login restored with valid credentials, session persisted | F6, F9, F11, F14 | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature (19 × 5 = 95 test cases)
- Tier 2: ≥5 per feature boundary cases
- Tier 3: Pairwise combinations across operational entities
- Tier 4: ≥5 realistic end-to-end application scenarios
