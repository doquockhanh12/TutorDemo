import { test, expect } from '@playwright/test';
import { login, resetDemo } from './demoHelpers.js';

const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==', 'base64');

test('tutor profile selects catalog subjects, previews private images and saves independent learner groups', async ({ page }) => {
  await resetDemo(page);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await login(page, 'giabao', '/tutor/profile');
  await page.getByLabel('Tìm môn học hoặc kỹ năng').fill('mĩ thuật');
  await page.locator('.profile-subjects__options').getByRole('button', { name: 'Vẽ', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Bỏ Vẽ' })).toBeVisible();
  await page.getByLabel('Tìm môn học hoặc kỹ năng').fill('Thiết kế Canva nâng cao');
  await page.getByRole('button', { name: /Đề xuất thêm/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Gửi đề xuất' }).click();
  await expect(page.getByRole('status')).toContainText('Đề xuất của bạn đã được gửi');
  await expect(page.getByRole('button', { name: 'Bỏ Thiết kế Canva nâng cao' })).toHaveCount(0);
  await page.getByLabel('Mọi độ tuổi').check();
  await expect(page.getByLabel('THCS')).not.toBeChecked();
  await page.getByLabel('Sinh viên').check();
  await expect(page.getByLabel('Mọi độ tuổi')).not.toBeChecked();
  await page.getByLabel('Chọn ảnh đại diện').setInputFiles({ name: 'not-an-image.txt', mimeType: 'text/plain', buffer: Buffer.from('invalid') });
  await expect(page.getByRole('alert')).toContainText('Chỉ chọn ảnh tối đa 5 MB');
  await page.getByLabel('Chọn ảnh đại diện').setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: tinyPng });
  await page.getByLabel('Chọn cccd mặt trước').setInputFiles({ name: 'front.png', mimeType: 'image/png', buffer: tinyPng });
  await expect(page.getByAltText('Xem trước ảnh đại diện')).toBeVisible();
  await expect(page.getByAltText('Xem trước cccd mặt trước')).toBeVisible();
  await page.screenshot({ path: 'test-results/tutor-profile-update-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Lưu hồ sơ', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Bỏ Vẽ' })).toBeVisible();
  await expect(page.getByLabel('Sinh viên')).toBeChecked();
  await expect(page.getByAltText('Xem trước cccd mặt trước')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('profile and timetable remain readable on mobile dark mode', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await resetDemo(page);
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await login(page, 'giabao', '/tutor/profile');
  await page.screenshot({ path: 'test-results/tutor-profile-update-mobile-dark.png', fullPage: true });
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.goto('/tutor/timetable');
  await page.screenshot({ path: 'test-results/tutor-timetable-dark.png', fullPage: true });
  await expect(page.locator('.weekly-timeline-block.availability').first()).toHaveCSS('color', 'rgb(117, 212, 164)');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
});
