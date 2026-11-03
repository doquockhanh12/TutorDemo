import { expect, test } from '@playwright/test';
import { login, logout, resetDemo } from './demoHelpers.js';
import { demoReferenceData } from '../../src/data/demoReferenceData.js';

test.beforeEach(async ({ page }) => resetDemo(page));

test('BUG-001 learner-created request appears for the canonical tutor and decision returns to learner', async ({ page }) => {
  await login(page, 'minhanh', '/tutors/quoc-bao');
  await page.getByRole('button', { name: 'ĐẶT LỊCH HỌC' }).click();
  await page.locator('#profile-subjects').getByRole('button', { name: 'Tiếng Anh', exact: true }).click();
  await page.locator('#profile-subjects').getByRole('button', { name: 'THCS', exact: true }).click();
  await page.getByRole('region', { name: 'Lịch rảnh của Trần Gia Bảo' }).getByRole('button').first().click();
  await page.locator('#profile-location').getByRole('button', { name: 'Online', exact: true }).click();
  await page.getByLabel(/Mong muốn học tập/).fill('Luyện giao tiếp');
  await page.getByRole('button', { name: 'Gửi yêu cầu học', exact: true }).click();
  await expect(page).toHaveURL(/\/requests\/[^/]+$/);
  const requestId = new URL(page.url()).pathname.split('/').at(-1);
  await logout(page);
  await login(page, 'giabao', '/tutor/find-students');
  await expect(page.locator(`a[href="/tutor/requests/${requestId}"]`)).toBeVisible();
  await login(page, 'giabao', '/tutor/requests');
  const requestLink = page.locator(`a[href="/tutor/requests/${requestId}"]`);
  await expect(requestLink).toBeVisible();
  await requestLink.click();
  await page.getByRole('button', { name: 'Chấp nhận và tạo lớp' }).click();
  await expect(page.getByRole('status')).toContainText('Đã nhận');
  await logout(page);
  await login(page, 'minhanh', `/requests/${requestId}`);
  await logout(page);
  await login(page, 'giabao', '/tutor/timetable');
  await expect(page.getByRole('button', { name: /Tiếng Anh.*Nguyễn Minh Anh/ }).first()).toBeVisible();
  await logout(page);
  await login(page, 'minhanh', `/requests/${requestId}`);
  await expect(page.locator('main')).toContainText('Đã xác nhận');
});

test('BUG-002 learner cannot complete an incomplete legacy acceptance', async ({ page }) => {
  await login(page, 'minhanh', '/requests/demo-02');
  await expect(page.getByRole('heading', { name: 'Tiếng Anh với Trần Gia Bảo' })).toBeVisible();
  await expect(page.locator('main')).toContainText('Cần kiểm tra lớp');
  await expect(page.getByRole('button', { name: 'Đánh dấu đã học xong' })).toHaveCount(0);
});

test('BUG-013 missing legacy request areas do not imply an online lesson', async ({ page }) => {
  await login(page, 'minhanh', '/requests/demo-02');
  await expect(page.locator('main')).toContainText('Chưa xác định');
  await expect(page.locator('main')).toContainText('Chưa có khu vực được gửi');
  await expect(page.locator('main')).not.toContainText('Không yêu cầu khu vực — học online');
});

test('BUG-003 learner filters preserve incomplete legacy requests without claiming completion', async ({ page }) => {
  await login(page, 'minhanh', '/requests');
  await page.getByRole('button', { name: 'Chờ phản hồi', exact: true }).click();
  await expect(page.locator('a[href="/requests/demo-01"]')).toBeVisible();
  await expect(page.locator('a[href="/requests/demo-02"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Hoàn tất', exact: true }).click();
  await expect(page.locator('a[href="/requests/demo-03"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Tất cả', exact: true }).click();
  await expect(page.locator('a[href="/requests/demo-03"]')).toContainText('Cần kiểm tra lớp');
  const statuses = await page.evaluate(() => JSON.parse(localStorage.getItem('tnm.demo.domain.v1')).requests.map((r) => r.status));
  expect(statuses.every((s) => ['pending','accepted','needs_revision','rejected','cancelled'].includes(s))).toBe(true);
});

