import { test, expect } from '@playwright/test';
import { demoReferenceData } from '../../src/data/demoReferenceData.js';
import { resetDemo } from './demoHelpers.js';
import { login, logout } from './demoHelpers.js';

test('BUG-011 private saved tutors and requests are scoped by account ID', async ({ page }) => {
  // Synthetic ownership ID only; identity fields come from the approved fixture.
  // Setup is deterministic; no storage edits between user actions.
  await resetDemo(page, { user: { ...demoReferenceData.accounts[0], id: 'isolation-test-learner' },
    savedByAccount: { 'demo-learner': ['quoc-bao'] }, legacySaved: ['quoc-bao'] });
  await page.goto('/tutors/quoc-bao');
  await expect(page.getByRole('button', { name: 'Lưu hồ sơ', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.goto('/learner/dashboard');
  await expect(page.locator('#saved-tutors')).toContainText('Lưu lại gia sư bạn yêu thích');
  await page.goto('/requests');
  await expect(page.locator('.flow-row')).toHaveCount(0);
  await page.goto('/requests/demo-02');
  await expect(page.getByRole('heading', { name: 'Không tìm thấy yêu cầu' })).toBeVisible();
});

test('BUG-011 newly registered tutor owns profile schedule and no canonical tutor lessons', async ({ page }) => {
  const source = demoReferenceData.tutorProfiles[0];
  await resetDemo(page, { user: { ...demoReferenceData.accounts[1], id: 'registered-tutor-test', fullName: source.name,
    area: source.location, subjects: source.subjects, fee: source.price, university: source.university, duration: '90' } });
  await page.goto('/tutor/dashboard');
  await expect(page.locator('#tutor-profile-summary')).toContainText('Chưa có đánh giá');
  await page.goto('/tutor/profile');
  await page.getByLabel('THCS', { exact: true }).check();
  await page.getByRole('button', { name: 'Lưu hồ sơ demo' }).click();
  await page.goto('/tutor/timetable');
  await expect(page.locator('.weekly-timeline-block.lesson')).toHaveCount(0);
  await page.getByRole('button', { name: 'Thêm lịch rảnh Thứ 2', exact: true }).click();
  await page.getByLabel('Giờ bắt đầu theo định dạng 24 giờ').fill('08:00');
  await page.getByRole('button', { name: 'Thêm vào lịch nháp' }).click();
  await page.getByRole('button', { name: 'Lưu lịch', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã lưu lịch rảnh' })).toBeVisible();
  await logout(page);
  await login(page, 'minhanh', '/tutors/registered-tutor-test');
  await expect(page.getByRole('heading', { name: source.name, exact: true })).toBeVisible();
  await expect(page.locator('.profile-identity')).toContainText('Chưa có đánh giá');
  await expect(page.getByRole('button', { name: /05\/10 · 08:00–09:30/ })).toBeEnabled();
});
