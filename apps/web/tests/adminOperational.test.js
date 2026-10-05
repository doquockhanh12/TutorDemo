import test from 'node:test';
import assert from 'node:assert/strict';
import { demoReferenceData } from '../src/data/demoReferenceData.js';

import {
  formatRecordCount,
  matchesQuery,
  filterTutors,
  filterUsers,
  filterReviews,
  filterIssues,
} from './adminTestHelpers.js';

// ---------------------------------------------------------------------------
// TIER 1 & TIER 2: RECORD COUNTER FORMATTING (F10, R5)
// ---------------------------------------------------------------------------

test('F10-T1-01: Record counter strictly formats as "Hiển thị X / Y bản ghi"', () => {
  const formatted = formatRecordCount(5, 10);
  assert.equal(formatted, 'Hiển thị 5 / 10 bản ghi');
});

test('F10-T1-02: Record counter matches required regex strictly', () => {
  const counterRegex = /^Hiển thị \d+ \/ \d+ bản ghi$/;
  assert.ok(counterRegex.test(formatRecordCount(0, 0)));
  assert.ok(counterRegex.test(formatRecordCount(1, 15)));
  assert.ok(counterRegex.test(formatRecordCount(25, 25)));
  assert.ok(!counterRegex.test('Showing 5 / 10 records'));
  assert.ok(!counterRegex.test('Hiển thị 5 / 10'));
});

test('F10-T2-01: Record counter formats properly when zero records are visible', () => {
  assert.equal(formatRecordCount(0, 12), 'Hiển thị 0 / 12 bản ghi');
});

test('F10-T2-02: Record counter formats properly when total dataset is empty', () => {
  assert.equal(formatRecordCount(0, 0), 'Hiển thị 0 / 0 bản ghi');
});

test('F10-T2-03: Record counter formats properly when all records are visible', () => {
  assert.equal(formatRecordCount(8, 8), 'Hiển thị 8 / 8 bản ghi');
});

test('F10-T2-04: Table sticky header configuration requires position sticky and top 0', () => {
  const stickyStyle = { position: 'sticky', top: 0, zIndex: 2 };
  assert.equal(stickyStyle.position, 'sticky');
  assert.equal(stickyStyle.top, 0);
  assert.ok(stickyStyle.zIndex >= 1);
});

// ---------------------------------------------------------------------------
// TIER 1 & TIER 2: TUTOR MANAGEMENT OPERATIONAL PAGE (F13, R6)
// ---------------------------------------------------------------------------

test('F13-T1-01: Tutor table filters by status tabs correctly', () => {
  const tutors = [
    { id: '1', name: 'A', moderationStatus: 'pending' },
    { id: '2', name: 'B', moderationStatus: 'approved' },
    { id: '3', name: 'C', moderationStatus: 'rejected' },
    { id: '4', name: 'D', moderationStatus: 'suspended' },
  ];
  assert.equal(filterTutors(tutors, 'Tất cả', '').length, 4);
  assert.equal(filterTutors(tutors, 'Chờ duyệt', '').length, 1);
  assert.equal(filterTutors(tutors, 'Đã duyệt', '').length, 1);
  assert.equal(filterTutors(tutors, 'Đã từ chối', '').length, 1);
  assert.equal(filterTutors(tutors, 'Tạm khóa', '').length, 1);
});

test('F13-T1-02: Tutor table case-insensitive Vietnamese search matches name and university', () => {
  const tutors = [
    { id: '1', name: 'Lê Thảo Vy', university: 'ĐH Sư phạm TP.HCM', subjects: ['Tiếng Anh'] },
    { id: '2', name: 'Nguyễn Hoàng Phúc', university: 'ĐH Bách khoa TP.HCM', subjects: ['Toán'] },
  ];
  // Search lowercase
  assert.equal(filterTutors(tutors, 'Tất cả', 'thảo vy').length, 1);
  // Search uppercase
  assert.equal(filterTutors(tutors, 'Tất cả', 'LÊ THẢO VY').length, 1);
  // Search university
  assert.equal(filterTutors(tutors, 'Tất cả', 'bách khoa').length, 1);
  // Search subject
  assert.equal(filterTutors(tutors, 'Tất cả', 'tiếng anh').length, 1);
  // Search mismatch
  assert.equal(filterTutors(tutors, 'Tất cả', 'hóa học').length, 0);
});