test('BUG-004 learner request badges expose distinct semantic tones', async ({ page }) => {
  await login(page, 'minhanh', '/requests/demo-01');
  await expect(page.locator('main .badge').filter({ hasText: 'Chờ phản hồi' })).toHaveClass(/badge--warning/);
  await page.getByRole('button', { name: 'Hủy yêu cầu' }).click();
  await expect(page.locator('main .badge').filter({ hasText: 'Đã hủy' })).toHaveClass(/badge--danger/);
  await page.goto('/requests/demo-02');
  await expect(page.locator('main .badge').filter({ hasText: 'Cần kiểm tra lớp' })).toHaveClass(/badge--warning/);
  await page.goto('/requests/demo-03');
  await expect(page.locator('main .badge').filter({ hasText: 'Cần kiểm tra lớp' })).toHaveClass(/badge--warning/);
});

for (const [decision, button, label, tone] of [['rejected','Từ chối','Đã từ chối','flow-error'], ['accepted','Chấp nhận và tạo lớp','Đã nhận','flow-success']]) {
  test(`BUG-005 tutor ${decision} decision feedback uses correct semantics`, async ({ page }) => {
    await login(page, 'giabao', '/tutor/requests/req-1');
    await page.getByRole('button', { name: button, exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: label })).toHaveClass(new RegExp(tone));
  });
}

test('BUG-006 tutor identity stays consistent across header dashboard profile and public profile', async ({ page }) => {
  await login(page, 'giabao', '/tutor/dashboard');
  await expect(page.getByRole('heading', { name: /Xin chào, Trần Gia Bảo/ })).toBeVisible();
  await expect(page.locator('#tutor-profile-summary')).toContainText('Trần Gia Bảo');
  await expect(page.getByRole('banner').getByRole('img', { name: 'Ảnh đại diện của Trần Gia Bảo' })).toBeVisible();
  await page.goto('/tutor/profile');
  await expect(page.getByLabel('Họ và tên', { exact: true })).toHaveValue('Trần Gia Bảo');
  await logout(page);
  await login(page, 'minhanh', '/tutors/quoc-bao');
  await expect(page.getByRole('heading', { name: 'Trần Gia Bảo', exact: true })).toBeVisible();
});

test('BUG-007 tutor geography and public profile agree without rewriting request origins', async ({ page }) => {
  await login(page, 'giabao', '/tutor/profile');
  await expect(page.getByLabel('Khu vực dạy', { exact: true })).toHaveValue('Thủ Đức');
  await page.goto('/tutor/dashboard');
  await expect(page.locator('#tutor-profile-summary')).toContainText('Thủ Đức');
  await expect(page.locator('#tutor-profile-summary')).not.toContainText('Hà Nội');
});

test('BUG-008 functional tutor fees use session units and keep existing amounts', async ({ page }) => {
  await login(page, 'giabao', '/tutor/dashboard');
  await expect(page.locator('#tutor-profile-summary')).toContainText('220.000đ / buổi');
  await expect(page.locator('main')).not.toContainText('/giờ');
  const requestFee = demoReferenceData.requests.find((r) => r.id === 'req-1').sessionFee;
  await expect(page.locator('.reference-request').first()).toContainText(`${requestFee.toLocaleString('vi-VN')}đ / buổi`);
  await page.goto('/tutor/find-students');
  await expect(page.getByRole('group', { name: /Khoảng học phí/ })).toContainText('VNĐ / buổi');
  await expect(page.getByRole('slider', { name: 'Học phí tối thiểu' })).toHaveAttribute('aria-valuetext', /mỗi buổi/);
});

