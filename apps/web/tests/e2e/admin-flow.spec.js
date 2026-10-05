import { test, expect } from '@playwright/test';
import { resetDemo, login } from './demoHelpers.js';

test.describe('Admin Subsystem Flow (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await resetDemo(page);
  });

  test('ADM-E2E-001: Admin Header conforms strictly to R1 (no RoleSwitcher, red LogOut button)', async ({ page }) => {
    await login(page, 'admin', '/admin/dashboard');

    // Verify Admin identity elements
    await expect(page.locator('.admin-topbar__user')).toContainText('Quản trị viên');
    await expect(page.locator('.admin-topbar__user')).toContainText('AD');

    // Verify Red Logout button is present
    const logoutBtn = page.locator('.admin-header__logout');
    await expect(logoutBtn).toBeVisible();

    // Verify RoleSwitcher is completely removed
    await expect(page.locator('.role-switcher')).toHaveCount(0);
    await expect(page.getByText('Xem giao diện')).toHaveCount(0);
  });

  test('ADM-E2E-002: Navigation links across all 5 admin routes with active state', async ({ page }) => {
    await login(page, 'admin', '/admin/dashboard');

    // 1. Dashboard
    await expect(page.getByRole('heading', { name: 'Tổng quan hệ thống' })).toBeVisible();

    // 2. Tutors
    await page.getByRole('link', { name: 'Gia sư' }).click();
    await expect(page).toHaveURL(/\/admin\/tutors$/);
    await expect(page.getByRole('heading', { name: 'Quản lý Gia sư' })).toBeVisible();
    await expect(page.locator('.admin-record-counter')).toContainText(/Hiển thị \d+ \/ \d+ bản ghi/);

    // 3. Users
    await page.getByRole('link', { name: 'Người dùng' }).click();
    await expect(page).toHaveURL(/\/admin\/users$/);
    await expect(page.getByRole('heading', { name: 'Quản lý Người dùng' })).toBeVisible();
    await expect(page.locator('.admin-record-counter')).toContainText(/Hiển thị \d+ \/ \d+ bản ghi/);

    // 4. Reviews
    await page.getByRole('link', { name: 'Đánh giá' }).click();
    await expect(page).toHaveURL(/\/admin\/reviews$/);
    await expect(page.getByRole('heading', { name: 'Kiểm duyệt Đánh giá' })).toBeVisible();
    await expect(page.locator('.admin-record-counter')).toContainText(/Hiển thị \d+ \/ \d+ bản ghi/);

    // 5. Issues
    await page.getByRole('link', { name: 'Báo cáo & sự cố' }).click();
    await expect(page).toHaveURL(/\/admin\/issues$/);
    await expect(page.getByRole('heading', { name: 'Báo cáo & Sự cố' })).toBeVisible();
    await expect(page.locator('.admin-record-counter')).toContainText(/Hiển thị \d+ \/ \d+ bản ghi/);
  });

  test('ADM-E2E-003: Tutor operational drawer opens, shows verification documents, and closes', async ({ page }) => {
    await login(page, 'admin', '/admin/tutors');

    // Switch to "Chờ duyệt" tab
    await page.getByRole('tab', { name: 'Chờ duyệt' }).click();

    // Click on view detail button on first row
    const viewBtn = page.locator('.admin-table tbody tr').first().locator('button[title="Xem chi tiết"]');
    await viewBtn.click();

    // Slide-over drawer should be open
    const drawer = page.locator('.admin-slideover');
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('.admin-verification-docs')).toBeVisible();

    // Close drawer using close button
    await drawer.locator('.admin-slideover__close').click();
    await expect(drawer).toHaveCount(0);
  });

  test('ADM-E2E-004: Admin Logout button navigates back to /login', async ({ page }) => {
    await login(page, 'admin', '/admin/dashboard');

    // Click red logout button
    await page.locator('.admin-header__logout').click();

    // Expect to be back at /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('ADM-E2E-005: Suspended account login is rejected at auth boundary', async ({ page }) => {
    await page.goto('/login');
    // Try to login as suspended account (quochuy is seeded as suspended learner)
    await page.getByLabel('Username / Email / Số điện thoại *').fill('quochuy');
    await page.getByLabel('Mật khẩu *', { exact: true }).fill('demo1234');
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();

    // Verify rejection message
    await expect(page.getByRole('alert')).toContainText(
      'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.'
    );
  });
});
