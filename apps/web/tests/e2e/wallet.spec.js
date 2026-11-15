import { test, expect } from '@playwright/test';
import { resetDemo, login } from './demoHelpers.js';

test.use({ channel: 'chrome' });
const testResult = (page, name) => page.getByRole('group', { name: 'Kiểm thử trạng thái' }).getByRole('button', { name, exact: true });
for (const width of [1440, 390]) {
  test(`wallet demo menu topup withdrawal retry persistence at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = []; page.on('pageerror', (error) => errors.push(error.message));
    await resetDemo(page);
    // Persisted recipients remain usable; account-link creation is no longer exposed.
    await page.addInitScript(() => {
      const key = 'tnm.demo.wallet.v1:demo-learner';
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({
        accountId: 'demo-learner', balance: 0, transactions: [], bankLinkSessions: [],
        linkedAccounts: [{ id: 'qa-recipient', provider: 'techcombank', providerName: 'Techcombank', maskedNumber: '\u2022\u2022\u2022\u2022 1234', canWithdraw: true }],
      }));
    });
    await login(page, 'minhanh', '/learner/search');
    await page.getByRole('button', { name: /^Menu tài khoản của/ }).click();
    await page.getByRole('menuitem', { name: 'Ví của tôi', exact: true }).click();
    await expect(page).toHaveURL(/\/learner\/wallet$/);
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(page.getByText('Chưa có giao dịch', { exact: true })).toBeVisible();
    await expect(page.getByTestId('wallet-available')).toContainText('0');
    await page.getByRole('button', { name: /^Menu tài khoản của/ }).click();
    await expect(page.getByRole('menuitem', { name: 'Ví của tôi', exact: true })).toHaveAttribute('aria-current', 'page');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Nạp tiền', exact: true }).click();
    await page.getByLabel('Số tiền (VND)').fill('500000');
    await page.getByRole('dialog').locator('form').evaluate((form) => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Chờ thanh toán', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('img', { name: 'Mã QR', exact: true })).toBeVisible();
    await expect(testResult(page, 'Thành công')).toBeEnabled();
    await expect(page.locator('.learner-wallet-transaction')).toHaveCount(1);
    await dialog.screenshot({ path: `test-results/wallet-qr-${width}.png` });
    await testResult(page, 'Thành công').click();
    await expect(dialog.getByText('Thành công', { exact: true })).toBeVisible();
    await expect(page.getByTestId('wallet-available')).toContainText('500.000');
    await dialog.getByRole('button', { name: 'Đóng giao dịch' }).click();
    await page.getByRole('button', { name: 'Rút tiền', exact: true }).click();
    await expect(page.getByLabel('Tài khoản nhận tiền')).toContainText('Techcombank · •••• 1234');
    await dialog.screenshot({ path: `test-results/wallet-withdrawal-${width}.png` });
    await page.getByLabel('Số tiền (VND)').fill('500001');
    await page.getByRole('button', { name: 'Xác nhận rút tiền', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText('vượt số dư');
    await page.getByLabel('Số tiền (VND)').fill('200000');
    // Fire two submits in the same turn to exercise the synchronous in-flight lock.
    await page.getByRole('dialog').locator('form').evaluate((form) => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await expect(dialog.getByText('Đang xử lý', { exact: true })).toBeVisible();
    await expect(page.getByTestId('wallet-available')).toContainText('300.000');
    await expect(page.locator('.learner-wallet-transaction')).toHaveCount(2);
    await page.reload();
    await expect(page.getByTestId('wallet-available')).toContainText('300.000');
    await page.locator('.learner-wallet-transaction').first().click();
    await expect(dialog.getByText('Đang xử lý', { exact: true })).toBeVisible();
    await testResult(page, 'Thành công').click();
    await expect(dialog.getByText('Thành công', { exact: true })).toBeVisible();
    await expect(page.getByTestId('wallet-available')).toContainText('300.000');
    await dialog.getByRole('button', { name: 'Đóng giao dịch' }).click();
    await page.getByRole('button', { name: 'Rút tiền', exact: true }).click();
    await page.getByLabel('Số tiền (VND)').fill('50000');
    await page.getByRole('button', { name: 'Xác nhận rút tiền', exact: true }).click();
    await expect(page.getByTestId('wallet-available')).toContainText('250.000');
    await testResult(page, 'Thất bại').click();
    await expect(dialog.getByText('Thất bại', { exact: true })).toBeVisible();
    await expect(page.getByTestId('wallet-available')).toContainText('300.000');
    await dialog.getByRole('button', { name: 'Đóng giao dịch' }).click();
    for (const [button, status] of [['Hết hạn', 'Hết hạn'], ['Thất bại', 'Thất bại']]) {
      await page.getByRole('button', { name: 'Nạp tiền', exact: true }).click();
      await page.getByLabel('Số tiền (VND)').fill('100000');
      await page.getByRole('button', { name: 'Tạo mã QR', exact: true }).click();
      await testResult(page, button).click();
      await expect(dialog.getByText(status, { exact: true })).toBeVisible();
      await expect(page.getByTestId('wallet-available')).toContainText('300.000');
      if (status === 'Hết hạn') {
        const expiredId = await dialog.locator('dd').first().textContent();
        await dialog.getByRole('button', { name: 'Tạo lại giao dịch', exact: true }).click();
        await page.getByRole('button', { name: 'Tạo mã QR', exact: true }).click();
        await expect(testResult(page, 'Thành công')).toBeEnabled();
        expect(await dialog.locator('dd').first().textContent()).not.toBe(expiredId);
        await testResult(page, 'Hết hạn').click();
        await expect(dialog.getByText('Hết hạn', { exact: true })).toBeVisible();
      }
      await dialog.getByRole('button', { name: 'Đóng giao dịch' }).click();
    }
    await page.reload();
    await expect(page.getByTestId('wallet-available')).toContainText('300.000');
    await expect(page.locator('.learner-wallet-transaction')).toHaveCount(6);
    await expect(page.locator('.learner-wallet-transaction-copy small')).toHaveCount(6);
    for (const label of ['Ví demo', 'QR demo', 'Mock', 'Mô phỏng', 'Dữ liệu mẫu']) await expect(page.locator('body')).not.toContainText(label);
    // Force only wallet reads to fail: show retry without altering persisted balances.
    await page.evaluate(() => {
      const original = Storage.prototype.getItem;
      window.walletReadFails = true;
      Storage.prototype.getItem = function (key) {
        if (window.walletReadFails && key.startsWith('tnm.demo.wallet.v1:')) throw new Error('QA read error');
        return original.call(this, key);
      };
    });
    await page.getByRole('button', { name: 'Tải lại lịch sử giao dịch' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Đang tải ví' })).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('Không tải');
    await page.evaluate(() => { window.walletReadFails = false; });
    await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
    await expect(page.getByTestId('wallet-available')).toContainText('300.000');
    await expect(page.locator('.learner-wallet-transaction')).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.screenshot({ path: `test-results/wallet-history-${width}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}

test('wallet protected route and old wallet query redirect', async ({ page }) => {
  await resetDemo(page);
  await page.goto('/learner/wallet');
  await expect(page).toHaveURL(/\/login\?redirect=%2Flearner%2Fwallet/);
  await login(page, 'minhanh', '/learner/wallet');
  await page.goto('/learner/dashboard?tab=wallet');
  await expect(page).toHaveURL(/\/learner\/wallet$/);
});

test('link account is a coming-soon notice on desktop and mobile without provider choices', async ({ page }) => {
  await resetDemo(page);
  await login(page, 'minhanh', '/learner/wallet');
  await expect(page.getByText('Chưa có giao dịch', { exact: true })).toBeVisible();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByText('Chưa liên kết', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Liên kết tài khoản', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Tính năng liên kết tài khoản sẽ sớm khả dụng.');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    for (const provider of ['BIDV', 'MoMo', 'Techcombank']) await expect(page.getByText(provider, { exact: true })).toHaveCount(0);
    for (const action of ['Nạp tiền', 'Rút tiền']) {
      await page.getByRole('button', { name: action, exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.screenshot({ path: `test-results/wallet-coming-soon-${width}.png`, fullPage: true });
  }
  expect(await page.evaluate(() => localStorage.getItem('tnm.demo.wallet.v1:demo-learner'))).toBeNull();
  await page.goto('/learner/wallet?bankLink=old-session');
  await expect(page.getByText('Chưa liên kết', { exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

