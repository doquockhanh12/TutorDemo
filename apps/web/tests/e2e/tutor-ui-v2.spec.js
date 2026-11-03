import { test, expect } from '@playwright/test';
import { resetDemo, login, logout, fixedTime } from './demoHelpers.js';
import { createDemoState } from '../../src/features/domain/demoDomain.js';

test('Tutor topbar follows each route while the dashboard keeps its greeting', async ({ page }) => {
  await resetDemo(page);
  await login(page, 'giabao', '/tutor/dashboard');
  await expect(page.locator('.tutor-header__title')).toHaveText('Tìm lớp gần tôi');
  await expect(page.locator('.tutor-header__nav svg')).toHaveCount(0);
  const topbarHeight = await page.locator('.tutor-topbar').evaluate((element) => element.getBoundingClientRect().height);
  await expect(page.getByRole('heading', { name: /Xin chào/ })).toBeVisible();
  for (const [route, title] of [
    ['/tutor/map', 'Tìm lớp gần tôi'],
    ['/tutor/requests', 'Yêu cầu học'], ['/tutor/requests/req-2', 'Chi tiết yêu cầu'],
    ['/tutor/timetable', 'Lịch dạy học'], ['/tutor/classes', 'Quản lý lớp học'],
    ['/tutor/classes/missing', 'Chi tiết lớp học'], ['/tutor/find-students', 'Lọc yêu cầu học'],
    ['/tutor/income', 'Thu nhập'], ['/tutor/wallet', 'Ví gia sư'],
    ['/tutor/profile', 'Hồ sơ gia sư'], ['/tutor/reviews', 'Đánh giá'],
    ['/tutor/messages', 'Tin nhắn'], ['/tutor/settings', 'Cài đặt'],
  ]) {
    await page.goto(route);
    await expect(page.locator('.tutor-header__title')).toHaveText(title);
    await expect(page.locator('.tutor-header__nav svg')).toHaveCount(0);
    expect(await page.locator('.tutor-topbar').evaluate((element) => element.getBoundingClientRect().height)).toBe(topbarHeight);
    await expect(page.locator('.tutor-page-head')).toHaveCount(0);
    if (route === '/tutor/requests') {
      await expect(page.locator('.flow-tabs button')).toHaveText(['Tất cả', 'Chờ phản hồi', 'Đã nhận', 'Từ chối / Đã hủy']);
    }
  }
  await page.goto('/appeals');
  await expect(page.locator('.tutor-header__title')).toHaveText('Kháng cáo');
  await expect(page.locator('.tutor-header__nav svg')).toHaveCount(0);
});

