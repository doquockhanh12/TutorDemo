import { identityKey, normalizePhone } from '../src/features/auth/authUtils.js';

export const SUSPENDED_ERROR_MESSAGE = 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.';
export const INVALID_CREDENTIALS_ERROR = 'Thông tin đăng nhập chưa chính xác. Tài khoản demo: minhanh / demo1234, giabao / demo1234, admin / demo1234.';

// Canonical selector for Learner discovery
export function selectLearnerDiscoveredTutors(state) {
  return (state.profiles || []).filter((p) => (p.moderationStatus || 'approved') === 'approved');
}

// Canonical selector for Tutor public profile reviews
export function selectPublicProfileReviews(state, tutorId) {
  return (state.reviews || []).filter((r) =>
    r.tutorId === tutorId &&
    (r.moderationStatus || 'approved') === 'approved' &&
    (r.visibility || 'public') === 'public'
  );
}

// Canonical rating summary calculator
export function calculateTutorRatingSummary(reviews) {
  if (!reviews || reviews.length === 0) {
    return { averageRating: 0, reviewCount: 0, formatted: 'Chưa có đánh giá' };
  }
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  const avg = Number((sum / reviews.length).toFixed(1));
  return { averageRating: avg, reviewCount: reviews.length, formatted: `${avg}/5` };
}

// Canonical formatter for operational table record counter
export function formatRecordCount(visibleCount, totalCount) {
  return `Hiển thị ${visibleCount} / ${totalCount} bản ghi`;
}

// Canonical case-insensitive Vietnamese search matcher
export function matchesQuery(item, query, fields) {
  if (!query || !query.trim()) return true;
  const normalizedQuery = query.trim().toLocaleLowerCase('vi-VN');
  return fields.some((field) => {
    const val = item[field];
    if (!val) return false;
    if (Array.isArray(val)) {
      return val.some((v) => String(v).toLocaleLowerCase('vi-VN').includes(normalizedQuery));
    }
    return String(val).toLocaleLowerCase('vi-VN').includes(normalizedQuery);
  });
}

// Filter functions for operational tables
export function filterTutors(tutors, tab, query) {
  const filteredByTab = tutors.filter((t) => {
    if (tab === 'all' || tab === 'Tất cả') return true;
    if (tab === 'pending' || tab === 'Chờ duyệt') return t.moderationStatus === 'pending';
    if (tab === 'approved' || tab === 'Đã duyệt') return (t.moderationStatus || 'approved') === 'approved';
    if (tab === 'rejected' || tab === 'Đã từ chối') return t.moderationStatus === 'rejected';
    if (tab === 'suspended' || tab === 'Tạm khóa') return t.moderationStatus === 'suspended';
    return true;
  });
  return filteredByTab.filter((t) =>
    matchesQuery(t, query, ['name', 'university', 'school', 'subjects', 'email'])
  );
}

export function filterUsers(users, tab, query) {
  const filteredByTab = users.filter((u) => {
    if (tab === 'all' || tab === 'Tất cả') return true;
    if (tab === 'learners' || tab === 'Học viên/Phụ huynh') return u.role === 'learner' || u.role === 'parent';
    if (tab === 'tutors' || tab === 'Gia sư') return u.role === 'tutor';
    if (tab === 'active' || tab === 'Đang hoạt động') return (u.status || 'active') === 'active';
    if (tab === 'suspended' || tab === 'Đang bị khóa') return u.status === 'suspended';
    return true;
  });
  return filteredByTab.filter((u) =>
    matchesQuery(u, query, ['fullName', 'username', 'email', 'phone'])
  );
}

export function filterReviews(reviews, tab, query) {
  const filteredByTab = reviews.filter((r) => {
    if (tab === 'pending' || tab === 'Cần duyệt / Xem xét') return r.moderationStatus === 'pending';
    if (tab === 'approved' || tab === 'Đã hiển thị') return (r.moderationStatus || 'approved') === 'approved';
    if (tab === 'hidden' || tab === 'Đã ẩn') return r.moderationStatus === 'hidden';
    return true;
  });
  return filteredByTab.filter((r) =>
    matchesQuery(r, query, ['author', 'comment', 'tutorName'])
  );
}

export function filterIssues(issues, tab, query) {
  const filteredByTab = issues.filter((i) => {
    if (tab === 'new' || tab === 'Mới tiếp nhận') return i.status === 'new';
    if (tab === 'in_progress' || tab === 'Đang xử lý') return i.status === 'in_progress';
    if (tab === 'resolved' || tab === 'Đã giải quyết') return i.status === 'resolved';
    return true;
  });
  return filteredByTab.filter((i) =>
    matchesQuery(i, query, ['id', 'category', 'description', 'learnerName', 'tutorName'])
  );
}

// Canonical auth simulators conforming to DemoAuthContext R4 contract
export function authenticateUser(accounts, identity, password) {
  const key = identityKey(identity);
  const user = accounts.find((item) =>
    [item.username, item.email, item.phone].some((v) => identityKey(v) === key)
  );
  if (!user || user.password !== password) {
    return { error: INVALID_CREDENTIALS_ERROR };
  }
  if (user.status === 'suspended') {
    return { error: SUSPENDED_ERROR_MESSAGE };
  }
  return { user };
}

export function authenticateProvider(accounts, provider, payload) {
  let user = null;
  if (provider === 'phone') {
    const norm = normalizePhone(payload?.phone);
    user = accounts.find((item) => normalizePhone(item.phone) === norm);
  } else {
    user = accounts.find((item) => item.linkedProviders?.includes(provider));
  }
  if (!user) {
    return { registration: true, provider, payload };
  }
  if (user.status === 'suspended') {
    return { error: SUSPENDED_ERROR_MESSAGE };
  }
  return { user };
}
