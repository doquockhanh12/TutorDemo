import { test, expect } from '@playwright/test';
import { resetDemo, login, logout } from './demoHelpers.js';
import { demoReferenceData } from '../../src/data/demoReferenceData.js';
test.beforeEach(async ({ page }) => resetDemo(page));

test('AUTH-001 protected navigation keeps redirect through shared login and registration', async ({ page }) => {
  await page.goto('/tutors/quoc-bao');
  await expect(page).toHaveURL(/\/login\?redirect=/);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Nhập username');
  await expect(page.getByRole('combobox')).toHaveCount(0);
  await page.getByRole('link', { name: 'Đăng ký người học', exact: true }).click();
  expect(new URL(page.url()).searchParams.get('redirect')).toBe('/tutors/quoc-bao');
  await login(page, 'minhanh', '/tutors/quoc-bao');
  await expect(page.getByRole('heading', { name: 'Trần Gia Bảo', exact: true })).toBeVisible();
  await logout(page);
  await page.goto('/login?redirect=https://example.com');
  await page.getByLabel('Username / Email / Số điện thoại *').fill('minhanh');
  await page.getByLabel('Mật khẩu *', { exact: true }).fill('demo1234');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/learner\/search$/);
});

for (const route of ['/register','/tutor/register']) {
  for (const provider of ['google','facebook']) {
    test(`AUTH-002 ${route} ${provider} prefill only available payload hides quick registration`, async ({ page }) => {
      await page.goto(route);
      await page.getByRole('button', { name: `Tiếp tục với ${provider === 'google' ? 'Google' : 'Facebook'}` }).click();
      const payload = demoReferenceData.providerPayloads[provider];
      await expect(page.getByLabel('Họ và tên *', { exact: true })).toHaveValue(payload.fullName);
      await expect(page.getByLabel(/^Email \*/)).toHaveValue(payload.email || '');
      await expect(page.getByLabel('Số điện thoại *', { exact: true })).toHaveValue(payload.phone || '');
      await expect(page.getByRole('button', { name: /Tiếp tục với/ })).toHaveCount(0);
      await expect(page.getByText('Hoặc điền thủ công', { exact: true })).toHaveCount(0);
      await expect(page.getByLabel('Mật khẩu *', { exact: true })).toHaveAttribute('required', '');
      await expect(page.getByLabel('Xác nhận mật khẩu *', { exact: true })).toHaveAttribute('required', '');
      if (provider === 'google') {
        await expect(page.getByText('Đã xác minh', { exact: true })).toBeVisible();
        await page.getByLabel(/^Email \*/).fill(demoReferenceData.accounts[0].email);
        await expect(page.getByText('Giá trị đã thay đổi — cần xác minh lại', { exact: true })).toBeVisible();
      }
    });
  }
}

test('AUTH-003 tutor subject catalog and Other conditional field', async ({ page }) => {
  await page.goto('/tutor/register');
  for (const subject of demoReferenceData.subjects) await expect(page.getByRole('checkbox', { name: subject, exact: true })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Lập trình', exact: true })).toHaveCount(0);
  await page.getByRole('checkbox', { name: 'Khác', exact: true }).check();
  await expect(page.getByLabel('Môn / kỹ năng khác *')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Khác', exact: true }).uncheck();
  await expect(page.getByLabel('Môn / kỹ năng khác *')).toHaveCount(0);
});

test('AUTH-004 phone validation invalid OTP success and ESC close', async ({ page }) => {
  await page.goto('/login');
  const trigger = page.getByRole('button', { name: 'Tiếp tục với số điện thoại' });
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('dialog').getByLabel('Số điện thoại', { exact: true }).fill('123');
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('hợp lệ');
  await page.getByRole('dialog').getByLabel('Số điện thoại', { exact: true }).fill(demoReferenceData.accounts[0].phone);
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByLabel('Mã OTP 6 chữ số').fill('000000');
  await page.getByRole('button', { name: 'Xác minh', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Mã OTP chưa đúng');
  await page.getByLabel('Mã OTP 6 chữ số').fill('123456');
  await page.getByRole('button', { name: 'Xác minh', exact: true }).click();
  await expect(page).toHaveURL(/\/learner\/search$/);
});
