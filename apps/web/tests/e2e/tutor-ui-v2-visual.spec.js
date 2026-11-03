import { test, expect } from '@playwright/test';
import { resetDemo, login } from './demoHelpers.js';

test('Tutor UI V2 visual review at desktop, mobile and dark theme', async ({ page }) => {
  await resetDemo(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await login(page, 'giabao', '/tutor/profile');
  const sidebarWidths = [];
  for (const route of ['profile', 'dashboard', 'timetable', 'messages', 'reviews', 'classes', 'wallet']) {
    await page.goto(`/tutor/${route}`);
    sidebarWidths.push(await page.locator('.tutor-sidebar').evaluate((element) => element.getBoundingClientRect().width));
    await expect(page.locator('.tutor-sidebar__nav .is-active')).toHaveCount(1);
  }
  expect(new Set(sidebarWidths).size).toBe(1);
  await page.goto('/tutor/profile');
  await page.getByRole('combobox', { name: 'Tìm chuyên môn' }).fill('machine learning');
  await expect(page.getByRole('option', { name: /Machine Learning/ })).toBeVisible();
  await page.screenshot({ path: 'test-results/tutor-v2-profile-desktop.png', fullPage: true });
  await page.goto('/tutor/timetable');
  const timeline = page.getByRole('region', { name: /Lịch dạy và lịch rảnh của gia sư/ });
  await timeline.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await timeline.screenshot({ path: 'test-results/tutor-v2-timetable-bottom.png' });
  for (const route of ['messages', 'reviews']) {
    await page.goto(`/tutor/${route}`);
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.screenshot({ path: `test-results/tutor-v2-${route}-dark.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tutor/classes');
  await expect(page.locator('body')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: 'test-results/tutor-v2-classes-mobile-dark.png' });
});
