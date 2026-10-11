import { expect, test } from '@playwright/test';
import { demoReferenceData } from '../../src/data/demoReferenceData.js';
import { DOMAIN_STORAGE_KEY } from '../../src/features/domain/demoDomain.js';
import { login, logout, resetDemo } from './demoHelpers.js';

const trigger = (page) => page.getByRole('button', { name: /^Menu tài khoản của / });
const menu = (page) => page.getByRole('menu', { name: 'Chức năng tài khoản' });

for (const [width, height] of [[1440, 650], [1366, 600], [1024, 768], [768, 1024], [390, 844], [375, 667]]) {
  test(`Learner account menu fits ${width}x${height} without moving search`, async ({ page }, testInfo) => {
    await resetDemo(page);
    await page.setViewportSize({ width, height });
    await login(page, 'minhanh', '/learner/search');
    await page.evaluate(() => document.fonts.ready);
    await expect(trigger(page)).toHaveCount(1);
    await expect(trigger(page).locator('.learner-account-menu__username')).toHaveText('minhanh');
    await expect(trigger(page)).toHaveAttribute('aria-haspopup', 'menu');
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByText('Đăng xuất', { exact: true })).toHaveCount(0);
    const headerBefore = await page.getByRole('banner').boundingBox();
    const searchBefore = await page.getByRole('searchbox').boundingBox();
    const triggerBefore = await trigger(page).boundingBox();
    expect(triggerBefore.height).toBe(width > 900 ? 40 : 44);
    const avatar = await trigger(page).locator('.avatar').boundingBox();
    expect(avatar.width).toBe(28);
    expect(avatar.height).toBe(28);
    await trigger(page).click();
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
    expect(await trigger(page).boundingBox()).toEqual(triggerBefore);
    await expect(menu(page).getByRole('menuitem')).toHaveText(['Tài khoản của tôi', 'Yêu cầu học', 'Gia sư đã lưu', 'Đăng xuất']);
    await expect(page.getByText('Tài khoản Người học', { exact: true })).toBeVisible();
    const panel = page.locator('.learner-account-menu__panel');
    const box = await panel.boundingBox();
    expect(box.width).toBe(280);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(box.y).toBeGreaterThanOrEqual(headerBefore.height);
    expect(box.y + box.height).toBeLessThan(height);
    expect(await page.getByRole('banner').boundingBox()).toEqual(headerBefore);
    expect(await page.getByRole('searchbox').boundingBox()).toEqual(searchBefore);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    for (const item of await menu(page).getByRole('menuitem').all()) {
      const itemBox = await item.boundingBox();
      expect(itemBox.height).toBeGreaterThanOrEqual(44);
      expect(await item.evaluate(node => {
        const r = node.getBoundingClientRect();
        return node.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      })).toBe(true);
    }
    await page.screenshot({ path: testInfo.outputPath('account-open.png') });
    await trigger(page).click();
    await expect(menu(page)).toHaveCount(0);
    if (width <= 900) {
      const navButton = page.getByRole('button', { name: 'Mở menu', exact: true });
      await navButton.click();
      await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible();
      await trigger(page).click();
      await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeHidden();
      await expect(menu(page)).toBeVisible();
      await navButton.click();
      await expect(menu(page)).toHaveCount(0);
      await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible();
      await trigger(page).focus();
      await page.keyboard.press('ArrowDown');
      await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeHidden();
      await expect(menu(page)).toBeVisible();
    }
  });
}

