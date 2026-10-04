import { expect, test } from '@playwright/test';
import { resetDemo, logout } from './demoHelpers.js';

test.beforeEach(async ({ page }) => resetDemo(page));

const appUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:5173';

async function signIn(page, username, destination) {
  await page.goto(`${appUrl}/login?redirect=${encodeURIComponent(destination)}`);
  await page.getByLabel('Username / Email / Số điện thoại *').fill(username);
  await page.getByLabel('Mật khẩu *').fill('demo1234');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(`${appUrl}${destination}`);
}

async function expectNoPageOverflow(page, route) {
  await page.goto(`${appUrl}${route}`);
  await expect(page.locator('main')).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content, `horizontal page overflow at ${route}`).toBeLessThanOrEqual(dimensions.viewport);
}

test('Learner and Tutor screens avoid page overflow at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page, 'minhanh', '/learner/search');

  for (const route of [
    '/learner/search',
    '/tutors/mai-anh',
    '/requests',
    '/requests/demo-02',
    '/learner/dashboard',
    '/learner/map',
  ]) {
    await expectNoPageOverflow(page, route);
  }

  await logout(page);
  await signIn(page, 'giabao', '/tutor/dashboard');

  for (const route of [
    '/tutor/dashboard',
    '/tutor/profile',
    '/tutor/timetable',
    '/tutor/requests',
    '/tutor/requests/req-3',
    '/tutor/find-students',
    '/tutor/map',
  ]) {
    await expectNoPageOverflow(page, route);
  }

  await page.goto(`${appUrl}/tutor/timetable`);
  await page.locator('.weekly-timeline-block.lesson button').first().click();
  await expect(page.getByRole('dialog', { name: 'Chi tiết lớp học' })).toBeVisible();
  await expect(page.getByLabel('Ghi chú cho lớp học')).toBeVisible();
});

test('Learner weekly calendar does not offer past dates as selectable sessions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await signIn(page, 'minhanh', '/learner/search');
  await page.goto(`${appUrl}/tutors/mai-anh`);
  const sessionButtons = page.locator('.profile-session-table button');
  const dates = await sessionButtons.evaluateAll((buttons) => buttons.map((button) => {
    const match = button.getAttribute('aria-label')?.match(/(\d{2})\/(\d{2}) ·/);
    return match ? `${match[2]}-${match[1]}` : null;
  }).filter(Boolean));

  const today = await page.evaluate(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  });

  expect(dates.length).toBeGreaterThan(0);
  for (const date of dates) {
    const [month, day] = date.split('-').map(Number);
    const candidate = await page.evaluate(({ month, day }) => {
      const now = new Date();
      return new Date(now.getFullYear(), month - 1, day).getTime();
    }, { month, day });
    expect(candidate, `past session date ${date} remains selectable`).toBeGreaterThanOrEqual(today);
  }
});
