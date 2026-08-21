import { test, expect } from '@playwright/test'

test('ana sayfa açılır ve Nova CRM başlığını gösterir', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Nova CRM')).toBeVisible()
})