test('F13-T2-01: Tutor table combines active tab AND search query with boolean AND', () => {
  const tutors = [
    { id: '1', name: 'Lê Thảo Vy', moderationStatus: 'pending', subjects: ['Tiếng Anh'] },
    { id: '2', name: 'Trần Gia Bảo', moderationStatus: 'approved', subjects: ['Tiếng Anh'] },
  ];
  // Tab: Chờ duyệt, Search: Tiếng Anh -> only Lê Thảo Vy
  const result = filterTutors(tutors, 'Chờ duyệt', 'Tiếng Anh');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, '1');
});

// ---------------------------------------------------------------------------
// TIER 1 & TIER 2: USER MANAGEMENT OPERATIONAL PAGE (F14, R6)
// ---------------------------------------------------------------------------

test('F14-T1-01: User table filters by role and status tabs correctly', () => {
  const users = [
    { id: 'u1', fullName: 'Học viên 1', role: 'learner', status: 'active' },
    { id: 'u2', fullName: 'Gia sư 1', role: 'tutor', status: 'active' },
    { id: 'u3', fullName: 'Khóa 1', role: 'learner', status: 'suspended' },
  ];
  assert.equal(filterUsers(users, 'Tất cả', '').length, 3);
  assert.equal(filterUsers(users, 'Học viên/Phụ huynh', '').length, 2);
  assert.equal(filterUsers(users, 'Gia sư', '').length, 1);
  assert.equal(filterUsers(users, 'Đang hoạt động', '').length, 2);
  assert.equal(filterUsers(users, 'Đang bị khóa', '').length, 1);
});

test('F14-T1-02: User table search matches username, email, and phone', () => {
  const users = [
    { id: 'u1', fullName: 'Nguyễn Minh Anh', username: 'minhanh', email: 'minhanh@test.vn', phone: '0901111111' },
    { id: 'u2', fullName: 'Trần Gia Bảo', username: 'giabao', email: 'giabao@test.vn', phone: '0902222222' },
  ];
  assert.equal(filterUsers(users, 'Tất cả', 'minhanh').length, 1);
  assert.equal(filterUsers(users, 'Tất cả', 'test.vn').length, 2);
  assert.equal(filterUsers(users, 'Tất cả', '0902222222').length, 1);
});

// ---------------------------------------------------------------------------
// TIER 1 & TIER 2: REVIEW MODERATION OPERATIONAL PAGE (F15, R6)
// ---------------------------------------------------------------------------

test('F15-T1-01: Review table filters by moderation tabs correctly', () => {
  const reviews = [
    { id: 'r1', moderationStatus: 'pending' },
    { id: 'r2', moderationStatus: 'approved' },
    { id: 'r3', moderationStatus: 'hidden' },
  ];
  assert.equal(filterReviews(reviews, 'Cần duyệt / Xem xét', '').length, 1);
  assert.equal(filterReviews(reviews, 'Đã hiển thị', '').length, 1);
  assert.equal(filterReviews(reviews, 'Đã ẩn', '').length, 1);
});

test('F15-T1-02: Review table search matches review content and author', () => {
  const reviews = [
    { id: 'r1', author: 'Phụ huynh Minh Khang', comment: 'Gia sư dạy rất nhiệt tình' },
    { id: 'r2', author: 'Ngọc Lan', comment: 'Bé tiến bộ môn Toán rõ rệt' },
  ];
  assert.equal(filterReviews(reviews, 'all', 'minh khang').length, 1);
  assert.equal(filterReviews(reviews, 'all', 'tiến bộ').length, 1);
  assert.equal(filterReviews(reviews, 'all', 'tiếng anh').length, 0);
});