test('BUG-003 tutor sees learner cancellation as cancelled rather than rejected', async ({ page }) => {
  await login(page, 'minhanh', '/requests/demo-01');
  await page.getByRole('button', { name: 'Hủy yêu cầu' }).click();
  // demo-01 belongs to another public Tutor; use the canonical Tutor's request flow.
  await page.goto('/tutors/quoc-bao');
  await page.getByRole('button', { name: 'ĐẶT LỊCH HỌC' }).click();
  await page.locator('#profile-subjects').getByRole('button', { name: 'Tiếng Anh', exact: true }).click();
  await page.locator('#profile-subjects').getByRole('button', { name: 'THCS', exact: true }).click();
  await page.getByRole('region', { name: 'Lịch rảnh của Trần Gia Bảo' }).getByRole('button').first().click();
  await page.locator('#profile-location').getByRole('button', { name: 'Online', exact: true }).click();
  await page.getByLabel(/Mong muốn học tập/).fill(demoReferenceData.requests[0].goal);
  await page.getByRole('button', { name: 'Gửi yêu cầu học', exact: true }).click();
  await expect(page).toHaveURL(/\/requests\/[^/]+$/);
  const id = new URL(page.url()).pathname.split('/').at(-1);
  await page.getByRole('button', { name: 'Hủy yêu cầu' }).click();
  await logout(page);
  await login(page, 'giabao', `/tutor/requests/${id}`);
  await expect(page.locator('main .badge')).toHaveText('Đã hủy');
  await expect(page.locator('main .badge')).toHaveClass(/badge--danger/);
  await expect(page.getByRole('button', { name: 'Chấp nhận và tạo lớp', exact: true })).toHaveCount(0);
  await page.goto('/tutor/requests');
  await expect(page.locator(`a[href="/tutor/requests/${id}"]`)).toContainText('Đã hủy');
});

test('BUG-009 dashboard pending total matches the same tutor inbox after decision', async ({ page }) => {
  await login(page, 'giabao', '/tutor/requests');
  await page.getByRole('button', { name: 'Chờ phản hồi', exact: true }).click();
  const count = await page.evaluate(() => JSON.parse(localStorage.getItem('tnm.demo.domain.v1')).requests.filter((item) => item.tutorId === 'quoc-bao' && item.status === 'pending').length);
  expect(count).toBeGreaterThan(3);
  await page.goto('/tutor/dashboard');
  await expect(page.getByRole('heading', { name: `Yêu cầu học mới (${count})` })).toBeVisible();
  await expect(page.locator('.reference-stat').filter({ hasText: 'Yêu cầu học mới' }).locator('strong')).toHaveText(String(count));
  await page.goto('/tutor/requests/req-1');
  await page.getByRole('button', { name: 'Từ chối', exact: true }).click();
  await page.goto('/tutor/dashboard');
  await expect(page.getByRole('heading', { name: `Yêu cầu học mới (${count - 1})` })).toBeVisible();
});

test('BUG-010 learner cannot select past-week sessions', async ({ page }) => {
  await login(page, 'minhanh', '/tutors/mai-anh');
  await page.getByRole('button', { name: 'Tuần trước', exact: true }).click();
  await expect(page.locator('#profile-calendar-overview .profile-session-table button:enabled')).toHaveCount(0);
  await page.getByRole('button', { name: 'Trở về hiện tại' }).click();
  await page.getByRole('button', { name: 'ĐẶT LỊCH HỌC' }).click();
  expect(await page.locator('#profile-calendar .profile-session-table button:enabled').count()).toBeGreaterThan(0);
});

