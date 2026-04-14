import { test, expect } from '@playwright/test';

test('Critical Flow: Dashboard loads and Navigation works', async ({ page }) => {
  await page.goto('/');
  
  // Wait for loading to finish
  await page.waitForTimeout(1000);
  
  // Check basic dashboard elements
  await expect(page.locator('text=Hey,')).toBeVisible();
  
  // Navigate to Explore
  await page.click('text=Explore');
  await expect(page.locator('text=All Events').first()).toBeVisible();
});
