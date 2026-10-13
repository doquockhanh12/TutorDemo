import { expect, test } from '@playwright/test';
import { login, logout, resetDemo } from './demoHelpers.js';
import { demoReferenceData } from '../../src/data/demoReferenceData.js';

test.beforeEach(async ({ page }) => resetDemo(page));

test('BUG-001 learner-created request appears for the canonical tutor and decision returns to learner', async ({ page }) => {
  await login(page, 'minhanh', '/tutors/quoc-bao');
  await page.locator('#profile-subjects').getByRole('button', { name: 'Tiếng Anh', exact: true }).click();
  await page.locator('#profile-subjects').getByRole('button', { name: 'THCS', exact: true }).click();
  await page.getByRole('region', { name: 'Lịch rảnh của Trần Gia Bảo' }).getByRole('button').first().click();
  await page.locator('#profile-location').getByRole('button', { name: 'Online', exact: true }).click();
  await page.locator('#profile-location').getByRole('button', { name: 'Thủ Đức', exact: true }).click();
  await page.getByLabel('Mong muốn học tập *').fill('Luyện giao tiếp');
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
  await page.getByRole('button', { name: 'Nhận yêu cầu', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Đã nhận');
  await page.goto('/tutor/timetable');
  await expect(page.getByRole('button', { name: /Tiếng Anh.*Nguyễn Minh Anh/ })).toHaveCount(0);
  await logout(page);
  await login(page, 'minhanh', `/requests/${requestId}`);
  await expect(page.locator('main')).toContainText('Gia sư đã nhận');
  await page.getByRole('button', { name: 'Xác nhận lịch học', exact: true }).click();
  await expect(page.locator('main')).toContainText('Lịch đã xác nhận');
  await page.goto('/learner/schedule');
  await expect(page.getByRole('heading', { name: 'Lịch học của bạn' })).toBeVisible();
  const confirmed = await page.evaluate((id) => JSON.parse(localStorage.getItem('tnm.demo.domain.v1')).requests.find((request) => request.id === id), requestId);
  const confirmedDate = await page.evaluate((value) => new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`)), confirmed.confirmedDate);
  const scheduledLesson = page.locator('.learner-schedule-item').filter({ hasText: confirmedDate }).filter({ hasText: `${confirmed.confirmedStartTime}–18:45` });
  await expect(scheduledLesson).toHaveCount(1);
  await logout(page);
  await login(page, 'giabao', '/tutor/timetable');
  await expect(page.getByRole('button', { name: /Tiếng Anh.*Nguyễn Minh Anh/ }).first()).toBeVisible();
  await logout(page);
  await login(page, 'minhanh', `/requests/${requestId}`);
  await page.getByRole('button', { name: 'Hủy yêu cầu', exact: true }).click();
  await expect(page.locator('main .badge').filter({ hasText: 'Đã hủy' })).toBeVisible();
  const confirmedRequest = await page.evaluate((id) => JSON.parse(localStorage.getItem('tnm.demo.domain.v1')).requests.find((request) => request.id === id), requestId);
  expect(confirmedRequest.status).toBe('cancelled');
  expect(confirmedRequest.confirmedDate).toBeTruthy();
  await logout(page);
  await login(page, 'giabao', '/tutor/timetable');
  await expect(page.getByRole('button', { name: /Tiếng Anh.*Nguyễn Minh Anh/ })).toHaveCount(0);
});

test('Learner demo-03 completion stays consistent across request list, detail, and dated Lesson history', async ({ page }) => {
  await login(page, 'minhanh', '/requests');
  await page.getByRole('button', { name: 'Hoàn tất', exact: true }).click();
  const completedRequest = page.locator('a[href="/requests/demo-03"]');
  await expect(completedRequest).toContainText('Hoàn tất');
  await expect(completedRequest).not.toContainText('Gia sư đã nhận');
  await completedRequest.click();
  await expect(page.locator('main')).toContainText('Thứ 5, 08/10 · 19:00–19:45');
  await page.goto('/learner/schedule');
  const history = page.locator('.learner-schedule-section').nth(1);
  await expect(history).toContainText('Ngữ văn');
  await expect(history).toContainText('8 tháng 10');
  await expect(history).toContainText('19:00–19:45');
  await expect(history).toContainText('Tiếng Anh');
  await expect(history).toContainText('6 tháng 6');
});

test('Learner can confirm the accepted demo-02 proposal and see its Lesson in upcoming schedule', async ({ page }) => {
  await login(page, 'minhanh', '/requests/demo-02');
  await expect(page.getByRole('radio', { name: /09:00–09:45/ })).toBeVisible();
  await page.getByRole('button', { name: 'Xác nhận lịch học', exact: true }).click();
  await expect(page.locator('main')).toContainText('Lịch học đã được chốt chính thức thành công');
  const confirmed = await page.evaluate(() => JSON.parse(localStorage.getItem('tnm.demo.domain.v1')).requests.find((request) => request.id === 'demo-02'));
  expect(confirmed.status).toBe('confirmed');
  expect(confirmed.confirmedDate).toBeTruthy();
  expect(confirmed.confirmedStartTime).toBe('09:00');
  await page.goto('/learner/schedule');
  const upcoming = page.locator('.learner-schedule-section').first();
  await expect(upcoming).toContainText('Tiếng Anh');
  await expect(upcoming).toContainText('09:00–09:45');
  await expect(page.locator('.learner-schedule-item__link')).toHaveCount(0);
});

test('BUG-002 learner cannot complete an accepted request', async ({ page }) => {
  await login(page, 'minhanh', '/requests/demo-02');
  await expect(page.getByRole('heading', { name: 'Tiếng Anh với Trần Gia Bảo' })).toBeVisible();
  await expect(page.locator('main')).toContainText('Gia sư đã nhận');
  await expect(page.getByRole('button', { name: 'Đánh dấu đã học xong' })).toHaveCount(0);
});

test('BUG-013 missing legacy request areas do not imply an online lesson', async ({ page }) => {
  await login(page, 'minhanh', '/requests/demo-02');
  await expect(page.locator('main')).toContainText('Tại nhà');
  await expect(page.locator('main')).toContainText('Chưa có khu vực được gửi');
  await expect(page.locator('main')).not.toContainText('Không yêu cầu khu vực — học online');
});

test('BUG-003 learner filters use canonical states with separate completed lesson presentation', async ({ page }) => {
  await login(page, 'minhanh', '/requests');
  await page.getByRole('button', { name: 'Chờ phản hồi', exact: true }).click();
  await expect(page.locator('a[href="/requests/demo-01"]')).toBeVisible();
  await expect(page.locator('a[href="/requests/demo-02"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Hoàn tất', exact: true }).click();
  await expect(page.locator('a[href="/requests/demo-03"]')).toBeVisible();
  const statuses = await page.evaluate(() => JSON.parse(localStorage.getItem('tnm.demo.domain.v1')).requests.map((r) => r.status));
  expect(statuses.every((s) => ['pending','accepted','confirmed','rejected','cancelled'].includes(s))).toBe(true);
});

test('BUG-004 learner request badges expose distinct semantic tones', async ({ page }) => {
  await login(page, 'minhanh', '/requests/demo-01');
  await expect(page.locator('main .badge').filter({ hasText: 'Chờ phản hồi' })).toHaveClass(/badge--warning/);
  await page.getByRole('button', { name: 'Hủy yêu cầu', exact: true }).click();
  await expect(page.locator('main .badge').filter({ hasText: 'Đã hủy' })).toHaveClass(/badge--danger/);
  await page.goto('/requests/demo-02');
  await expect(page.locator('main .badge').filter({ hasText: 'Gia sư đã nhận' })).toHaveClass(/badge--info/);
  await page.goto('/requests/demo-03');
  await expect(page.locator('main .badge').filter({ hasText: 'Hoàn tất' })).toHaveClass(/badge--info/);
});

for (const [decision, button, label, tone] of [['rejected','Từ chối','Đã từ chối','flow-error'], ['accepted','Nhận yêu cầu','Đã nhận','flow-success']]) {
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
  await page.getByRole('button', { name: 'Hủy yêu cầu', exact: true }).click();
  // demo-01 belongs to another public Tutor; use the canonical Tutor's request flow.
  await page.goto('/tutors/quoc-bao');
  await page.locator('#profile-subjects').getByRole('button', { name: 'Tiếng Anh', exact: true }).click();
  await page.locator('#profile-subjects').getByRole('button', { name: 'THCS', exact: true }).click();
  await page.getByRole('region', { name: 'Lịch rảnh của Trần Gia Bảo' }).getByRole('button').first().click();
  await page.locator('#profile-location').getByRole('button', { name: 'Online', exact: true }).click();
  await page.locator('#profile-location').getByRole('button', { name: 'Thủ Đức', exact: true }).click();
  await page.getByLabel('Mong muốn học tập *').fill(demoReferenceData.requests[0].goal);
  await page.getByRole('button', { name: 'Gửi yêu cầu học', exact: true }).click();
  await expect(page).toHaveURL(/\/requests\/[^/]+$/);
  const id = new URL(page.url()).pathname.split('/').at(-1);
  await page.getByRole('button', { name: 'Hủy yêu cầu', exact: true }).click();
  await logout(page);
  await login(page, 'giabao', `/tutor/requests/${id}`);
  await expect(page.locator('main .badge')).toHaveText('Đã hủy');
  await expect(page.locator('main .badge')).toHaveClass(/badge--danger/);
  await expect(page.getByRole('button', { name: 'Nhận yêu cầu', exact: true })).toHaveCount(0);
  await page.goto('/tutor/requests');
  await expect(page.locator(`a[href="/tutor/requests/${id}"]`)).toContainText('Đã hủy');
});

test('BUG-009 dashboard pending total matches the same tutor inbox after decision', async ({ page }) => {
  await login(page, 'giabao', '/tutor/requests');
  await page.getByRole('button', { name: 'Chờ phản hồi', exact: true }).click();
  const count = await page.locator('.flow-row').count();
  expect(count).toBeGreaterThan(3);
  await page.goto('/tutor/dashboard');
  await expect(page.getByRole('heading', { name: `Yêu cầu học mới (${count})` })).toBeVisible();
  await expect(page.locator('.reference-stat').filter({ hasText: 'Yêu cầu học mới' }).locator('strong')).toHaveText(String(count));
  await page.goto('/tutor/requests/req-1');
  await page.getByRole('button', { name: 'Từ chối', exact: true }).click();
  await page.goto('/tutor/dashboard');
  await expect(page.getByRole('heading', { name: `Yêu cầu học mới (${count - 1})` })).toBeVisible();
});

test('BUG-010 learner cannot select past-week or ended-today sessions', async ({ page }) => {
  await login(page, 'minhanh', '/tutors/mai-anh');
  await page.getByRole('button', { name: 'Tuần trước', exact: true }).click();
  expect(await page.locator('.profile-session-table button').count()).toBeGreaterThan(0);
  await expect(page.locator('.profile-session-table button:enabled')).toHaveCount(0);
  await page.getByRole('button', { name: 'Trở về hiện tại' }).click();
  expect(await page.locator('.profile-session-table button:enabled').count()).toBeGreaterThan(0);
  await page.clock.setSystemTime(new Date('2026-10-06T19:00:00+07:00'));
  await page.goto('/tutors/quoc-bao');
  await expect(page.getByRole('button', { name: /06\/10 · 18:00–18:45/ })).toBeDisabled();
});

test('BUG-012 tutor edits propagate to learner profile search and saved dashboard', async ({ page }) => {
  const source = demoReferenceData.tutorProfiles.find((t) => t.id === 'mai-anh');
  await login(page, 'minhanh', '/tutors/quoc-bao');
  await page.getByRole('button', { name: 'Lưu hồ sơ', exact: true }).click();
  await logout(page);
  await login(page, 'giabao', '/tutor/profile');
  await page.getByLabel('Họ và tên', { exact: true }).fill(source.name);
  await page.getByLabel('Môn có thể dạy', { exact: true }).fill(source.subjects.join(', '));
  await page.getByLabel('THCS', { exact: true }).uncheck();
  await page.getByLabel('THPT', { exact: true }).check();
  await page.getByLabel('Khu vực dạy', { exact: true }).fill(source.location);
  await page.getByLabel('Mức phí mỗi buổi', { exact: true }).fill(String(source.price));
  await page.getByLabel('Thời gian dạy cho một buổi').selectOption('90');
  await page.getByLabel('Giới thiệu cách dạy').fill(source.intro);
  await page.getByRole('button', { name: 'Lưu hồ sơ demo' }).click();
  await expect(page.getByRole('status')).toContainText('Đã lưu hồ sơ');
  await logout(page);
  await login(page, 'minhanh', '/tutors/quoc-bao');
  await expect(page.getByRole('heading', { name: source.name, exact: true })).toBeVisible();
  await expect(page.locator('#profile-subjects').getByRole('button', { name: 'Toán', exact: true })).toBeVisible();
  await expect(page.locator('#profile-subjects').getByRole('button', { name: 'THCS', exact: true })).toHaveCount(0);
  await expect(page.locator('#profile-location')).toContainText(source.location);
  await expect(page.locator('.profile-identity__action')).toContainText('180.000');
  await expect(page.locator('.profile-identity__action')).toContainText('90 phút / buổi');
  await expect(page.locator('.profile-section').first()).toContainText(source.intro);
  await page.goto('/learner/dashboard');
  await expect(page.locator('#saved-tutors a[href="/tutors/quoc-bao"]')).toContainText(source.name);
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