test('BUG-012 tutor edits propagate to learner profile and search', async ({ page }) => {
  const source = demoReferenceData.tutorProfiles.find((t) => t.id === 'mai-anh');
  await login(page, 'minhanh', '/tutors/quoc-bao');
  await page.getByRole('button', { name: 'Lưu hồ sơ', exact: true }).click();
  await logout(page);
  await login(page, 'giabao', '/tutor/profile');
  await page.getByLabel('Họ và tên', { exact: true }).fill(source.name);
  for (const name of source.subjects) {
    await page.getByLabel('Tìm chuyên môn').fill(name);
    await page.locator('.profile-subjects__options').getByRole('option').filter({ has: page.getByText(name, { exact: true }) }).first().click();
  }
  await page.locator('.profile-subject-level').filter({ has: page.getByRole('heading', { name: 'Toán', exact: true }) }).getByLabel('THPT', { exact: true }).check();
  await page.getByLabel('Khu vực dạy', { exact: true }).fill(source.location);
  await page.getByLabel('Mức phí mỗi buổi', { exact: true }).fill(String(source.price));
  await page.getByLabel('Thời gian dạy cho một buổi').selectOption('90');
  await page.getByLabel('Giới thiệu cách dạy').fill(source.intro);
  await page.getByRole('button', { name: 'Lưu hồ sơ', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Đã lưu hồ sơ');
  await logout(page);
  await login(page, 'minhanh', '/tutors/quoc-bao');
  await expect(page.getByRole('heading', { name: source.name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'ĐẶT LỊCH HỌC' }).click();
  await expect(page.locator('#profile-subjects').getByRole('button', { name: 'Toán', exact: true })).toBeVisible();
  await expect(page.locator('#profile-subjects').getByRole('button', { name: 'THCS', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Đóng cửa sổ đặt lịch' }).click();
  await expect(page.locator('#profile-location')).toContainText(source.location);
  await expect(page.getByRole('region', { name: 'Học phí và liên hệ' })).toContainText('180.000');
  await expect(page.locator('main')).toContainText('90 phút gợi ý');
  await expect(page.locator('main')).toContainText(source.intro);
  await page.goto('/learner/search');
  await expect(page.locator('a[href="/tutors/quoc-bao"]').first()).toBeVisible();
  await page.reload();
  await page.goto('/tutors/quoc-bao');
  await expect(page.getByRole('heading', { name: source.name, exact: true })).toBeVisible();
});

test('BUG-014 pending lesson has notes but no Complete action', async ({ page }) => {
  await login(page, 'giabao', '/tutor/timetable');
  await page.getByRole('button', { name: /Vật lý.*H.N/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Chi tiết lớp học' });
  await expect(dialog).toContainText('Chờ xác nhận');
  await expect(dialog.getByRole('button', { name: 'Đánh dấu hoàn tất' })).toHaveCount(0);
  await expect(dialog.getByLabel('Ghi chú cho lớp học')).toBeVisible();
});

for (const [subject, learner] of [['Toán', 'N.M.A'], ['Tiếng Anh','P.K']]) {
  test(`BUG-014 eligible ${learner} lesson completes saves notes and becomes muted`, async ({ page }) => {
    await login(page, 'giabao', '/tutor/timetable');
    await page.getByRole('button', { name: new RegExp(`${subject}.*${learner}`) }).click();
    const dialog = page.getByRole('dialog', { name: 'Chi tiết lớp học' });
    await dialog.getByLabel('Ghi chú cho lớp học').fill(demoReferenceData.requests[0].goal);
    await dialog.getByRole('button', { name: 'Đánh dấu hoàn tất' }).click();
    await expect(dialog).toContainText('Hoàn tất');
    await expect(dialog.getByRole('button', { name: 'Đánh dấu hoàn tất' })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    const block = page.locator('.weekly-timeline-block.lesson').filter({ has: page.getByRole('button', { name: new RegExp(`${subject}.*${learner}`) }) });
    await expect(block).toHaveClass(/is-completed/);
    await expect(block).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: new RegExp(`${subject}.*${learner}`) }).click();
    await expect(page.getByLabel('Ghi chú cho lớp học')).toHaveValue(demoReferenceData.requests[0].goal);
  });
}