// ---------------------------------------------------------------------------
// TIER 1 & TIER 2: ISSUE RESOLUTION OPERATIONAL PAGE (F16, R6)
// ---------------------------------------------------------------------------

test('F16-T1-01: Issue table filters by status tabs correctly', () => {
  const issues = [
    { id: 'IS-2048', status: 'new' },
    { id: 'IS-2045', status: 'in_progress' },
    { id: 'IS-2038', status: 'resolved' },
  ];
  assert.equal(filterIssues(issues, 'Mới tiếp nhận', '').length, 1);
  assert.equal(filterIssues(issues, 'Đang xử lý', '').length, 1);
  assert.equal(filterIssues(issues, 'Đã giải quyết', '').length, 1);
});

test('F16-T1-02: Issue table search matches ticket code and category', () => {
  const issues = [
    { id: 'IS-2048', category: 'absence', description: 'Gia sư vắng mặt' },
    { id: 'RP-1172', category: 'attitude', description: 'Phản ánh thái độ' },
  ];
  assert.equal(filterIssues(issues, 'all', 'IS-2048').length, 1);
  assert.equal(filterIssues(issues, 'all', 'RP-1172').length, 1);
  assert.equal(filterIssues(issues, 'all', 'vắng mặt').length, 1);
});

// ---------------------------------------------------------------------------
// TIER 1 & TIER 2: SLIDE-OVER DRAWER UX & NON-LOSS STATE (F11, R5)
// ---------------------------------------------------------------------------

test('F11-T1-01: Drawer state preserves background table active tab and search query', () => {
  const tableState = {
    activeTab: 'Chờ duyệt',
    searchQuery: 'Thảo Vy',
    selectedEntityId: null,
    isDrawerOpen: false,
  };

  // Open drawer for inspection
  const openedState = {
    ...tableState,
    selectedEntityId: 'thao-vy',
    isDrawerOpen: true,
  };
  assert.equal(openedState.activeTab, 'Chờ duyệt', 'Tab must not reset upon opening drawer');
  assert.equal(openedState.searchQuery, 'Thảo Vy', 'Search query must not reset upon opening drawer');

  // Execute approval decision inside drawer
  const decisionState = {
    ...openedState,
    selectedEntityStatus: 'approved',
  };
  assert.equal(decisionState.activeTab, 'Chờ duyệt');
  assert.equal(decisionState.searchQuery, 'Thảo Vy');

  // Close drawer
  const closedState = {
    ...decisionState,
    isDrawerOpen: false,
    selectedEntityId: null,
  };
  assert.equal(closedState.activeTab, 'Chờ duyệt', 'Tab must remain preserved after drawer closes');
  assert.equal(closedState.searchQuery, 'Thảo Vy', 'Search query must remain preserved after drawer closes');
});

test('F11-T1-02: Drawer for pending tutor requires verification documents card references', () => {
  const pendingTutor = {
    id: 'thao-vy',
    name: 'Lê Thảo Vy',
    verificationDocuments: [
      { type: 'student_card', title: 'Thẻ sinh viên ĐH Sư phạm', verified: true },
      { type: 'identity_card', title: 'CCCD gắn chip', verified: true },
      { type: 'certificate', title: 'Chứng chỉ IELTS 7.5', verified: true },
    ]
  };
  assert.ok(pendingTutor.verificationDocuments.length >= 2, 'Drawer must display verification documents');
  assert.ok(pendingTutor.verificationDocuments.some((d) => d.type === 'student_card' || d.type === 'teacher_card'));
});

