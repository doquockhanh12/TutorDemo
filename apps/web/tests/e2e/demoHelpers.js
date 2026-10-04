import { expect } from '@playwright/test';
import { createDemoState, DOMAIN_STORAGE_KEY } from '../../src/features/domain/demoDomain.js';

export const fixedTime = new Date('2026-10-05T06:00:00+07:00');

export async function resetDemo(page, options = {}) {
  const referenceTime = options.referenceTime || fixedTime;
  await page.clock.install({ time: referenceTime });
  const workspace = options.state || createDemoState(referenceTime);
  if (options.lessons) workspace.lessons = options.lessons;
  if (options.savedByAccount) workspace.savedByAccount = options.savedByAccount;
  await page.addInitScript(({ seed, key: domainKey, options }) => {
    if (sessionStorage.getItem('tnm.e2e.initialized')) return;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('tnm.') || key === 'tutornearme.demo-auth.v1') localStorage.removeItem(key);
    }
    sessionStorage.removeItem('tutornearme.demo-auth.v1');
    localStorage.setItem(domainKey, JSON.stringify(seed));
    if (options.user) localStorage.setItem('tutornearme.demo-auth.v1', JSON.stringify({ user: options.user, accounts: [] }));
    if (options.legacySaved) localStorage.setItem('tnm.savedTutors', JSON.stringify(options.legacySaved));
    sessionStorage.setItem('tnm.e2e.initialized', 'true');
  }, { seed: workspace, key: DOMAIN_STORAGE_KEY, options });
}

export async function login(page, username, destination) {
  await page.goto(`/login?redirect=${encodeURIComponent(destination)}`);
  await page.getByLabel('Username / Email / Số điện thoại *').fill(username);
  await page.getByLabel('Mật khẩu *', { exact: true }).fill('demo1234');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${destination}$`));
}

export async function logout(page) {
  if (await page.getByRole('button', { name: 'Đăng xuất', exact: true }).count() === 0) {
    await page.getByRole('button', { name: 'Mở menu', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
}
