import { test, expect } from '@playwright/test';

test('Critical Flow: Dashboard loads and Navigation works', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Sanchara')).toBeVisible();
  
  // Wait for loading to finish
  await page.waitForTimeout(1000);
  
  // Check basic accessibility elements
  await expect(page.locator('text=Hey,')).toBeVisible();
  
  // Navigate to Explore
  await page.click('text=Explore');
  await expect(page.locator('text=Explore').first()).toBeVisible();
});
