import { test, expect } from '@playwright/test';

test.describe('Camera Controls', () => {
  test.beforeEach(async ({ page }) => {
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

    // Wait for main canvas to be ready (use first() to get the main canvas, not thumbnails)
    await page.locator('canvas').first().waitFor({ timeout: 10000 });
  });

  test('view buttons are visible', async ({ page }) => {
    // Check for view buttons
    await expect(page.getByRole('button', { name: 'Default' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Front' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Left' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Right' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Top' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bottom' })).toBeVisible();
  });

  test('can click Front view button', async ({ page }) => {
    const frontButton = page.getByRole('button', { name: 'Front' });
    await frontButton.click();

    // Button should be highlighted (has different styling when active)
    await expect(frontButton).toHaveClass(/bg-slate-700/);
  });

  test('can click all view buttons', async ({ page }) => {
    const views = ['Front', 'Back', 'Left', 'Right', 'Top', 'Bottom', 'Default'];

    for (const view of views) {
      const button = page.getByRole('button', { name: view });
      await button.click();
      // Small delay to allow camera animation
      await page.waitForTimeout(300);
    }

    // Final state should be Default view selected
    const defaultButton = page.getByRole('button', { name: 'Default' });
    await expect(defaultButton).toHaveClass(/bg-blue-500/);
  });

  test('canvas responds to scroll (zoom)', async ({ page }) => {
    const canvas = page.locator('canvas').first();

    // Get initial canvas screenshot for comparison
    const initialScreenshot = await canvas.screenshot();

    // Scroll on canvas
    await canvas.hover();
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(500);

    // Take another screenshot - should be different (zoomed)
    const zoomedScreenshot = await canvas.screenshot();

    // Screenshots should be different
    expect(Buffer.compare(initialScreenshot, zoomedScreenshot)).not.toBe(0);
  });

  test('canvas responds to drag (orbit)', async ({ page }) => {
    const canvas = page.locator('canvas').first();

    // Get initial screenshot
    const initialScreenshot = await canvas.screenshot();

    // Drag on canvas to rotate view
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2);
      await page.mouse.up();
    }
    await page.waitForTimeout(500);

    // Take another screenshot - should be different (rotated)
    const rotatedScreenshot = await canvas.screenshot();

    // Screenshots should be different
    expect(Buffer.compare(initialScreenshot, rotatedScreenshot)).not.toBe(0);
  });
});
