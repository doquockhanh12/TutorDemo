import { test, expect } from '@playwright/test';
import { login, logout, resetDemo } from './demoHelpers.js';

test('UI-QA-001 mobile Tutor request text retains readable width beside status', async ({ page }, testInfo) => {
  await resetDemo(page);
  await page.setViewportSize({ width: 390, height: 900 });
  await login(page, 'giabao', '/tutor/requests');
  const title = page.getByText('Tiếng Anh · Nguyễn Minh Anh', { exact: true });
  await expect(title).toBeVisible();
  const bounds = await title.boundingBox();
  expect(bounds.width, 'status must not compress the subject/learner column to a few characters').toBeGreaterThanOrEqual(150);
  await expect(page.locator('.flow-row').first().getByText('Đã nhận', { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('mobile-request-rows.png'), fullPage: true });
});

for (const width of [1440, 1024, 390]) {
  test(`UI-QA all connected screens at ${width}px without overflow or browser errors`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await resetDemo(page);
    await page.setViewportSize({ width, height: 900 });
    const errors = []; const resources = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      if (/Failed to load resource/.test(message.text()) && /images\.unsplash\.com/.test(message.location().url)) resources.push(message.text());
      else errors.push(message.text());
    });
    const check = async (route, expected = route) => {
      await page.goto(route);
      await expect(page.locator('main')).toBeVisible();
      await expect(page).toHaveURL((url) => url.pathname === expected.split('?')[0]);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), { message: `page overflow: ${route} at ${width}` }).toBeLessThanOrEqual(1);
      await page.screenshot({ path: testInfo.outputPath(route.replace(/[^a-z0-9]+/gi, '-') + '.png'), fullPage: true });
    };
    for (const route of ['/', '/learner', '/tutor', '/login', '/register', '/tutor/register']) await check(route);
    await page.goto('/login');
    await page.getByRole('button', { name: 'Tiếp tục với số điện thoại' }).click();
    const phone = page.getByRole('dialog');
    await expect(phone).toBeVisible();
    const bounds = await phone.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    await page.screenshot({ path: testInfo.outputPath('phone-modal.png') });
    await page.keyboard.press('Escape');
    await login(page, 'minhanh', '/learner/search');
    for (const route of ['/learner/search','/learner/dashboard','/tutors/quoc-bao','/requests','/requests/demo-02']) await check(route);
    await check('/requests/new?tutor=quoc-bao', '/tutors/quoc-bao');
    await logout(page);
    await login(page, 'giabao', '/tutor/dashboard');
    for (const route of ['/tutor/dashboard','/tutor/income','/tutor/profile','/tutor/timetable','/tutor/find-students','/tutor/requests','/tutor/requests/req-1']) await check(route);
    await check('/tutor/availability', '/tutor/timetable');
    await check('/tutor/lessons', '/tutor/timetable');
    await page.getByRole('button', { name: /Toán.*N.M.A/ }).click();
    const lesson = page.getByRole('dialog', { name: 'Chi tiết lớp học' });
    await expect(lesson).toBeVisible();
    const lessonBounds = await lesson.boundingBox();
    expect(lessonBounds.x).toBeGreaterThanOrEqual(0);
    expect(lessonBounds.x + lessonBounds.width).toBeLessThanOrEqual(width);
    expect(lessonBounds.y + lessonBounds.height).toBeLessThanOrEqual(900);
    await page.screenshot({ path: testInfo.outputPath('lesson-modal.png') });
    await page.keyboard.press('Escape');
    await testInfo.attach('external-image-errors', { body: JSON.stringify(resources), contentType: 'application/json' });
    expect(errors, 'uncaught errors or React/DOM console errors').toEqual([]);
  });
}
