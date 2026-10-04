import { test, expect } from '@playwright/test';
import { login, resetDemo } from './demoHelpers.js';
import { createDemoState, decideRequest } from '../../src/features/domain/demoDomain.js';

function legacyWeek() {
  const referenceTime = new Date('2026-10-04T10:00:00+07:00');
  const state = createDemoState(referenceTime);
  state.lessons = state.lessons.filter((lesson) => !lesson.id.startsWith('history-'));
  const accepted = decideRequest(state, 'req-1', 'accepted', 'quoc-bao').state;
  accepted.lessons[0].status = 'completed';
  delete accepted.lessons[0].sessionFee;
  accepted.availability = accepted.availability.filter((range) => range.date !== '2026-10-02');
  accepted.availability.push({ id: 'runtime-friday-range', tutorId: 'quoc-bao', date: '2026-10-02', start: 1095, end: 1320 });
  return { state: accepted, referenceTime };
}

test('SCHED-005 approved cleanup keeps Thursday English and Friday IELTS across reload', async ({ page }, testInfo) => {
  const setup = legacyWeek();
  delete setup.state.appliedDemoCleanups;
  await resetDemo(page, setup);
  await login(page, 'giabao', '/tutor/timetable');
  await expect(page.getByRole('heading', { name: 'Lịch dạy học', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Toán lớp 8 Phụ huynh bé An 2026-10-01/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Toán lớp 8 Phụ huynh bé An 2026-09-29/ })).toBeVisible();
  await page.getByRole('button', { name: /Tiếng Anh Nguyễn Minh Anh.*2026-10-01/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Nguyễn Minh Anh');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /Lịch rảnh 2026-10-02 18:/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Lịch rảnh 2026-10-02 19:45/ })).toHaveCount(0);
  await page.getByRole('button', { name: /IELTS Học sinh THPT.*2026-10-02/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Học sinh THPT');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('approved-demo-cleanup.png'), fullPage: true });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Lịch dạy học', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Toán lớp 8 Phụ huynh bé An 2026-10-01/ })).toHaveCount(0);
});

test('SCHED-003 restoring the previous demo week cuts IELTS out of saved Friday availability', async ({ page }) => {
  await resetDemo(page, legacyWeek());
  await login(page, 'giabao', '/tutor/timetable');
  await expect(page.getByRole('heading', { name: 'Lịch dạy học', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lịch rảnh 2026-10-02 18:15–22:00', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Lịch rảnh 2026-10-02 18:15–19:00', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lịch rảnh 2026-10-02 19:45–22:00', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /IELTS Học sinh THPT.*2026-10-02/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Lịch rảnh 2026-10-02 18:15–22:00', exact: true })).toHaveCount(0);
});

for (const width of [1440, 1024, 390]) {
  test(`SCHED-004 persisted overlapping lessons remain separately readable and clickable at ${width}px`, async ({ page }, testInfo) => {
    await resetDemo(page, legacyWeek());
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await login(page, 'giabao', '/tutor/timetable');
    const english = page.getByRole('button', { name: /Tiếng Anh Nguyễn Minh Anh.*2026-10-01/ });
    const math = page.getByRole('button', { name: /Toán lớp 8 Phụ huynh bé An 2026-10-01/ });
    await english.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath('overlapping-lessons.png') });
    const first = await english.boundingBox();
    const second = await math.boundingBox();
    const intersects = first.x < second.x + second.width && first.x + first.width > second.x && first.y < second.y + second.height && first.y + first.height > second.y;
    expect(intersects, 'both Lesson hit targets must remain visible, never stacked over one another').toBe(false);
    expect(Math.min(first.width, second.width), 'overlap lanes must not squeeze readable content').toBeGreaterThanOrEqual(110);
    await expect(page.getByRole('alert')).toContainText('Trùng lịch');
    await expect(page.getByRole('alert')).toContainText('Nguyễn Minh Anh');
    await expect(page.getByRole('alert')).toContainText('Phụ huynh bé An');
    const alertTitle = await page.getByRole('alert').locator('strong').boundingBox();
    const alertBody = await page.getByRole('alert').locator('p').boundingBox();
    expect(alertBody.y, 'conflict explanation must wrap below its heading, not squeeze beside it').toBeGreaterThanOrEqual(alertTitle.y + alertTitle.height);
    const alertBounds = await page.getByRole('alert').boundingBox();
    const conflictRow = await page.getByRole('alert').getByRole('listitem').first().boundingBox();
    expect(conflictRow.x - alertBounds.x, 'list markers must stay inside the alert border').toBeGreaterThanOrEqual(24);
    for (const [button, learner] of [[english, 'Nguyễn Minh Anh'], [math, 'Phụ huynh bé An']]) {
      await button.click();
      await expect(page.getByRole('dialog')).toContainText(learner);
      await page.keyboard.press('Escape');
    }
    await page.getByRole('button', { name: 'Mở chi tiết 18:00', exact: true }).click();
    const expandedFirst = await english.boundingBox();
    const expandedSecond = await math.boundingBox();
    expect(expandedFirst.x + expandedFirst.width).toBeLessThanOrEqual(expandedSecond.x);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test('INCOME-002 completed legacy Lesson explains its fee and accounting month without appearing in the wrong month', async ({ page }) => {
  await resetDemo(page, legacyWeek());
  await login(page, 'giabao', '/tutor/timetable');
  await page.getByRole('button', { name: /Toán N.M.A.*Hoàn tất 2026-09-29/ }).click();
  const modal = page.getByRole('dialog');
  await expect(modal).toContainText('29/09/2026');
  await expect(modal).toContainText('220.000đ / buổi');
  await expect(modal).toContainText('thu nhập tháng 09/2026');
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: 'Thu nhập', exact: true }).click();
  await expect(page.getByLabel('Tổng quan thu nhập tháng hiện tại')).toContainText('660.000đ');
  await expect(page.getByRole('table')).not.toContainText('N.M.A');
  await expect(page.getByLabel('Giá trị thu nhập theo tháng').getByRole('listitem').nth(4)).toContainText('1.100.000đ');
});