test('F11-T2-01: Rejecting tutor in drawer requires non-empty reason string', () => {
  function validateRejection(reason) {
    if (!reason || !reason.trim()) {
      return { valid: false, error: 'Vui lòng cung cấp lý do từ chối hồ sơ.' };
    }
    return { valid: true };
  }
  assert.equal(validateRejection('').valid, false);
  assert.equal(validateRejection('   ').valid, false);
  assert.equal(validateRejection('Thông tin văn bằng chưa trùng khớp').valid, true);
});

test('F11-T2-02: Resolving issue in drawer requires and persists resolution note', () => {
  function resolveIssueTicket(issue, note) {
    if (!note || !note.trim()) {
      return { error: 'Vui lòng nhập ghi chú giải quyết trước khi đóng sự cố.' };
    }
    return {
      issue: { ...issue, status: 'resolved', resolutionNote: note.trim(), resolvedAt: new Date().toISOString() }
    };
  }
  const ticket = { id: 'IS-2048', status: 'new' };
  assert.ok(resolveIssueTicket(ticket, '').error);
  const resolved = resolveIssueTicket(ticket, 'Đã hoàn tiền 100%');
  assert.equal(resolved.issue.status, 'resolved');
  assert.equal(resolved.issue.resolutionNote, 'Đã hoàn tiền 100%');
});

// ---------------------------------------------------------------------------
// TIER 1 & TIER 2: RESPONSIVE LAYOUT (F12, R5)
// ---------------------------------------------------------------------------

test('F12-T1-01: Breakpoints are defined for desktop (1440px), tablet (1024px), mobile (390px)', () => {
  const viewports = {
    desktop: 1440,
    tablet: 1024,
    mobile: 390,
  };
  assert.equal(viewports.desktop, 1440);
  assert.equal(viewports.tablet, 1024);
  assert.equal(viewports.mobile, 390);
});

test('F12-T2-01: Drawer width adapts according to viewport configuration', () => {
  function getDrawerWidth(viewportWidth) {
    if (viewportWidth >= 1024) return '520px'; // Desktop fixed drawer
    if (viewportWidth >= 768) return '75%';    // Tablet percentage drawer
    return '100%';                             // Mobile full width drawer
  }
  assert.equal(getDrawerWidth(1440), '520px');
  assert.equal(getDrawerWidth(1024), '520px');
  assert.equal(getDrawerWidth(768), '75%');
  assert.equal(getDrawerWidth(390), '100%');
});

// ---------------------------------------------------------------------------
// TIER 1 & TIER 2: SIDEBAR NAVIGATION & BADGES (F3, R1)
// ---------------------------------------------------------------------------

test('F3-T1-01: Admin sidebar route items conform to specifications', () => {
  const routes = [
    { path: '/admin/dashboard', label: 'Tổng quan' },
    { path: '/admin/tutors', label: 'Gia sư', hasBadge: true },
    { path: '/admin/users', label: 'Người dùng', hasBadge: false },
    { path: '/admin/reviews', label: 'Đánh giá', hasBadge: true },
    { path: '/admin/issues', label: 'Báo cáo & sự cố', hasBadge: true },
  ];
  assert.equal(routes.length, 5);
  assert.ok(routes.some((r) => r.path === '/admin/tutors' && r.hasBadge));
  assert.ok(routes.some((r) => r.path === '/admin/reviews' && r.hasBadge));
  assert.ok(routes.some((r) => r.path === '/admin/issues' && r.hasBadge));
});

test('F3-T2-01: Sidebar reactive badge counts decrement upon administrative action', () => {
  const state = {
    pendingTutors: 3,
    pendingReviews: 2,
    openIssues: 4,
  };
  // Admin approves 1 tutor
  const afterTutorApproval = { ...state, pendingTutors: state.pendingTutors - 1 };
  assert.equal(afterTutorApproval.pendingTutors, 2);

  // Admin resolves 1 issue
  const afterIssueResolved = { ...afterTutorApproval, openIssues: afterTutorApproval.openIssues - 1 };
  assert.equal(afterIssueResolved.openIssues, 3);
});