test('incomplete accepted legacy request keeps its reason and creates no guessed class', async ({ page }) => {
  await resetDemo(page);
  await login(page, 'giabao', '/tutor/requests/demo-02');
  await expect(page.locator('main .badge')).toContainText('Cần kiểm tra lớp');
  await expect(page.getByRole('status')).toContainText('Thiếu hình thức học và ngày, giờ học cụ thể');
  await expect(page.getByRole('button', { name: 'Chấp nhận và tạo lớp' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Xem lớp' })).toHaveCount(0);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('tnm.demo.domain.v1')));
  expect(saved.requests.find((item) => item.id === 'demo-02').legacyAcceptedStatus).toBe('accepted');
  expect(saved.classes.filter((item) => item.requestId === 'demo-02')).toHaveLength(0);
  await page.reload();
  await expect(page.locator('main .badge')).toContainText('Cần kiểm tra lớp');
});

test('Tutor UI V2 keeps one sidebar item and creates a class on tutor acceptance', async ({ page }) => {
  const state = createDemoState(fixedTime);
  state.requests.find((request) => request.id === 'req-2').learnerId = 'demo-learner';
  await resetDemo(page, { state });
  await login(page, 'giabao', '/tutor/requests/req-2');
  await expect(page.getByRole('navigation', { name: 'Các mục của gia sư' }).getByText('Tin nhắn')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Các mục của gia sư' }).getByText('Đánh giá')).toHaveCount(1);
  await page.getByRole('button', { name: 'Chấp nhận và tạo lớp' }).click();
  await expect(page.locator('main .badge').getByText('Đã nhận', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Xem lớp' })).toHaveAttribute('href', '/tutor/classes/req-2');
  await page.goto('/tutor/classes');
  await expect(page.getByRole('link', { name: /Nguyễn Khánh Linh/ })).toBeVisible();
  await logout(page);
  await login(page, 'minhanh', '/requests/req-2');
  await expect(page.getByText('Đã xác nhận', { exact: true }).first()).toBeVisible();
  await logout(page);
  await login(page, 'giabao', '/tutor/classes');
  await expect(page.getByRole('link', { name: /Nguyễn Khánh Linh/ })).toBeVisible();
  await page.getByRole('link', { name: /Nguyễn Khánh Linh/ }).click();
  await expect(page.getByRole('heading', { name: 'Chi tiết lớp học' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tiến độ học' })).toBeVisible();
  await expect(page.getByText('Tổng số buổi')).toBeVisible();
  await expect(page.getByText('Thời lượng')).toBeVisible();
  await page.screenshot({ path: 'test-results/tutor-v2-class-detail.png' });
  await page.goto('/tutor/wallet');
  await expect(page.getByRole('heading', { name: 'Ví gia sư' })).toBeVisible();
  await page.screenshot({ path: 'test-results/tutor-v2-wallet.png' });
});

test('two requests create two distinct classes, survive refresh and open their own details', async ({ page }) => {
  await resetDemo(page);
  await login(page, 'giabao', '/tutor/requests/req-1');
  await page.getByRole('button', { name: 'Chấp nhận và tạo lớp' }).click();
  await expect(page.getByRole('link', { name: 'Xem lớp' })).toHaveAttribute('href', '/tutor/classes/req-1');
  await page.goto('/tutor/requests/req-2');
  await page.getByRole('button', { name: 'Chấp nhận và tạo lớp' }).click();
  await expect(page.getByRole('link', { name: 'Xem lớp' })).toHaveAttribute('href', '/tutor/classes/req-2');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('tnm.demo.domain.v1')));
  for (const id of ['req-1', 'req-2']) {
    expect(saved.classes.filter((item) => item.requestId === id)).toHaveLength(1);
    expect(saved.requests.find((item) => item.id === id).classId).toBe(id);
  }
  await page.goto('/tutor/classes');
  await expect(page.getByRole('status')).toContainText('2 lớp trong nhóm đang xem');
  await expect(page.getByRole('link', { name: /Phụ huynh bé An/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Nguyễn Khánh Linh/ })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Tìm lớp học' }).fill('Khánh Linh');
  await expect(page.getByRole('status')).toContainText('1 lớp trong nhóm đang xem');
  await expect(page.getByRole('link', { name: /Phụ huynh bé An/ })).toHaveCount(0);
  await page.getByRole('searchbox', { name: 'Tìm lớp học' }).fill('');
  await page.reload();
  for (const [id, learner] of [['req-1', 'Phụ huynh bé An'], ['req-2', 'Nguyễn Khánh Linh']]) {
    await page.locator(`a[href="/tutor/classes/${id}"]`).click();
    await expect(page.locator('.tutor-class-card--overview')).toContainText(learner);
    await page.getByRole('link', { name: /Quay lại Quản lý lớp học/ }).click();
  }
  await page.goto('/tutor/timetable');
  await expect(page.getByRole('button', { name: /Toán lớp 8.*Phụ huynh bé An/ }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Vật lý lớp 10.*Nguyễn Khánh Linh/ }).first()).toBeVisible();
});

test('Tutor profile selects scoped specializations and keeps proposals separate', async ({ page }) => {
  await resetDemo(page);
  await login(page, 'giabao', '/tutor/profile');
  const search = page.getByRole('combobox', { name: 'Tìm chuyên môn' });
  await search.fill('AI');
  await page.locator('#profile-subject-technology-ai').click();
  await search.fill('machine learning');
  await page.getByRole('option', { name: /Machine Learning/ }).click();
  await search.fill('mĩ thuật');
  await expect(page.getByRole('option', { name: /Vẽ \/ Hội họa/ })).toBeVisible();
  await page.locator('.profile-subject-level').filter({ has: page.getByRole('heading', { name: 'Machine Learning' }) }).getByLabel('Sinh viên').check();
  await page.locator('.profile-subject-level').filter({ has: page.getByRole('heading', { name: 'Machine Learning' }) }).getByLabel('Người đi làm').check();
  await search.fill('Thiết kế Canva nâng cao');
  await page.getByRole('button', { name: '+ Đề xuất chuyên môn mới' }).click();
  await page.getByRole('button', { name: 'Gửi đề xuất' }).click();
  await expect(page.getByRole('status')).toContainText('PENDING');
  await expect(page.getByText('Thiết kế Canva nâng cao', { exact: true })).toHaveCount(0);
  const proposed = await page.evaluate(() => ({ requests: JSON.parse(localStorage.getItem('tnm.demo.domain.v1')).subjectRequests, legacy: localStorage.getItem('tnm.subject.requests') }));
  expect(proposed.requests.at(-1)).toMatchObject({ name: 'Thiết kế Canva nâng cao', status: 'PENDING' });
  expect(proposed.legacy).toBeNull();
  await page.getByRole('button', { name: '+ Thêm tài liệu' }).click();
  await page.getByLabel('Tên tài liệu').fill('Chứng chỉ Python');
  await page.getByLabel('File đính kèm').setInputFiles({ name: 'certificate.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 demo') });
  await expect(page.getByRole('link', { name: 'Xem trước certificate.pdf' })).toBeVisible();
  await page.getByRole('button', { name: 'Lưu hồ sơ', exact: true }).click();
  await page.reload();
  await expect(page.locator('.profile-subjects__tags')).toContainText('Machine Learning');
});
