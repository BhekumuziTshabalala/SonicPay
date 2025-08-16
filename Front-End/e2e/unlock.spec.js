const { test, expect } = require('@playwright/test')

test('unlock admin gate and navigate', async ({ page }) => {
  await page.goto('http://localhost:5173')
  // Wait for admin gate overlay
  await page.waitForSelector('text=Admin Access Required')
  await page.fill('input[placeholder="Admin Email"]', 'admin@admin.com')
  await page.fill('input[placeholder="Admin Password"]', 'admin')
  await page.click('text=Unlock')
  // After unlock, navbar should show Login link
  await expect(page.locator('text=Login')).toBeVisible()
})
