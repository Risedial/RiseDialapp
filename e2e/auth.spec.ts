import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('login, cookie persistence, and reload', async ({ page, context }) => {
  // Read fixture credentials
  const fixturePath = path.join(process.cwd(), 'e2e', 'fixtures', 'test-user.json');
  const { email, password } = JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as {
    id: string;
    email: string;
    password: string;
  };

  // Step 1: Navigate to /signin and fill credentials
  await page.goto('/signin');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();

  // Step 2: Wait for /onboarding or /chat/ URL pattern
  await page.waitForURL(/\/(onboarding|chat\/)/, { timeout: 15_000 });

  // Step 3: If /onboarding, click Skip and wait for /chat/**
  if (page.url().includes('/onboarding')) {
    await page.getByRole('button', { name: /skip/i }).click();
    await page.waitForURL(/\/chat\//, { timeout: 15_000 });
  }

  // Step 4: Verify risedial_session cookie exists
  const cookies = await context.cookies();
  const sessionCookie = cookies.find((c) => c.name === 'risedial_session');
  expect(sessionCookie).toBeDefined();

  // Step 5: Capture chat URL
  const chatUrl = page.url();
  expect(chatUrl).toContain('/chat/');

  // Step 6: Reload page, wait for same URL
  await page.reload();
  await page.waitForURL(chatUrl, { timeout: 15_000 });

  // Step 7: Verify page is NOT /signin and IS on /chat/
  expect(page.url()).not.toContain('/signin');
  expect(page.url()).toContain('/chat/');

  // Step 8: Verify 'Online' text visible
  await expect(page.getByText(/online/i)).toBeVisible({ timeout: 10_000 });
});
