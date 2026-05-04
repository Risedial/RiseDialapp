import { test, expect } from '@playwright/test';
import crypto from 'crypto';

const SKIP = process.env.SKIP_STRIPE_E2E === 'true';

test('full signup flow with Stripe test card', async ({ page }) => {
  test.skip(SKIP, 'Skipped because SKIP_STRIPE_E2E=true');

  // Step 1: Navigate to /signin and switch to Create Account mode
  await page.goto('/signin');
  await page.getByRole('button', { name: /create account/i }).click();

  // Step 2: Fill a new unique email and password, submit → wait for /plan-selection
  const uniqueHex = crypto.randomBytes(4).toString('hex');
  const email = `signup-e2e-${uniqueHex}@risedial-test.com`;
  const password = 'SignupTest123!';

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /create account/i }).click();

  await page.waitForURL('**/plan-selection', { timeout: 15_000 });

  // Step 3: Click Monthly plan, Continue to Checkout → wait for checkout.stripe.com
  await page.getByRole('button', { name: /monthly/i }).click();
  await page.getByRole('button', { name: /continue to checkout/i }).click();

  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 });

  // Step 4: Fill Stripe test card details
  await page.locator('[placeholder*="1234"]').fill('4242 4242 4242 4242');
  await page.locator('[placeholder*="MM"]').fill('12 / 30');
  await page.locator('[placeholder*="CVC"]').fill('123');
  await page.locator('[placeholder*="ZIP"]').fill('10001');

  // Step 5: Submit → wait for /onboarding
  await page.getByRole('button', { name: /subscribe|pay|start/i }).click();
  await page.waitForURL('**/onboarding', { timeout: 60_000 });

  // Step 6: Verify 'Rise is listening' text visible
  await expect(page.getByText(/rise is listening/i)).toBeVisible({ timeout: 15_000 });
});
