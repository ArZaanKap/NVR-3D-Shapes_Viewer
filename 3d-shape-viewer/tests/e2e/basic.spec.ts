import { test, expect } from '@playwright/test';

test.describe('Basic App Functionality', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the app loads (looking for any content, title may vary)
    await expect(page.locator('body')).toBeVisible();
  });

  test('nickname prompt appears on first visit', async ({ page }) => {
    // Clear localStorage to simulate first visit
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Wait for nickname prompt input
    const nicknameInput = page.getByPlaceholder(/nickname/i);
    await expect(nicknameInput).toBeVisible({ timeout: 5000 });
  });

  test('can enter nickname and proceed', async ({ page }) => {
    // Clear localStorage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Enter nickname
    const nicknameInput = page.getByPlaceholder(/nickname/i);
    await nicknameInput.fill('TestUser');

    // Click continue/submit button
    const continueButton = page.getByRole('button', { name: /continue|start|let's go/i });
    await continueButton.click();

    // Should see user name somewhere in the app
    await expect(page.getByText(/TestUser/i)).toBeVisible({ timeout: 5000 });
  });

  test('workspace renders with main canvas', async ({ page }) => {
    // Set nickname to skip prompt
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('shape-builder-nickname', 'TestUser');
    });
    await page.reload();

    // Click start building if on landing page
    const startButton = page.getByRole('button', { name: /start building/i });
    if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startButton.click();
    }

    // Check for the main canvas (the first/largest one)
    const mainCanvas = page.locator('canvas').first();
    await expect(mainCanvas).toBeVisible({ timeout: 10000 });
  });

  test('toolbar buttons are visible', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('shape-builder-nickname', 'TestUser');
    });
    await page.reload();

    // Click start if needed
    const startButton = page.getByRole('button', { name: /start building/i });
    if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startButton.click();
    }

    // Check for toolbar buttons by their exact button names
    await expect(page.getByRole('button', { name: 'Select', exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Rotate', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Move', exact: true })).toBeVisible();
  });
});
