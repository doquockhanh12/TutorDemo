import { test, expect } from '@playwright/test';
import { resetDemo, login, logout } from './demoHelpers.js';
import { createDemoState, DOMAIN_STORAGE_KEY } from '../../src/features/domain/demoDomain.js';

const referenceTime = new Date('2026-11-15T09:00:00+07:00');
const notice = 'Đã gửi báo cáo. Quản trị viên sẽ xem xét.';
const dialog = (page) => page.getByRole('dialog', { name: 'Báo cáo gia sư', exact: true });
const image = { name: 'minh-chung.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jB2kAAAAASUVORK5CYII=', 'base64') };

async function expectGrayOutline(button) {
  expect(await button.evaluate((node) => {
    const style = getComputedStyle(node);
    const probe = document.createElement('span');
    probe.style.color = 'var(--color-ink)'; node.appendChild(probe);
    const text = getComputedStyle(probe).color;
    probe.style.color = 'var(--color-border-strong)';
    const border = getComputedStyle(probe).color; probe.remove();
    return style.color === text && style.borderTopColor === border && parseFloat(style.borderTopWidth) >= 1;
  })).toBe(true);
}

test('profile report shares identity action row with favorite below verification, price card keeps booking/message', async ({ page }, testInfo) => {
  await resetDemo(page, { referenceTime });
  await login(page, 'minhanh', '/tutors/quoc-bao');
  for (const width of [1440, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const report = page.getByRole('button', { name: 'Báo cáo gia sư', exact: true });
    await expect(report).toHaveCount(1);
    const card = page.locator('.profile-landing__cta');
    await expect(card.getByRole('button', { name: 'Báo cáo gia sư', exact: true })).toHaveCount(0);
    await expect(card.getByRole('link', { name: 'Nhắn tin', exact: true })).toBeVisible();
    const identity = page.locator('.profile-landing__identity');
    await expect(identity.getByRole('button', { name: 'Báo cáo gia sư', exact: true })).toBeVisible();
    const favoriteBox = await identity.getByRole('button', { name: 'Lưu hồ sơ', exact: true }).boundingBox();
    const badgeBox = await identity.locator('.profile-bento__verified').boundingBox();
    const reportBox = await report.boundingBox();
    expect(reportBox.height).toBe(favoriteBox.height);
    expect(reportBox.y).toBeGreaterThanOrEqual(badgeBox.y + badgeBox.height);
    expect(favoriteBox.y).toBeGreaterThanOrEqual(badgeBox.y + badgeBox.height);
    if (width === 1440) {
      expect(reportBox.y).toBe(favoriteBox.y);
      expect(reportBox.x).toBeGreaterThan(favoriteBox.x);
    }
    await expect(card.getByRole('button', { name: 'ĐẶT LỊCH HỌC', exact: true })).toHaveClass(/button--primary/);
    expect(await report.evaluate((node) => getComputedStyle(node).color)).toBe(await identity.getByRole('button', { name: 'Lưu hồ sơ', exact: true }).evaluate((node) => getComputedStyle(node).color));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await report.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`profile-report-placement-${width}.png`) });
    await report.click();
    await expect(dialog(page)).toContainText('Trần Gia Bảo');
    await dialog(page).getByRole('button', { name: 'Hủy', exact: true }).click();
  }
});

test('completed and pending request each has one bordered report action beside profile, with exact form identity', async ({ page }, testInfo) => {
  await resetDemo(page, { referenceTime });
  await login(page, 'minhanh', '/requests/demo-03');
  for (const [id, name, code, status] of [
    ['demo-03', 'Phạm Hà Linh', '#YC-1003', 'Hoàn tất'],
    ['demo-01', 'Nguyễn Mai Anh', '#YC-1001', 'Chờ phản hồi'],
  ]) {
    await page.goto(`/requests/${id}`);
    await expect(page.locator('.learner-page-banner')).toContainText(status);
    const report = page.getByRole('button', { name: 'Báo cáo gia sư', exact: true });
    await expect(report).toHaveCount(1);
    await expect(report).toHaveClass(/button--secondary/);
    await expectGrayOutline(report);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      const actions = page.locator('.tutor-report-request-actions');
      const profileBox = await actions.getByRole('link', { name: /Xem hồ sơ gia sư/ }).boundingBox();
      const reportBox = await report.boundingBox();
      if (width === 1440) {
        expect(Math.abs(profileBox.y - reportBox.y)).toBeLessThan(1);
        expect(reportBox.x).toBeGreaterThan(profileBox.x);
      } else expect(reportBox.y).toBeGreaterThanOrEqual(profileBox.y + profileBox.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await actions.scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath(`${id}-${width}.png`) });
    }
    await report.click();
    await expect(dialog(page)).toContainText(name);
    await expect(dialog(page)).toContainText(code);
    await dialog(page).getByRole('button', { name: 'Hủy', exact: true }).click();
    await expect(dialog(page)).toHaveCount(0);
  }
});

