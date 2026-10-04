import { test, expect } from '@playwright/test';
import { login, resetDemo } from './demoHelpers.js';

test.beforeEach(async ({ page }) => resetDemo(page));

test('SCHED-001 availability Save and Cancel isolate drafts and persist saved duration', async ({ page }) => {
  await login(page, 'giabao', '/tutor/timetable');
  await page.getByLabel('Thời lượng mỗi buổi').selectOption('90');
  await page.getByRole('button', { name: 'Thêm lịch rảnh Thứ 2', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Thêm lịch rảnh' });
  await dialog.getByLabel('Giờ bắt đầu theo định dạng 24 giờ').fill('08:00');
  await dialog.getByRole('button', { name: 'Thêm vào lịch nháp' }).click();
  await expect(page.getByRole('button', { name: /Lịch rảnh 2026-10-05 08:00–09:30/ })).toBeVisible();
  await page.getByRole('button', { name: 'Hủy thay đổi' }).click();
  await expect(page.getByRole('button', { name: /Lịch rảnh 2026-10-05 08:00–09:30/ })).toHaveCount(0);
  await expect(page.getByLabel('Thời lượng mỗi buổi')).toHaveValue('45');
  await page.getByLabel('Thời lượng mỗi buổi').selectOption('90');
  await page.getByRole('button', { name: 'Thêm lịch rảnh Thứ 2', exact: true }).click();
  await page.getByLabel('Giờ bắt đầu theo định dạng 24 giờ').fill('08:00');
  await page.getByRole('button', { name: 'Thêm vào lịch nháp' }).click();
  await page.getByRole('button', { name: 'Lưu lịch', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã lưu lịch rảnh' })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Thời lượng mỗi buổi')).toHaveValue('90');
  await expect(page.getByRole('button', { name: /Lịch rảnh 2026-10-05 08:00–09:30/ })).toBeVisible();
});

test('SCHED-002 conflict with a booked lesson is rejected while retaining the draft dialog', async ({ page }) => {
  await login(page, 'giabao', '/tutor/timetable');
  await page.getByRole('button', { name: 'Thêm lịch rảnh Thứ 3', exact: true }).click();
  await page.getByLabel('Giờ bắt đầu theo định dạng 24 giờ').fill('07:00');
  await page.getByRole('button', { name: 'Thêm vào lịch nháp' }).click();
  await expect(page.getByRole('dialog', { name: 'Thêm lịch rảnh' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('trùng lịch');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
