import { test, expect } from '@playwright/test';
import { resetDemo, login } from './demoHelpers.js';

test.describe('New Admin User Journey & UX Polish QA', () => {
  test.beforeEach(async ({ page }) => {
    await resetDemo(page);
    await login(page, 'admin', '/admin/dashboard');
  });

  test('ADM-QA-001: New Admin visits Dashboard, inspects metrics and quick actions across viewports', async ({ page }) => {
    // 1440px Desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByRole('heading', { name: 'Tổng quan hệ thống' })).toBeVisible();

    // Verify summary stat cards exist and have values
    const statCards = page.locator('.admin-summary .stat-item');
    await expect(statCards).toHaveCount(4);

    // Verify approvals table has sticky header and clean layout
    await expect(page.locator('.admin-table--approvals th').first()).toHaveText('Gia sư');

    // 1024px Tablet
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('.admin-summary')).toBeVisible();

    // 390px Mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.workspace-topbar__menu')).toBeVisible();
    await expect(page.locator('.admin-summary .stat-item')).toHaveCount(4);
  });

  test('ADM-QA-002: New Admin operates /admin/tutors with instant search, tabs, drawer & feedback banner', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin/tutors');

    // Counter matches format
    await expect(page.locator('.admin-record-counter')).toContainText(/Hiển thị \d+ \/ \d+ bản ghi/);

    // Filter by pending tab
    await page.getByRole('tab', { name: 'Chờ duyệt' }).click();
    await expect(page.locator('.admin-record-counter')).toContainText(/Hiển thị 3 \/ \d+ bản ghi/);

    // Search instant filter
    const searchInput = page.getByRole('searchbox', { name: 'Tìm kiếm gia sư' });
    await searchInput.fill('Thảo Vy');
    await expect(page.locator('.admin-record-counter')).toContainText(/Hiển thị 1 \/ \d+ bản ghi/);

    // Open drawer
    await page.getByRole('button', { name: /Xem chi tiết hồ sơ/ }).click();
    await expect(page.locator('#slideover-title')).toContainText('Lê Thảo Vy');

    // Verify verification documents card exists in drawer
    await expect(page.locator('.admin-doc-item')).toHaveCount(2);

    // Approve tutor from drawer
    await page.locator('.admin-drawer-actions').getByRole('button', { name: 'Phê duyệt hồ sơ' }).click();

    // Verify feedback banner appears
    const banner = page.locator('.admin-feedback-banner--success');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Đã phê duyệt hồ sơ');

    // Test mobile drawer full-width
    await page.setViewportSize({ width: 390, height: 844 });
    const panel = page.locator('.admin-slideover__panel');
    await expect(panel).toBeVisible();

    // Close drawer via ESC
    await page.keyboard.press('Escape');
    await expect(panel).not.toBeVisible();
  });

  test('ADM-QA-003: New Admin operates /admin/users, checks 7 columns, drawer & suspend feedback', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin/users');

    // Table has 7 columns
    const headers = page.locator('.admin-table--users th');
    await expect(headers).toHaveCount(7);
    await expect(headers.nth(0)).toHaveText('Người dùng');
    await expect(headers.nth(1)).toHaveText('Email');
    await expect(headers.nth(2)).toHaveText('Số điện thoại');
    await expect(headers.nth(3)).toHaveText('Vai trò');
    await expect(headers.nth(4)).toHaveText('Ngày tham gia');
    await expect(headers.nth(5)).toHaveText('Trạng thái');
    await expect(headers.nth(6)).toHaveText('Thao tác');

    // Verify dates are formatted cleanly as DD/MM/YYYY without raw ISO timestamp 'T'
    const dateCell = page.locator('.admin-table--users tbody tr td:nth-child(5) span').first();
    const dateText = await dateCell.innerText();
    expect(dateText).toMatch(/^\d{2}\/\d{2}\/\d{4}$|^Tháng \d+\/\d{4}$/);
    expect(dateText).not.toContain('T');

    // Verify cell truncation styling is applied to prevent text collision
    const emailCell = page.locator('.admin-table--users tbody tr td:nth-child(2) span').first();
    await expect(emailCell).toHaveClass(/admin-cell-truncate/);

    // Search user
    await page.getByRole('searchbox', { name: 'Tìm kiếm người dùng' }).fill('minhanh');
    await expect(page.locator('.admin-record-counter')).toContainText(/Hiển thị 1 \/ \d+ bản ghi/);

    // Open drawer
    await page.getByRole('button', { name: /Xem chi tiết người dùng/ }).click();
    await expect(page.locator('#slideover-title')).toBeVisible();

    // Drawer displays activity statistics
    await expect(page.getByText('Số yêu cầu học')).toBeVisible();

    // Toggle suspend
    await page.locator('.admin-drawer-actions').getByRole('button', { name: /Khóa tài khoản/ }).click();

    // Feedback banner appears
    const banner = page.locator('.admin-feedback-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Đã tạm khóa tài khoản');
  });

  test('ADM-QA-004: New Admin operates /admin/reviews, checks 7 columns & approval/hide actions', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin/reviews');

    // Table has 7 columns
    const headers = page.locator('.admin-table--reviews th');
    await expect(headers).toHaveCount(7);
    await expect(headers.nth(0)).toHaveText('Người đánh giá');
    await expect(headers.nth(3)).toHaveText('Nội dung nhận xét');
    await expect(headers.nth(6)).toHaveText('Thao tác');

    // Switch to Cần duyệt tab
    await page.getByRole('tab', { name: 'Cần duyệt / Xem xét' }).click();

    // Approve the first pending review
    const approveBtn = page.locator('.admin-row-actions').getByRole('button', { name: /Duyệt hiển thị/ }).first();
    await approveBtn.click();

    // Verify feedback banner appears
    const banner = page.locator('.admin-feedback-banner--success');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Đã phê duyệt hiển thị đánh giá');
  });

  test('ADM-QA-005: New Admin operates /admin/issues, checks 2-party trust metrics, dispute warnings & dismissal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin/issues');

    // Table has 7 columns
    const headers = page.locator('.admin-table--issues th');
    await expect(headers).toHaveCount(7);
    await expect(headers.nth(0)).toHaveText('Mã sự cố');
    await expect(headers.nth(1)).toHaveText('Phân loại');
    await expect(headers.nth(2)).toHaveText('Người gửi');
    await expect(headers.nth(3)).toHaveText('Bên liên quan');
    await expect(headers.nth(6)).toHaveText('Thao tác');

    // Filter tabs include 'Đã từ chối'
    await expect(page.getByRole('tab', { name: 'Đã từ chối' })).toBeVisible();

    // 1. Open drawer for an open issue and verify two-party inspection & trust metrics
    await page.locator('.admin-row-actions').getByRole('button', { name: /Xử lý sự cố/ }).first().click();
    await expect(page.locator('#slideover-title')).toContainText('Sự cố');

    // Two-party comparison grid is visible
    const partiesGrid = page.locator('.admin-parties-grid');
    await expect(partiesGrid).toBeVisible();
    await expect(partiesGrid).toContainText('Bên gửi phản ánh');
    await expect(partiesGrid).toContainText('Đối tượng bị khiếu nại');
    await expect(partiesGrid.locator('.admin-party-trust-badge--reporter')).toBeVisible();
    await expect(partiesGrid.locator('.admin-warning-meter')).toBeVisible();

    // 2. Test Warning Dispute Flow (Tab: Gửi cảnh cáo vi phạm)
    // Try to send warning without note -> validation error
    await page.getByRole('button', { name: /Gửi cảnh cáo & Giải quyết sự cố/ }).click();
    await expect(page.getByText(/Vui lòng nhập lý do.*cảnh cáo vi phạm/i)).toBeVisible();

    // Enter warning reason and submit
    await page.locator('#warning-reason-input').fill('Vắng mặt buổi học online không thông báo trước.');
    await page.getByRole('button', { name: /Gửi cảnh cáo & Giải quyết sự cố/ }).click();

    // Feedback banner for warning appears (since target user exceeded 3 warnings, auto-suspension triggered)
    const warningBanner = page.locator('.admin-feedback-banner');
    await expect(warningBanner).toBeVisible();
    await expect(warningBanner).toContainText('Đã gửi cảnh cáo vi phạm');
    await expect(warningBanner).toContainText('Tài khoản đã TỰ ĐỘNG BỊ KHÓA');

    // 3. Test Report Dismissal Flow
    // Switch to Mới tiếp nhận tab to find an open issue
    await page.getByRole('tab', { name: 'Mới tiếp nhận' }).click();
    const openRowBtn = page.locator('.admin-row-actions').getByRole('button', { name: /Xử lý sự cố/ }).first();
    await openRowBtn.click();
    await expect(page.locator('#slideover-title')).toBeVisible();

    // Switch to 'Từ chối báo cáo' action tab
    await page.getByRole('tab', { name: 'Từ chối báo cáo' }).click();
    await expect(page.getByText('Chính sách bảo vệ tài khoản')).toBeVisible();

    // Try to dismiss without reason -> validation error
    await page.getByRole('button', { name: /Từ chối báo cáo & Gửi thông báo/ }).click();
    await expect(page.getByText('Vui lòng nhập thông báo lý do từ chối')).toBeVisible();

    // Fill dismissal reason and submit
    await page.locator('#dismissal-reason-input').fill('Chưa đủ chứng cứ xác thực khiếu nại, hai bên đã thống nhất bù giờ học.');
    await page.getByRole('button', { name: /Từ chối báo cáo & Gửi thông báo/ }).click();

    // Feedback banner for dismissal appears
    const dismissBanner = page.locator('.admin-feedback-banner');
    await expect(dismissBanner).toBeVisible();
    await expect(dismissBanner).toContainText('Đã từ chối báo cáo');

    // 4. Verify dismissed issue appears under 'Đã từ chối' tab
    await page.getByRole('tab', { name: 'Đã từ chối' }).click();
    await expect(page.locator('.admin-table tbody tr')).not.toHaveCount(0);
    await expect(page.locator('.admin-table tbody tr').first()).toContainText('Đã từ chối');
  });
});
