import { test, expect } from '@playwright/test';
import { resetDemo, login } from './demoHelpers.js';
import { createDemoState } from '../../src/features/domain/demoDomain.js';
import { proposedLessons } from '../../src/data/tutorSchedule.js';

test('unread message filter combines search and keeps sidebar count in sync', async ({ page }) => {
  await resetDemo(page);
  await login(page, 'giabao', '/tutor/messages');
  const navigation = page.getByRole('navigation', { name: 'Các mục của gia sư' });
  await expect(navigation.getByRole('link', { name: /Tin nhắn/ })).toContainText('3');
  await page.getByRole('button', { name: /Xem hội thoại chưa đọc/ }).click();
  await expect(page.getByRole('button', { name: /Chưa đọc/ }).first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.messages-conversation')).toHaveCount(2);
  await page.getByPlaceholder('Tìm học viên...').fill('Minh Anh');
  await expect(page.locator('.messages-conversation')).toHaveCount(1);
  await page.locator('.messages-conversation').click();
  await expect(navigation.getByRole('link', { name: /Tin nhắn/ })).toContainText('1');
  await page.getByRole('button', { name: 'Tất cả' }).click();
  await expect(page.locator('.messages-conversation')).toHaveCount(1);
  await page.getByPlaceholder('Tìm học viên...').fill('');
  await expect(page.locator('.messages-conversation')).toHaveCount(4);
});

test('class detail missing state has a working return link', async ({ page }) => {
  await resetDemo(page);
  await login(page, 'giabao', '/tutor/classes/missing-id');
  await expect(page.getByRole('heading', { name: 'Không tìm thấy lớp học' })).toBeVisible();
  await page.getByRole('link', { name: /Quay lại Quản lý lớp học/ }).click();
  await expect(page).toHaveURL(/\/tutor\/classes$/);
});

test('tutor can enter minute precision and adjacent availability merges on the calendar', async ({ page }) => {
  await resetDemo(page);
  await login(page, 'giabao', '/tutor/timetable');
  await page.getByRole('button', { name: 'Tuần sau' }).click();
  const add = page.getByRole('button', { name: 'Thêm lịch rảnh Thứ 2' });
  await add.click();
  await page.getByRole('textbox', { name: 'Giờ bắt đầu theo định dạng 24 giờ' }).fill('08:00');
  await page.getByRole('textbox', { name: 'Giờ kết thúc theo định dạng 24 giờ' }).fill('09:15');
  await page.screenshot({ path: 'test-results/tutor-flexible-time-dialog.png' });
  await page.getByRole('button', { name: 'Thêm vào lịch nháp' }).click();
  await add.click();
  await page.getByRole('textbox', { name: 'Giờ bắt đầu theo định dạng 24 giờ' }).fill('09:15');
  await page.getByRole('textbox', { name: 'Giờ kết thúc theo định dạng 24 giờ' }).fill('10:30');
  await page.getByRole('button', { name: 'Thêm vào lịch nháp' }).click();
  await expect(page.locator('.weekly-timeline-block.availability')).toHaveCount(1);
  await expect(page.locator('.weekly-timeline-block.availability')).toContainText('08:00');
  await expect(page.locator('.weekly-timeline-block.availability')).toContainText('10:30');
  await page.getByRole('button', { name: 'Lưu lịch' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã lưu lịch rảnh trong trình duyệt' })).toBeVisible();
  await add.click();
  await page.getByRole('textbox', { name: 'Giờ bắt đầu theo định dạng 24 giờ' }).fill('23:15');
  await page.getByRole('textbox', { name: 'Giờ kết thúc theo định dạng 24 giờ' }).fill('24:00');
  await page.getByRole('button', { name: 'Thêm vào lịch nháp' }).click();
  await expect(page.locator('.weekly-timeline-block.availability')).toHaveCount(2);
});

test('learner can propose a custom interval within actual tutor availability', async ({ page }) => {
  await resetDemo(page);
  await login(page, 'minhanh', '/tutors/quoc-bao');
  await page.getByRole('button', { name: 'ĐẶT LỊCH HỌC' }).click();
  await page.locator('#profile-subjects').getByRole('button', { name: 'Tiếng Anh', exact: true }).click();
  await page.locator('#profile-subjects').getByRole('button', { name: 'THCS', exact: true }).click();
  const custom = page.locator('.profile-custom-time');
  await custom.getByLabel('Ngày').selectOption('2026-10-06');
  await custom.getByLabel('Bắt đầu').fill('18:15');
  await custom.getByLabel('Kết thúc').fill('19:30');
  await page.screenshot({ path: 'test-results/learner-custom-time.png' });
  await custom.getByRole('button', { name: 'Thêm giờ đề xuất' }).click();
  await expect(page.locator('.profile-schedule-feedback')).toContainText('18:15–19:30');
  await page.locator('#profile-location').getByRole('button', { name: 'Online', exact: true }).click();
  await page.getByRole('button', { name: 'Gửi yêu cầu học', exact: true }).click();
  await expect(page).toHaveURL(/\/requests\/[^/]+$/);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('tnm.demo.domain.v1')).requests.at(-1).proposals);
  expect(saved).toMatchObject([{ date: '2026-10-06', start: 1095, end: 1170 }]);
});

test('class detail remains readable on mobile in both themes', async ({ page }) => {
  const state = createDemoState(new Date('2026-10-05T06:00:00+07:00'));
  const request = state.requests.find((item) => item.id === 'req-2');
  request.status = 'accepted';
  state.lessons.push(...proposedLessons(request));
  await resetDemo(page, { state });
  await page.setViewportSize({ width: 1024, height: 768 });
  await login(page, 'giabao', '/tutor/classes/req-2');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { name: 'Chi tiết lớp học' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: 'test-results/tutor-class-detail-mobile-light.png', fullPage: true });
  await page.evaluate(() => localStorage.setItem('theme', 'dark'));
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: 'test-results/tutor-class-detail-mobile-dark.png', fullPage: true });
});
