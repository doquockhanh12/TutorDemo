import { expect, test } from '@playwright/test';
import { login, logout, resetDemo } from './demoHelpers.js';

test.beforeEach(async ({ page }) => resetDemo(page, { savedByAccount: { 'demo-learner': [] } }));

for (const [width, height] of [[1440, 650], [1366, 600], [1024, 768], [768, 1024], [390, 844], [375, 667]]) {
  test(`Learner search controls fit the first viewport at ${width}x${height}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await login(page, 'minhanh', '/learner/search');
    await expect(page.getByRole('heading', { name: 'Tìm gia sư phù hợp với bạn' })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const search = await page.getByRole('searchbox', { name: 'Tên hoặc từ khóa' }).boundingBox();
    expect(search.y).toBeGreaterThan(0);
    expect(search.y + search.height).toBeLessThan(height);
    const submit = await page.getByRole('button', { name: 'Tìm gia sư', exact: true }).boundingBox();
    expect(submit.y + submit.height).toBeLessThan(height);
    expect(submit.height).toBeGreaterThanOrEqual(44);
    const hero = await page.locator('.learner-search-hero').boundingBox();
    expect(hero.height).toBeLessThanOrEqual(width >= 1024 ? 280 : 340);
    if (width >= 1366) {
      expect((await page.locator('.tutor-card').first().boundingBox()).y).toBeLessThan(height);
      for (const name of ['Môn học', 'Khu vực', 'Thời gian rảnh']) {
        expect((await page.getByRole('button', { name: new RegExp(`^${name}`) }).boundingBox()).y).toBeLessThan(height);
      }
    }
    if (width < 768) await expect(page.getByRole('button', { name: 'Bộ lọc', exact: true })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    const clipped = await page.locator('main button:visible, main input:visible, main select:visible').evaluateAll(nodes => nodes.filter(node => {
      const rect = node.getBoundingClientRect();
      return rect.left < 0 || rect.right > innerWidth + 1;
    }).map(node => node.outerHTML));
    expect(clipped, 'individual controls must fit even when the page clips overflow').toEqual([]);
    await page.screenshot({ path: testInfo.outputPath('search.png'), fullPage: true });
    if (width >= 1366) {
      await page.getByRole('button', { name: /^Môn học/ }).click();
      const options = page.locator('.search-filter.is-open .search-filter__options');
      const bounds = await options.boundingBox();
      expect(bounds.y).toBeGreaterThanOrEqual(72);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(height);
      await options.getByRole('checkbox', { name: 'Hóa học', exact: true }).scrollIntoViewIfNeeded();
      await expect(options.getByRole('checkbox', { name: 'Hóa học', exact: true })).toBeInViewport();
      await page.screenshot({ path: testInfo.outputPath('subject-dropdown.png') });
    }
  });
}

test('Search preserves multi-select OR/AND filtering, sorting and empty reset', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 650 });
  await login(page, 'minhanh', '/learner/search');
  const cards = page.locator('.tutor-card');
  const names = cards.locator('h3');
  await expect(cards).toHaveCount(6);
  await page.getByRole('searchbox').fill('Toán');
  await expect(names).toHaveText(['Nguyễn Mai Anh', 'Lê Đức Minh', 'Đặng Gia Huy']);
  await page.getByRole('searchbox').fill('');
  const subject = page.getByRole('button', { name: /^Môn học/ });
  await subject.click();
  await page.getByRole('checkbox', { name: 'Toán', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Ngữ văn', exact: true }).check();
  await expect(cards).toHaveCount(5);
  await expect(subject).toContainText('2 đã chọn');
  await page.keyboard.press('Escape');
  await expect(subject).toBeFocused();
  await expect(subject).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: /^Khu vực/ }).click();
  await page.getByRole('checkbox', { name: 'Thủ Đức', exact: true }).check();
  await page.getByRole('button', { name: /^Thời gian rảnh/ }).click();
  await page.getByRole('checkbox', { name: 'Buổi tối', exact: true }).check();
  await page.getByLabel('Học phí tối đa').selectOption('160000');
  await expect(names).toHaveText(['Đặng Gia Huy']);
  await page.getByRole('button', { name: 'Bỏ môn học: Toán', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Chưa tìm thấy gia sư phù hợp' })).toBeVisible();
  await page.getByRole('button', { name: 'Đặt lại bộ lọc' }).click();
  await expect(cards).toHaveCount(6);
  await expect(page.getByRole('button', { name: 'Xóa bộ lọc', exact: true })).toBeDisabled();
  await page.getByLabel('Sắp xếp', { exact: true }).selectOption('price');
  await expect(names).toHaveText(['Đặng Gia Huy', 'Phạm Hà Linh', 'Lê Đức Minh', 'Nguyễn Mai Anh', 'Võ Thu Trang', 'Trần Gia Bảo']);
  await page.getByLabel('Sắp xếp', { exact: true }).selectOption('rating');
  await expect(names.first()).toHaveText('Nguyễn Mai Anh');
  await page.getByRole('searchbox').fill('Ngoại thương');
  await page.getByRole('searchbox').press('Enter');
  await expect(names).toHaveText(['Trần Gia Bảo']);
  await expect(page.getByRole('region', { name: 'Kết quả tìm gia sư' })).toBeFocused();
});

test('Mobile has one filter set, traps focus and releases scroll when resized', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await login(page, 'minhanh', '/learner/search');
  const trigger = page.getByRole('button', { name: /^Bộ lọc(?: \(\d+\))?$/ });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Bộ lọc gia sư' });
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole('button', { name: 'Đóng bộ lọc' });
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: /^Xem \d+ gia sư$/ })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await expect(page.getByRole('checkbox', { name: 'Toán', exact: true })).toHaveCount(1);
  await dialog.getByRole('checkbox', { name: 'Toán', exact: true }).check();
  await dialog.getByRole('checkbox', { name: 'Thủ Đức', exact: true }).check();
  await dialog.getByRole('checkbox', { name: 'Buổi tối', exact: true }).check();
  await dialog.getByLabel('Học phí tối đa').selectOption('160000');
  await page.screenshot({ path: testInfo.outputPath('mobile-filters.png') });
  await dialog.getByRole('button', { name: 'Xem 1 gia sư', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.tutor-card h3')).toHaveText(['Đặng Gia Huy']);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  await expect(page.getByRole('button', { name: /^Môn học/ })).toBeVisible();
});

test('Learner navigation, saved tutors and profile links survive reload', async ({ page }) => {
  await login(page, 'minhanh', '/learner/search');
  const nav = page.getByRole('navigation', { name: 'Điều hướng chính' });
  await expect(nav.getByRole('link', { name: 'Tìm gia sư', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'Trở thành Gia Sư', exact: true })).toHaveCount(0);
  const save = page.getByRole('button', { name: 'Lưu Nguyễn Mai Anh', exact: true });
  await save.click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Bỏ lưu Nguyễn Mai Anh', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.tutor-card').filter({ hasText: 'Nguyễn Mai Anh' }).getByRole('link', { name: 'Xem hồ sơ' }).click();
  await expect(page).toHaveURL(/\/tutors\/mai-anh$/);
  await nav.getByRole('link', { name: 'Yêu cầu học', exact: true }).click();
  await expect(page).toHaveURL(/\/requests$/);
  await expect(nav.getByRole('link', { name: 'Yêu cầu học', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: 'Menu tài khoản của minhanh' }).click();
  await page.getByRole('menuitem', { name: 'Tài khoản của tôi' }).click();
  await expect(page).toHaveURL(/\/learner\/dashboard$/);
  await expect(page.locator('#saved-tutors')).toContainText('Nguyễn Mai Anh');
  await logout(page);
  await expect(page).toHaveURL(/\/login/);
  await page.goto('/learner');
  await expect(page.locator('.public-hero--learner')).toBeVisible();
  await expect(page.locator('.learner-search-hero')).toHaveCount(0);
  await expect(page.locator('header.learner-app-header')).toHaveCount(0);
  await page.goto('/tutor');
  await expect(page.locator('.public-hero--tutor')).toBeVisible();
});
