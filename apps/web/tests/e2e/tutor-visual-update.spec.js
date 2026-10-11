import { test, expect } from '@playwright/test';
import { login, resetDemo } from './demoHelpers.js';
import { createDemoState } from '../../src/features/domain/demoDomain.js';

test('footer and tutor dashboard align at desktop and mobile', async ({ page }) => {
  await resetDemo(page);
  await page.goto('/');
  await expect(page.locator('.public-footer')).not.toContainText('Dành cho Người học');
  await expect(page.locator('.public-footer__social-links a')).toHaveCount(3);
  await page.locator('.public-footer').screenshot({ path: 'test-results/home-footer-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.locator('.public-footer').screenshot({ path: 'test-results/home-footer-mobile.png' });
  await login(page, 'giabao', '/tutor/dashboard');
  await expect(page.locator('.tutor-header__nav')).not.toContainText('Tổng Quan');
  await page.screenshot({ path: 'test-results/tutor-dashboard-mobile-update.png', fullPage: true });
});

test('class filters combine subject, area and fee, then reset', async ({ page }) => {
  await resetDemo(page);
  await login(page, 'giabao', '/tutor/find-students');
  await expect(page.locator('.tutor-find__result-heading h2')).toBeVisible();
  const initial = await page.locator('.tutor-find__class').count();
  await expect(page.locator('.tutor-find__result-heading h2')).toHaveText(`${initial} lớp phù hợp`);
  await page.getByRole('button', { name: /Môn học/ }).click();
  await expect(page.getByRole('button', { name: /Môn học/ })).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('checkbox', { name: 'Toán', exact: true }).check();
  await page.getByRole('searchbox', { name: 'Tìm môn học' }).fill('iel');
  await page.getByRole('checkbox', { name: 'IELTS', exact: true }).check();
  await page.getByRole('searchbox', { name: 'Tìm môn học' }).fill('');
  await expect(page.getByRole('button', { name: /Môn học/ })).toContainText('2 môn học đã chọn');
  await page.getByRole('button', { name: /Khu vực/ }).click();
  await page.getByRole('checkbox', { name: 'Biên Hòa', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Long Thành', exact: true }).check();
  await expect(page.getByRole('button', { name: /Khu vực/ })).toContainText('2 khu vực đã chọn');
  const filtered = await page.locator('.tutor-find__class').count();
  expect(filtered).toBeLessThanOrEqual(initial);
  await expect(page.locator('.tutor-find__result-heading h2')).toHaveText(`${filtered} lớp phù hợp`);
  await page.locator('.tutor-find__filters').screenshot({ path: 'test-results/tutor-filters-expanded.png' });
  await page.getByText('Xem các khoảng thời gian').click();
  await expect(page.locator('.tutor-find__saved-times details')).toHaveAttribute('open', '');
  await page.getByText('Xem các khoảng thời gian').click();
  await expect(page.locator('.tutor-find__saved-times details')).not.toHaveAttribute('open', '');
  await page.getByRole('button', { name: 'Đặt lại', exact: true }).click();
  await expect(page.getByRole('button', { name: /Môn học/ })).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('button', { name: /Môn học/ })).toContainText('Có thể chọn nhiều');
  await expect(page.locator('.tutor-find__class')).toHaveCount(initial);
  const maxSlider = page.getByRole('slider', { name: 'Học phí tối đa' });
  const bounds = await maxSlider.boundingBox();
  await page.mouse.move(bounds.x + bounds.width - 12, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * .45, bounds.y + bounds.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(maxSlider).not.toHaveValue('500000');
  await expect(page.getByLabel('Học phí đến')).not.toHaveText('500.000đ');
  const minSlider = page.getByRole('slider', { name: 'Học phí tối thiểu' });
  await page.mouse.move(bounds.x + 11, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * .2, bounds.y + bounds.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(minSlider).not.toHaveValue('0');
  await expect(page.getByLabel('Học phí từ')).not.toHaveText('0đ');
  await maxSlider.focus();
  await page.keyboard.press('Home');
  await expect(page.locator('.tutor-find__result-heading h2')).toHaveText('0 lớp phù hợp');
  await expect(page.getByText('Chưa có lớp phù hợp')).toBeVisible();
  await page.getByRole('button', { name: 'Đặt lại bộ lọc' }).click();
  await expect(page.locator('.tutor-find__class')).toHaveCount(initial);
  await page.screenshot({ path: 'test-results/tutor-class-filters-desktop.png', fullPage: true });
  await page.getByRole('link', { name: /Chỉnh sửa lịch rảnh/ }).click();
  await expect(page).toHaveURL(/\/tutor\/timetable$/);
});

test('filter controls still open before availability is saved', async ({ page }) => {
  const state = createDemoState(new Date('2026-10-05T06:00:00+07:00'));
  state.availability = [];
  await resetDemo(page, { state });
  await login(page, 'giabao', '/tutor/find-students');
  await page.getByRole('button', { name: /Môn học/ }).click();
  await page.getByRole('checkbox', { name: 'Toán', exact: true }).check();
  await expect(page.getByRole('button', { name: /Môn học/ })).toContainText('1 môn học đã chọn');
  await expect(page.getByText('Bạn cần đăng ký lịch rảnh trước khi lọc lớp')).toBeVisible();
});

test('filter dropdown and fee slider remain usable on mobile dark mode', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await resetDemo(page);
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await login(page, 'giabao', '/tutor/find-students');
  await page.getByRole('button', { name: /Môn học/ }).click();
  await expect(page.getByRole('searchbox', { name: 'Tìm môn học' })).toBeVisible();
  await page.getByRole('button', { name: /Khu vực/ }).click();
  await expect(page.getByRole('checkbox', { name: 'Biên Hòa' })).toBeVisible();
  await page.locator('.tutor-find__filters').screenshot({ path: 'test-results/tutor-filters-mobile-dark.png' });
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
});

test('tutor sidebar geometry stays fixed across routes and refresh', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await resetDemo(page);
  await login(page, 'giabao', '/tutor/dashboard');
  const baseline = await page.locator('.tutor-sidebar').boundingBox();
  const baselineMain = await page.locator('.workspace__main').boundingBox();
  const item = page.getByRole('link', { name: 'Tổng quan', exact: true });
  const itemHeight = (await item.boundingBox()).height;
  for (const route of ['/tutor/requests', '/tutor/timetable', '/tutor/find-students', '/tutor/profile', '/tutor/settings', '/tutor/dashboard']) {
    await page.goto(route);
    const sidebar = await page.locator('.tutor-sidebar').boundingBox();
    const main = await page.locator('.workspace__main').boundingBox();
    expect(sidebar.width).toBe(baseline.width);
    expect(main.x).toBe(baselineMain.x);
    expect((await item.boundingBox()).height).toBe(itemHeight);
  }
  await page.reload();
  expect((await page.locator('.tutor-sidebar').boundingBox()).width).toBe(baseline.width);
  expect((await page.locator('.workspace__main').boundingBox()).x).toBe(baselineMain.x);
  await page.screenshot({ path: 'test-results/tutor-dashboard-desktop-fixed.png', fullPage: true });
});

test('dark switches show distinct persisted on and off states', async ({ page }) => {
  await resetDemo(page);
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await login(page, 'giabao', '/tutor/settings');
  await page.getByRole('button', { name: 'Vị trí & quyền riêng tư' }).click();
  const location = page.getByRole('switch', { name: 'Cho phép sử dụng vị trí của tôi' });
  await expect(location).toHaveAttribute('aria-checked', 'false');
  await expect(location).toHaveCSS('background-color', 'rgb(97, 117, 144)');
  await location.check();
  await expect(location).toHaveAttribute('aria-checked', 'true');
  await expect(location).toHaveCSS('background-color', 'rgb(40, 93, 186)');
  await page.screenshot({ path: 'test-results/tutor-switch-on-dark.png' });
  await page.reload();
  await page.getByRole('button', { name: 'Vị trí & quyền riêng tư' }).click();
  await expect(location).toBeChecked();
  await location.uncheck();
  await expect(location).toHaveCSS('background-color', 'rgb(97, 117, 144)');
  await page.screenshot({ path: 'test-results/tutor-switch-off-dark.png' });
});

test('tutor profile has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await resetDemo(page);
  await login(page, 'giabao', '/tutor/profile');
  const overflow = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    offenders: [...document.querySelectorAll('body *')].filter((element) => element.getBoundingClientRect().right > window.innerWidth + 1).slice(0, 12).map((element) => ({ tag: element.tagName, className: element.className, right: element.getBoundingClientRect().right, width: element.getBoundingClientRect().width })),
  }));
  expect(overflow.width, JSON.stringify(overflow.offenders)).toBeLessThanOrEqual(1);
});
