import { test, expect } from '@playwright/test';
import { resetDemo, login } from './demoHelpers.js';
import { createDemoState } from '../../src/features/domain/demoDomain.js';
import { submitAppeal } from '../../src/features/domain/appeals.js';

test.beforeEach(async ({ page }, testInfo) => {
  let state;
  if (testInfo.title.startsWith('Admin connected') || testInfo.title.startsWith('User appeal responsive')) {
    state = createDemoState(new Date('2026-10-05T06:00:00+07:00'));
    state = submitAppeal(state, state.users.find(u => u.id === 'demo-tutor'), {
      issueId: 'ISSUE-105', reason: 'misunderstanding', content: 'Tôi đề nghị đối chiếu lại trao đổi và nội dung buổi học.',
      evidence: [{ kind: 'link', url: 'https://example.org/proof', description: 'Bản trao đổi trong buổi học cần đối chiếu.' }], truthful: true,
    }, new Date('2026-10-05T06:00:00+07:00')).state;
  }
  await resetDemo(page, state ? { state } : {});
});

test('Report history opens both accounts and exposes recorded reports and warning reasons', async ({ page }) => {
  await login(page, 'admin', '/admin/issues');
  await page.getByRole('button', { name: /Xử lý sự cố/ }).first().click();
  await expect(page.getByRole('button', { name: /Lịch sử báo cáo của/ })).toHaveCount(2);
  await page.getByRole('button', { name: 'Lịch sử báo cáo của Nguyễn Minh Anh' }).click();
  await expect(page.getByRole('heading', { name: 'Báo cáo đã gửi' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cảnh cáo đã nhận' })).toBeVisible();
  await expect(page.getByText('ISSUE-101', { exact: true }).last()).toBeVisible();
  await page.getByRole('button', { name: 'Quay lại đối soát' }).click();
  await page.getByRole('button', { name: 'Lịch sử báo cáo của Hoàng Quang Huy' }).click();
  await expect(page.getByText('Vắng mặt buổi học online không báo trước', { exact: true })).toBeVisible();
  await expect(page.getByText('4 cảnh cáo đã nhận', { exact: true })).toBeVisible();
});

test('User evidence-backed appeal persists through admin review and returns to the same user', async ({ page }) => {
  await login(page, 'giabao', '/appeals');
  await page.getByLabel('Sự cố cần kháng cáo').selectOption('ISSUE-105');
  await page.getByRole('button', { name: 'Gửi kháng cáo' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByLabel('Nội dung giải trình').fill('Tôi đề nghị đối chiếu lại trao đổi và nội dung buổi học.');
  await page.getByLabel('Liên kết bằng chứng').fill('https://example.org/proof');
  await page.getByLabel('Mô tả và nguồn bằng chứng').fill('Bản trao đổi trong buổi học cần đối chiếu.');
  await page.getByLabel('Tôi cam kết').check();
  await page.getByRole('button', { name: 'Gửi kháng cáo' }).click();
  await expect(page.getByRole('status')).toContainText('Đã gửi kháng cáo');
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await login(page, 'admin', '/admin/appeals');
  await page.getByRole('button', { name: /Xem kháng cáo appeal-/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Bản trao đổi trong buổi học cần đối chiếu.');
  await expect(dialog.getByRole('link', { name: 'Mở bằng chứng' })).toHaveAttribute('href', 'https://example.org/proof');
  await dialog.getByLabel('Kết quả xem xét').selectOption('accepted');
  await dialog.getByLabel('Căn cứ / phản hồi').fill('Đã đối chiếu bằng chứng và chấp nhận giải trình.');
  await dialog.getByRole('button', { name: 'Lưu kết quả' }).click();
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await login(page, 'giabao', '/appeals');
  await expect(page.getByText('Chấp nhận', { exact: true })).toBeVisible();
  await expect(page.getByText('Đã đối chiếu bằng chứng và chấp nhận giải trình.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Chấp nhận', { exact: true })).toBeVisible();
});

test('Suspended account can authenticate only into appeals without entering product routes', async ({ page }) => {
  await page.goto('/appeals');
  await page.getByLabel('Tài khoản').fill('quanghuy');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('demo1234');
  await page.getByRole('button', { name: 'Xác thực để kháng cáo' }).click();
  await expect(page.getByLabel('Sự cố cần kháng cáo')).toBeVisible();
  await page.goto('/tutor/dashboard');
  await expect(page).toHaveURL(/\/appeals$/);
  await expect(page.getByText('Phiên này chỉ cho phép gửi và theo dõi kháng cáo.')).toBeVisible();
});

test('ADM-REG-001 drawer traps keyboard focus and restores its trigger', async ({ page }) => {
  await login(page, 'admin', '/admin/issues');
  const trigger = page.getByRole('button', { name: /Xử lý sự cố/ }).first();
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await dialog.getByRole('button', { name: 'Đóng bảng chi tiết' }).focus();
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('ADM-REG-002 desktop comparison preserves readable party cards in the narrow drawer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await login(page, 'admin', '/admin/issues');
  await page.getByRole('button', { name: /Xử lý sự cố/ }).first().click();
  const cards = page.locator('.admin-party-card');
  await expect(cards).toHaveCount(2);
  for (const card of await cards.all()) {
    expect((await card.boundingBox()).width).toBeGreaterThanOrEqual(260);
    expect(await card.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  }
});

test('ADM-REG-003 mobile dashboard stays within the viewport without clipping header actions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await login(page, 'admin', '/admin/dashboard');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
  const heading = page.locator('.admin-approvals .admin-section__heading');
  expect((await heading.boundingBox()).width).toBeLessThanOrEqual(366);
  await expect(heading.getByRole('link', { name: 'Xem tất cả' })).toBeVisible();
});

test('ADM-REG-004 visible dashboard metrics match shared records', async ({ page }) => {
  await login(page, 'admin', '/admin/dashboard');
  const seed = createDemoState(new Date('2026-10-05T06:00:00+07:00'));
  await expect(page.locator('.admin-summary .stat-item').filter({ hasText: 'Đánh giá gửi về' }).locator(':scope > strong')).toHaveText(String(seed.reviews.length));
  await expect(page.locator('.admin-summary .stat-item').filter({ hasText: 'Sự cố & khiếu nại' }).locator(':scope > strong')).toHaveText(String(seed.issues.length));
});

test('ADM-REG-005 mobile table action buttons stay inside their cell', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await login(page, 'admin', '/admin/tutors');
  for (const button of await page.locator('.admin-table .admin-row-actions button').all()) {
    expect(await button.evaluate(el => {
      const b = el.getBoundingClientRect(), cell = el.closest('td').getBoundingClientRect();
      return b.left >= cell.left && b.right <= cell.right;
    })).toBe(true);
  }
});

for (const width of [1440, 1024, 390, 360]) {
  test(`Admin connected screens and full drawers remain readable at ${width}px`, async ({ page }, testInfo) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', message => { if (message.type() === 'error' && !message.text().includes('ERR_')) errors.push(message.text()); });
    await page.setViewportSize({ width, height: 900 });
    await login(page, 'admin', '/admin/dashboard');
    for (const route of ['dashboard', 'tutors', 'users', 'reviews', 'issues', 'appeals']) {
      await page.goto(`/admin/${route}`);
      await expect(page.locator('main h1')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`${route}-${width}.png`), fullPage: true });
      // Horizontal tables may scroll, but controls must fit their own cell at every scroll offset.
      for (const button of await page.locator('.admin-table .admin-row-actions button').all()) {
        expect(await button.evaluate(el => {
          const b = el.getBoundingClientRect(), cell = el.closest('td').getBoundingClientRect();
          return b.left >= cell.left && b.right <= cell.right;
        }), `clipped action on ${route}`).toBe(true);
      }
      const scroll = page.locator('.admin-table-scroll').first();
      if (await scroll.count()) {
        await scroll.evaluate(el => { el.scrollLeft = el.scrollWidth; });
        await page.screenshot({ path: testInfo.outputPath(`${route}-table-end-${width}.png`), fullPage: true });
      }
      if (['tutors', 'users', 'issues', 'appeals'].includes(route)) {
        await page.locator('.admin-table .admin-row-actions button').first().click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(page.locator('.admin-slideover__panel')).toHaveCSS('transform', 'none');
        await page.screenshot({ path: testInfo.outputPath(`${route}-drawer-top-${width}.png`) });
        expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
        const panel = await page.locator('.admin-slideover__panel').boundingBox();
        expect(panel.x).toBeGreaterThanOrEqual(0); expect(panel.x + panel.width).toBeLessThanOrEqual(width + 1);
        const body = page.locator('.admin-slideover__body');
        await body.evaluate(el => { el.scrollTop = el.scrollHeight; });
        await page.screenshot({ path: testInfo.outputPath(`${route}-drawer-bottom-${width}.png`) });
        for (const button of await dialog.locator('footer button').all()) {
          expect(await button.evaluate(el => el.scrollWidth <= el.clientWidth + 1), `clipped footer on ${route}`).toBe(true);
        }
        await page.keyboard.press('Escape');
      }
      if (width < 1024) {
        await page.getByRole('button', { name: 'Mở điều hướng' }).click();
        await expect(page.getByRole('link', { name: 'Kháng cáo', exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Đóng điều hướng', exact: true }).first().click();
      }
    }
    expect(errors).toEqual([]);
  });
}

test('Learner appeal entry preserves learner navigation and does not expose another account history', async ({ page }) => {
  await login(page, 'minhanh', '/learner/dashboard');
  await page.getByRole('link', { name: 'Kháng cáo', exact: true }).click();
  await expect(page).toHaveURL(/\/appeals$/);
  await expect(page.getByRole('heading', { name: 'Kháng cáo', exact: true })).toBeVisible();
  await expect(page.getByText('Chưa có sự cố báo cáo bạn trong dữ liệu hiện có.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Gửi kháng cáo' })).toBeDisabled();
  await expect(page.getByLabel('Sự cố cần kháng cáo').getByRole('option')).toHaveCount(1);
  await expect(page.getByText('Bạn chưa gửi kháng cáo.')).toBeVisible();
});

test('Appeal submission supports uploaded evidence without pretending a file name is proof', async ({ page }) => {
  await login(page, 'giabao', '/appeals');
  await page.getByLabel('Sự cố cần kháng cáo').selectOption('ISSUE-105');
  await page.getByLabel('Nội dung giải trình').fill('Tôi đề nghị đối chiếu lại nội dung buổi học và hình ảnh kèm theo.');
  await page.getByLabel('Mô tả và nguồn bằng chứng').fill('Ảnh chụp trao đổi cần đối chiếu.');
  await page.getByLabel('Tệp bằng chứng').setInputFiles({ name: 'proof.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6AAAAAElFTkSuQmCC', 'base64') });
  await page.getByLabel('Tôi cam kết').check();
  await page.getByRole('button', { name: 'Gửi kháng cáo' }).click();
  await expect(page.getByRole('status')).toContainText('Đã gửi kháng cáo');
  await page.reload();
  await page.getByText('Xem bằng chứng đã gửi').click();
  await expect(page.getByRole('img', { name: 'Ảnh chụp trao đổi cần đối chiếu.' })).toBeVisible();
});

for (const width of [1440, 1024, 390]) {
  test(`User appeal responsive form and persisted evidence at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await login(page, 'giabao', '/appeals');
    await page.evaluate(() => document.fonts.ready);
    await page.getByText('Xem bằng chứng đã gửi').click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
    await expect(page.getByLabel('Nội dung giải trình')).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`user-appeals-${width}.png`), fullPage: true });
  });
}
