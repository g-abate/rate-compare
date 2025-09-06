/**
 * End-to-end tests for Rate Compare
 * 
 * @package Rate_Compare
 * @since 1.0.0
 */

import { test, expect } from '@playwright/test';

test.describe('Rate Compare E2E Tests', () => {
  test('should load the test page', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Rate Compare/);
  });

  test('should have the rate compare script loaded', async ({ page }) => {
    await page.goto('/');
    
    // Check that the rate compare script is loaded
    const script = page.locator('script[src*="rate-compare"]');
    await expect(script).toHaveCount(1);
  });

  test('should initialize without errors', async ({ page }) => {
    await page.goto('/');
    
    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit for any initialization
    await page.waitForTimeout(1000);
    
    // Should not have any console errors
    expect(errors).toHaveLength(0);
  });
});
