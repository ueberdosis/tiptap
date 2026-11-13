import { expect, test } from '@playwright/test'

test('keeps the caret in its empty paragraph after a remote insertion', async ({ page }) => {
  await page.goto('/src/Extensions/CollaborationEmptyBlockSelection/React/')
  await expect(page.locator('.output-group')).toHaveText('Block 2, offset 0')
  await page
    .getByRole('button', { name: 'Insert an empty paragraph before the local caret' })
    .click()
  await expect(page.locator('.output-group')).toHaveText('Block 3, offset 0')
})