test('Keyboard opens, cycles, dismisses and leaves the account menu without a focus trap', async ({ page }) => {
  await resetDemo(page);
  await login(page, 'minhanh', '/learner/search');
  const first = page.getByRole('menuitem', { name: 'Tài khoản của tôi' });
  const last = page.getByRole('menuitem', { name: 'Đăng xuất' });
  await trigger(page).focus();
  await page.keyboard.press('ArrowUp');
  await expect(last).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(first).toBeFocused();
  await page.keyboard.press('End');
  await expect(last).toBeFocused();
  await page.keyboard.press('Home');
  await expect(first).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Yêu cầu học' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu(page)).toHaveCount(0);
  await expect(trigger(page)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(first).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(menu(page)).toHaveCount(0);
  await expect(trigger(page)).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(first).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(menu(page)).toHaveCount(0);
  await expect(page.getByRole('searchbox')).toBeFocused();
  await trigger(page).click();
  await page.getByRole('searchbox').click();
  await expect(menu(page)).toHaveCount(0);
  await expect(page.getByRole('searchbox')).toBeFocused();
  await trigger(page).focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');
  await expect(page).toHaveURL(/\/learner\/dashboard$/);
  await expect(menu(page)).toHaveCount(0);
});

test('Account links use real routes, saved tutors scroll into focus, and logout retains private saved state', async ({ page }) => {
  await resetDemo(page, { savedByAccount: { 'demo-learner': ['mai-anh'] } });
  await login(page, 'minhanh', '/learner/search');
  await trigger(page).click();
  await expect(page.getByRole('menuitem', { name: 'Tài khoản của tôi' })).toHaveAttribute('href', '/learner/dashboard');
  await expect(page.getByRole('menuitem', { name: 'Yêu cầu học' })).toHaveAttribute('href', '/requests');
  await expect(page.getByRole('menuitem', { name: 'Gia sư đã lưu' })).toHaveAttribute('href', '/learner/dashboard#saved-tutors');
  await page.getByRole('menuitem', { name: 'Gia sư đã lưu' }).click();
  await expect(page).toHaveURL(/\/learner\/dashboard#saved-tutors$/);
  await expect(menu(page)).toHaveCount(0);
  await expect(page.locator('#saved-tutors')).toBeFocused();
  await expect(page.locator('#saved-tutors')).toContainText('Nguyễn Mai Anh');
  expect((await page.locator('#saved-tutors').boundingBox()).y).toBeGreaterThanOrEqual(86);
  await expect(page.locator('#saved-tutors-title')).toBeInViewport();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await trigger(page).click();
  await page.getByRole('menuitem', { name: 'Tài khoản của tôi' }).click();
  await expect(page).toHaveURL(/\/learner\/dashboard$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await trigger(page).click();
  await page.getByRole('menuitem', { name: 'Gia sư đã lưu' }).click();
  await expect(page.locator('#saved-tutors')).toBeFocused();
  await trigger(page).click();
  await page.getByRole('menuitem', { name: 'Yêu cầu học' }).click();
  await expect(page).toHaveURL(/\/requests$/);
  await expect(menu(page)).toHaveCount(0);
  const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), DOMAIN_STORAGE_KEY);
  await logout(page);
  await expect(page).toHaveURL(/\/login\?redirect=/);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), DOMAIN_STORAGE_KEY)).toEqual(before);
  await page.reload();
  await page.goto('/learner/dashboard');
  await expect(page).toHaveURL(/\/login\?redirect=/);
});

test('Parent identity and a long username come from the session and fit on mobile after reload', async ({ page }, testInfo) => {
  const username = 'phuhuynh_nguyen_thi_minh_anh';
  await resetDemo(page, { user: { ...demoReferenceData.accounts[0], username, accountType: 'parent' } });
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/learner/dashboard');
  await page.reload();
  await trigger(page).click();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.learner-account-menu__identity strong')).toHaveText(username);
  await expect(page.getByText('Tài khoản Phụ huynh', { exact: true })).toBeVisible();
  const button = await trigger(page).boundingBox();
  const hamburger = await page.getByRole('button', { name: 'Mở menu', exact: true }).boundingBox();
  expect(button.x + button.width).toBeLessThanOrEqual(hamburger.x);
  expect(hamburger.x + hamburger.width).toBeLessThanOrEqual(375);
  await page.screenshot({ path: testInfo.outputPath('parent-mobile.png') });
});
