import { test, expect } from '@playwright/test';
import { login, resetDemo } from './demoHelpers.js';
import { demoReferenceData } from '../../src/data/demoReferenceData.js';

test('Tutor sidebar Income shows derived October summary, six-month values and exact eligible details', async ({ page }) => {
  await resetDemo(page);
  await login(page, 'giabao', '/tutor/dashboard');
  await expect(page.locator('#tutor-income')).toContainText('660.000đ');
  await expect(page.locator('#tutor-income')).toContainText('Tháng 10/2026');
  await page.getByRole('link', { name: 'Thu nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/tutor\/income$/);
  await expect(page.getByRole('heading', { name: 'Thu nhập', exact: true })).toBeVisible();
  const summary = page.getByLabel('Tổng quan thu nhập tháng hiện tại');
  await expect(summary).toContainText('660.000đ');
  await expect(summary).toContainText('Tiếng Anh');
  await expect(summary).toContainText('440.000đ · 2 buổi');
  await expect(summary.locator('section').nth(1).getByText('3', { exact: true })).toBeVisible();
  const values = page.getByLabel('Giá trị thu nhập theo tháng').getByRole('listitem');
  await expect(values).toHaveCount(6);
  for (const [index, month, amount, tone] of [
    [0, '05/2026', '180.000đ', 'minimum'], [1, '06/2026', '360.000đ', 'normal'],
    [2, '07/2026', '400.000đ', 'normal'], [3, '08/2026', '620.000đ', 'normal'],
    [4, '09/2026', '880.000đ', 'maximum'], [5, '10/2026', '660.000đ', 'normal'],
  ]) {
    await expect(values.nth(index)).toHaveAccessibleName(new RegExp(`${month}: ${amount}`));
    await expect(values.nth(index)).toHaveAttribute('data-tone', tone);
  }
  const rows = page.getByRole('table').locator('tbody tr');
  await expect(rows).toHaveCount(3);
  await expect(rows).toHaveText([
    '03/10/2026Ngọc LanTiếng Anh09:00–09:45220.000đ',
    '02/10/2026Học sinh THPTIELTS19:00–19:45220.000đ',
    '01/10/2026Nguyễn Minh AnhTiếng Anh18:00–18:45220.000đ',
  ]);
  await page.goto('/tutor/dashboard');
  await page.locator('#tutor-income').getByRole('link', { name: 'Xem thêm' }).click();
  await expect(page).toHaveURL(/\/tutor\/income$/);
});

test('Income route preserves auth redirect', async ({ page }) => {
  await resetDemo(page);
  await page.goto('/tutor/income');
  await expect(page).toHaveURL(/\/login\?redirect=/);
  await login(page, 'giabao', '/tutor/income');
  await expect(page.getByRole('heading', { name: 'Thu nhập', exact: true })).toBeVisible();
});

test('Income empty state has zero values with normal chart tones for an account without Lessons', async ({ page }) => {
  await resetDemo(page, { user: { ...demoReferenceData.accounts[1], id: 'income-isolation-tutor' } });
  await page.goto('/tutor/income');
  await expect(page.getByRole('heading', { name: 'Chưa có thu nhập trong tháng này' })).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
  const values = page.getByLabel('Giá trị thu nhập theo tháng').getByRole('listitem');
  await expect(values).toHaveCount(6);
  for (const value of await values.all()) { await expect(value).toContainText('0đ'); await expect(value).toHaveAttribute('data-tone', 'normal'); }
});

test('Income tied extrema receive their semantic state', async ({ page }) => {
  const lessons = demoReferenceData.historicalLessons.map((lesson) => ({ ...lesson, sessionFee: 0 }));
  lessons.find((lesson) => lesson.date.startsWith('2026-05')).sessionFee = 100000;
  lessons.find((lesson) => lesson.date.startsWith('2026-06')).sessionFee = 100000;
  await resetDemo(page, { lessons });
  await login(page, 'giabao', '/tutor/income');
  const values = page.getByLabel('Giá trị thu nhập theo tháng').getByRole('listitem');
  await expect(values.nth(0)).toHaveAttribute('data-tone', 'maximum');
  await expect(values.nth(1)).toHaveAttribute('data-tone', 'maximum');
  for (const index of [2, 3, 4, 5]) await expect(values.nth(index)).toHaveAttribute('data-tone', 'minimum');
});

test('INCOME-001 accepting and completing a Request uses its snapshot fee in both Income and Dashboard', async ({ page }) => {
  await resetDemo(page);
  await login(page, 'giabao', '/tutor/requests/req-2');
  await page.getByRole('button', { name: 'Nhận yêu cầu', exact: true }).click();
  await page.goto('/tutor/timetable');
  await page.getByRole('button', { name: /Vật lý lớp 10.*Nguyễn Khánh Linh/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Đánh dấu hoàn tất' }).click();
  await page.goto('/tutor/income');
  await expect(page.getByLabel('Tổng quan thu nhập tháng hiện tại')).toContainText('860.000đ');
  await expect(page.getByRole('table')).toContainText('Nguyễn Khánh Linh');
  await page.reload();
  await expect(page.getByLabel('Tổng quan thu nhập tháng hiện tại')).toContainText('860.000đ');
  await page.goto('/tutor/dashboard');
  await expect(page.locator('#tutor-income')).toContainText('860.000đ');
});
