import { test, expect, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function loginAndNavigateToChat(page: Page): Promise<string> {
  const fixturePath = path.join(process.cwd(), 'e2e', 'fixtures', 'test-user.json');
  const { email, password } = JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as {
    id: string;
    email: string;
    password: string;
  };

  await page.goto('/signin');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();

  await page.waitForURL(/\/(onboarding|chat\/)/, { timeout: 15_000 });

  if (page.url().includes('/onboarding')) {
    await page.getByRole('button', { name: /skip/i }).click();
    await page.waitForURL(/\/chat\//, { timeout: 15_000 });
  }

  expect(page.url()).toContain('/chat/');
  return page.url();
}

test('send message, wait for AI response, verify persistence', async ({ page }) => {
  // Step 1: Login and navigate to chat
  const chatUrl = await loginAndNavigateToChat(page);

  const testMessage = 'Hello Rise, this is an E2E test message.';

  // Step 2: Fill message input
  await page.locator('[aria-label="Message input"]').fill(testMessage);

  // Step 3: Click send button
  await page.locator('[aria-label="Send message"]').click();

  // Step 4: Verify user message visible
  await expect(page.getByText(testMessage)).toBeVisible({ timeout: 10_000 });

  // Step 5: Wait for 'Rise is typing' to appear then disappear (30s timeout)
  await expect(page.getByText(/rise is typing/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/rise is typing/i)).toBeHidden({ timeout: 30_000 });

  // Step 6: Verify at least one message bubble after the user message
  const messageBubbles = page.locator('[data-role="assistant"]');
  await expect(messageBubbles.first()).toBeVisible({ timeout: 10_000 });

  // Step 7: Reload page, wait for same chat URL
  await page.reload();
  await page.waitForURL(chatUrl, { timeout: 15_000 });

  // Step 8: Verify user message text still visible
  await expect(page.getByText(testMessage)).toBeVisible({ timeout: 10_000 });

  // Step 9: Verify at least 2 message elements visible after reload
  const allMessages = page.locator('[data-role="user"], [data-role="assistant"]');
  const messageCount = await allMessages.count();
  expect(messageCount).toBeGreaterThan(1);
});