test('report from profile with image persists and Admin sees the same information', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await resetDemo(page, { referenceTime });
  await login(page, 'minhanh', '/tutors/quoc-bao');
  await page.getByRole('button', { name: 'Báo cáo gia sư', exact: true }).click();
  const form = dialog(page);
  await expect(form).toContainText('Trần Gia Bảo');
  await expect(form.locator('select option')).toHaveCount(6);
  await form.getByRole('button', { name: 'Gửi báo cáo', exact: true }).click();
  await expect(form.getByRole('alert')).toContainText('chọn lý do');
  await form.getByLabel(/Lý do báo cáo/).selectOption('misleading');
  await form.getByLabel(/Mô tả sự việc/).fill('Thông tin hồ sơ không khớp với trao đổi ngày 15/11.');
  await form.getByLabel(/Ảnh minh chứng/).setInputFiles(image);
  await expect(form.getByRole('button', { name: 'Gửi báo cáo', exact: true })).toBeEnabled();
  await page.screenshot({ path: testInfo.outputPath('profile-report-desktop.png'), fullPage: true });
  await form.getByRole('button', { name: 'Gửi báo cáo', exact: true }).click();
  await expect(form).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText(notice);
  const report = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).issues.find((item) => item.reasonCode === 'misleading'), DOMAIN_STORAGE_KEY);
  expect(report.tutorId).toBe('quoc-bao');
  expect(report.targetUser.id).toBe('demo-tutor');
  expect(report.requestId).toBeNull();
  await page.reload();
  expect(await page.evaluate(({ key, id }) => JSON.parse(localStorage.getItem(key)).issues.some((item) => item.id === id), { key: DOMAIN_STORAGE_KEY, id: report.id })).toBe(true);
  await logout(page);
  await login(page, 'admin', '/admin/issues');
  await page.getByRole('button', { name: `Xử lý sự cố ${report.id}`, exact: true }).click();
  const drawer = page.getByRole('dialog');
  await expect(drawer).toContainText('Nguyễn Minh Anh');
  await expect(drawer).toContainText('Trần Gia Bảo');
  await expect(drawer).toContainText(report.description);
  await expect(drawer).toContainText('Thông tin giới thiệu có dấu hiệu sai lệch');
  await expect(drawer.getByRole('img', { name: 'Ảnh minh chứng báo cáo gia sư' })).toBeVisible();
  await drawer.getByText('Lý do báo cáo:', { exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('admin-report-detail.png'), fullPage: true });
});

