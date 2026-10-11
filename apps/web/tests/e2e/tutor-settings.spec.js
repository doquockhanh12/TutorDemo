import { test, expect } from '@playwright/test';
import { login, resetDemo } from './demoHelpers.js';

test('Tutor settings route, account, theme and controls work across reload', async ({ page }) => {
  await resetDemo(page);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await login(page, 'giabao', '/tutor/profile');
  await page.getByRole('link', { name: 'Cài đặt', exact: true }).click();
  await expect(page).toHaveURL(/\/tutor\/settings$/);
  await expect(page.getByRole('link', { name: 'Cài đặt', exact: true })).toHaveClass(/is-active/);
  await expect(page.getByRole('heading', { name: 'Cài đặt', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/tutor-settings-desktop.png', fullPage: true });
  await expect(page.getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled();
  await page.getByLabel('Ngày sinh').fill('2000-05-12');
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await page.clock.runFor(400);
  await expect(page.getByRole('status')).toContainText('Đã cập nhật thông tin thành công');
  await expect(page.getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled();

  await page.getByRole('button', { name: 'Giao diện', exact: true }).click();
  await page.getByRole('radio', { name: /Tối/ }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('/tutor/dashboard');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.tutor-sidebar')).toHaveCSS('background-color', 'rgb(27, 39, 57)');
  await page.screenshot({ path: 'test-results/tutor-dashboard-dark.png', fullPage: true });
  await page.goto('/tutor/settings');
  await page.screenshot({ path: 'test-results/tutor-settings-dark.png', fullPage: true });
  await expect(page.getByLabel('Ngày sinh')).toHaveValue('2000-05-12');
  await page.getByRole('button', { name: 'Giao diện', exact: true }).click();
  await expect(page.getByRole('radio', { name: /Tối/ })).toBeChecked();
  await page.getByRole('radio', { name: /Sáng/ }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('radio', { name: /Theo hệ thống/ }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.getByRole('button', { name: 'Vị trí & quyền riêng tư' }).click();
  await page.getByRole('slider').fill('3');
  await expect(page.getByText('Bán kính nhận lớp:')).toContainText('15 km');
  await page.getByRole('button', { name: 'Bảo mật' }).click();
  await page.getByLabel('Mật khẩu hiện tại', { exact: true }).fill('demo1234');
  await page.getByLabel('Mật khẩu mới', { exact: true }).fill('short');
  await page.getByLabel('Xác nhận mật khẩu mới', { exact: true }).fill('short');
  await page.getByRole('button', { name: 'Đổi mật khẩu' }).click();
  await expect(page.getByText('Mật khẩu mới cần ít nhất 8 ký tự.')).toBeVisible();
  await page.getByRole('button', { name: 'Tài khoản', exact: true }).click();
  await page.getByRole('button', { name: 'Xóa tài khoản' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Xóa tài khoản' })).toBeDisabled();
  await page.getByLabel('Nhập XOA để xác nhận').fill('XOA');
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Xóa tài khoản' })).toBeEnabled();
  await page.getByRole('dialog').getByRole('button', { name: 'Hủy' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('Tutor teaching settings reuse the canonical profile', async ({ page }) => {
  await resetDemo(page);
  await login(page, 'giabao', '/tutor/settings');
  await page.getByRole('button', { name: 'Thiết lập nhận lớp' }).click();
  await page.getByLabel('Dạy online').uncheck();
  await page.getByRole('button', { name: 'Lưu thiết lập nhận lớp' }).click();
  await page.goto('/tutor/profile');
  await expect(page.getByLabel('Mức phí mỗi buổi')).toBeVisible();
  await page.goto('/tutor/settings');
  await page.getByRole('button', { name: 'Thiết lập nhận lớp' }).click();
  await expect(page.getByLabel('Dạy online')).not.toBeChecked();
});

test('Tutor settings fits mobile viewport and internal navigation remains reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await resetDemo(page);
  await login(page, 'giabao', '/tutor/settings');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.screenshot({ path: 'test-results/tutor-settings-mobile-account.png', fullPage: true });
  await page.getByRole('button', { name: 'Hỗ trợ', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Hỗ trợ' })).toBeVisible();
  await page.screenshot({ path: 'test-results/tutor-settings-mobile.png', fullPage: true });
});

test('Dark mode reaches public, auth, learner and admin shells', async ({ page }) => {
  await resetDemo(page);
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: 'test-results/public-dark.png', fullPage: true });
  await page.goto('/login');
  await page.screenshot({ path: 'test-results/auth-dark.png' });
  await login(page, 'minhanh', '/learner/search');
  await page.screenshot({ path: 'test-results/learner-dark.png', fullPage: true });
  await page.getByRole('button', { name: 'Đăng xuất' }).click();
  await login(page, 'admin', '/admin/dashboard');
  await page.screenshot({ path: 'test-results/admin-dark.png', fullPage: true });
});
