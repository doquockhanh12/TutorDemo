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
  if (route === '/learner/schedule') {
    const paddingLeft = await page.locator('.learner-schedule-item').first().evaluate((item) => Number.parseFloat(getComputedStyle(item).paddingLeft));
    expect(paddingLeft, 'schedule rows keep an inset from the card border').toBeGreaterThanOrEqual(16);
  }
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
    '/learner/schedule',
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

test('Learner search filters by teaching level, inclusive fee range, and an exact available session', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await signIn(page, 'minhanh', '/learner/search');
  const cards = page.locator('.tutor-card');
  await expect(cards.first()).toBeVisible();
  const quickFilters = page.locator('.search-quickbar select');

  await quickFilters.nth(1).selectOption({ label: 'Tiểu Học' });
  await expect(cards).toHaveCount(1);
  await expect(cards.getByRole('heading', { name: 'Võ Thu Trang' })).toBeVisible();

  await quickFilters.nth(1).selectOption({ label: 'Tất cả cấp độ' });
  await page.getByLabel('Học phí tối thiểu mỗi buổi').fill('160000');
  await page.getByLabel('Học phí tối đa mỗi buổi').fill('180000');
  await expect(cards.getByRole('heading', { name: 'Nguyễn Mai Anh' })).toBeVisible();
  await expect(cards.getByRole('heading', { name: 'Lê Đức Minh' })).toBeVisible();
  await expect(cards.getByRole('heading', { name: 'Trần Gia Bảo' })).toHaveCount(0);
  await page.getByLabel('Học phí tối thiểu mỗi buổi').fill('200000');
  await expect(page.getByRole('alert')).toContainText('không được lớn hơn');

  await page.getByLabel('Học phí tối thiểu mỗi buổi').fill('');
  await page.getByLabel('Học phí tối đa mỗi buổi').fill('');
  const saturday = await page.evaluate(() => {
    const date = new Date();
    date.setDate(date.getDate() + ((6 - date.getDay() + 7) % 7 || 7));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  await page.locator('#search-availability-date').fill(saturday);
  await page.locator('#search-availability-time').fill('09:00');
  await expect(cards.getByRole('heading', { name: 'Nguyễn Mai Anh' })).toBeVisible();

  await page.locator('#search-availability-date').fill('');
  const yesterday = await page.evaluate(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  await page.locator('#search-availability-date').fill(yesterday);
  await expect(page.getByRole('alert')).toContainText('phải từ hôm nay trở đi');
  await page.locator('#search-availability-date').fill('');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#ket-qua').scrollIntoViewIfNeeded();
  await page.locator('.learner-results__filter').click();
  const filterPanel = page.locator('.filter-panel');
  await filterPanel.evaluate((panel) => { panel.scrollTop = panel.scrollHeight; });
  const panelScroll = await filterPanel.evaluate((panel) => ({ top: panel.scrollTop, height: panel.clientHeight, content: panel.scrollHeight }));
  expect(panelScroll.top).toBeGreaterThan(0);
  expect(panelScroll.content).toBeGreaterThan(panelScroll.height);
  await expect(page.locator('#search-availability-date')).toBeVisible();
  await expect(page.locator('.filter-panel__apply')).toBeVisible();
  const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});

test('Learner can submit one 1–5 star review after a completed request and see it on the tutor profile', async ({ page }) => {
  await signIn(page, 'minhanh', '/requests/demo-03');
  const reviewForm = page.locator('.flow-review');
  await expect(reviewForm).toBeVisible();
  await expect(reviewForm.getByRole('button', { name: '3 sao' })).toHaveAttribute('aria-pressed', 'false');
  await reviewForm.getByRole('button', { name: '4 sao' }).click();
  await reviewForm.getByLabel('Nhận xét buổi học (không bắt buộc)').fill('Giải thích rõ ràng, dễ hiểu.');
  await reviewForm.getByRole('button', { name: 'Gửi đánh giá' }).click();
  await expect(reviewForm.getByRole('status')).toContainText('4/5 sao');

  await page.reload();
  await expect(page.locator('.flow-review').getByRole('status')).toContainText('Giải thích rõ ràng, dễ hiểu.');
  await page.goto(`${appUrl}/tutors/ha-linh`);
  await expect(page.locator('.profile-reviews')).toContainText('Giải thích rõ ràng, dễ hiểu.');
  await expect(page.locator('.profile-reviews')).toContainText('4/5');
});

test('Learner profile accepts only HTTPS avatar URLs and keeps initials as the fallback', async ({ page }) => {
  await page.route('https://images.example.com/**', (route) => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="16" fill="#2465ea"/></svg>' }));
  await signIn(page, 'minhanh', '/learner/dashboard');
  const profile = page.locator('#account-profile');
  await profile.getByRole('button', { name: 'Chỉnh sửa' }).click();
  const avatarInput = profile.getByLabel('Ảnh đại diện (URL HTTPS)');
  await avatarInput.fill('http://images.example.com/avatar.svg');
  await profile.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(profile.getByRole('alert')).toContainText('HTTPS');
  await avatarInput.fill('https://images.example.com/avatar.svg');
  await profile.getByRole('button', { name: 'Lưu thay đổi' }).click();
  const avatar = page.getByRole('banner').getByRole('img', { name: 'Ảnh đại diện của Nguyễn Minh Anh' });
  await expect(avatar.locator('img')).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('tutornearme.demo-auth.v1')).user.avatarUrl)).toBe('https://images.example.com/avatar.svg');
  await page.reload();
  await expect(page.getByRole('banner').getByRole('img', { name: 'Ảnh đại diện của Nguyễn Minh Anh' }).locator('img')).toBeVisible();
});