test('request reports work pending/completed; Other validation and save failure retain draft', async ({ page }, testInfo) => {
  await resetDemo(page, { referenceTime });
  await login(page, 'minhanh', '/requests/demo-01');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath('request-trigger-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: 'Báo cáo gia sư', exact: true }).click();
  const form = dialog(page);
  await expect(form).toContainText('Nguyễn Mai Anh');
  await expect(form).toContainText('#YC-1001');
  await expect(form.locator('select option')).toHaveCount(9);
  await form.getByLabel(/Lý do báo cáo/).selectOption('other');
  await form.getByRole('button', { name: 'Gửi báo cáo', exact: true }).click();
  await expect(form.getByRole('alert')).toContainText('mô tả sự việc');
  await form.getByLabel(/Mô tả sự việc/).fill('Nội dung thử lại sau lỗi lưu dữ liệu.');
  await form.getByLabel(/Ảnh minh chứng/).setInputFiles({ name: 'bad.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not image') });
  await expect(form.getByRole('alert')).toContainText('PNG/JPG/WebP');
  await expect(form.getByRole('button', { name: 'Gửi báo cáo', exact: true })).toBeDisabled();
  await form.getByRole('button', { name: 'Bỏ ảnh đã chọn' }).click();
  await form.getByLabel(/Ảnh minh chứng/).setInputFiles(image);
  await expect(form.getByRole('button', { name: 'Gửi báo cáo', exact: true })).toBeEnabled();
  await page.evaluate(() => { window.__reportSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function (key, value) { if (key === 'tnm.demo.domain.v1') throw new DOMException('quota', 'QuotaExceededError'); return window.__reportSetItem.call(this, key, value); }; });
  await form.getByRole('button', { name: 'Gửi báo cáo', exact: true }).click();
  await expect(form.getByRole('alert')).toContainText('Không lưu được báo cáo');
  await expect(form.getByLabel(/Mô tả sự việc/)).toHaveValue('Nội dung thử lại sau lỗi lưu dữ liệu.');
  await expect(form.getByLabel(/Lý do báo cáo/)).toHaveValue('other');
  await expect(form.locator('.tutor-report-files')).toContainText('minh-chung.png');
  await page.screenshot({ path: testInfo.outputPath('request-report-mobile.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 320, height: 700 });
  const bounds = await form.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(700);
  await page.evaluate(() => { Storage.prototype.setItem = window.__reportSetItem; });
  await form.getByRole('button', { name: 'Gửi báo cáo', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText(notice);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/requests/demo-03');
  await expect(page.locator('.learner-request-review-wrapper')).toBeVisible();
  await page.getByRole('button', { name: 'Báo cáo gia sư', exact: true }).click();
  await form.getByLabel(/Lý do báo cáo/).selectOption('teaching_content');
  await form.getByRole('button', { name: 'Gửi báo cáo', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText(notice);
  await page.reload();
  const reports = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).issues.filter((item) => item.requestId), DOMAIN_STORAGE_KEY);
  expect(reports.find((item) => item.requestId === 'demo-01').tutorId).toBe('mai-anh');
  const report = reports.find((item) => item.requestId === 'demo-03');
  expect(report.tutorId).toBe('ha-linh');
  await logout(page);
  await login(page, 'admin', '/admin/issues');
  await page.getByRole('button', { name: `Xử lý sự cố ${report.id}`, exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('demo-03');
  await expect(page.getByRole('dialog')).toContainText('Phạm Hà Linh');
  await expect(page.getByRole('dialog')).toContainText('Không dạy theo nội dung đã thống nhất');
});

test('request-list hierarchy and review form remain intact after reporting', async ({ page }) => {
  await resetDemo(page, { referenceTime });
  await login(page, 'minhanh', '/requests');
  await expect(page.locator('.learner-requests-view')).toBeVisible();
  const stats = await page.locator('.learner-stat-card strong').allTextContents();
  const detailLinks = page.locator('.learner-request-card__actions > a:first-child');
  const before = await detailLinks.evaluateAll((items) => items.map((item) => item.getAttribute('href')));
  expect(before).toEqual(['/requests/demo-01', '/requests/demo-02', '/requests/demo-03']);
  await expect(detailLinks.first()).toHaveClass(/button--primary/);
  await page.goto('/requests/demo-03');
  await expect(page.locator('.learner-request-review-wrapper')).toBeVisible();
  await page.getByRole('button', { name: 'Báo cáo gia sư', exact: true }).click();
  await dialog(page).getByLabel(/Lý do báo cáo/).selectOption('fraud');
  await dialog(page).getByRole('button', { name: 'Gửi báo cáo', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText(notice);
  await expect(page.locator('.learner-request-review-wrapper')).toBeVisible();
  await page.goto('/requests');
  expect(await page.locator('.learner-stat-card strong').allTextContents()).toEqual(stats);
  expect(await detailLinks.evaluateAll((items) => items.map((item) => item.getAttribute('href')))).toEqual(before);
});

test('missing tutor profile never reports another tutor and modal keyboard dismissal works', async ({ page }) => {
  const state = createDemoState(referenceTime);
  state.requests.find((item) => item.id === 'demo-01').tutorId = 'missing-tutor';
  await resetDemo(page, { referenceTime, state });
  await login(page, 'minhanh', '/requests/demo-01');
  const trigger = page.getByRole('button', { name: 'Báo cáo gia sư', exact: true });
  await trigger.click();
  await expect(dialog(page)).toContainText('missing-tutor');
  await expect(dialog(page)).not.toContainText('Nguyễn Mai Anh');
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog(page).getByLabel(/Lý do báo cáo/).selectOption('fraud');
  await dialog(page).getByRole('button', { name: 'Gửi báo cáo', exact: true }).click();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).issues.find((item) => item.reasonCode === 'fraud').tutorId, DOMAIN_STORAGE_KEY)).toBe('missing-tutor');
});
