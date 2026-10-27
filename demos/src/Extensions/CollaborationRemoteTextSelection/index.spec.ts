import { expect, test } from '@playwright/test'

test('keeps the caret after its text when a remote peer inserts text', async ({ page }) => {
  await page.goto('/src/Extensions/CollaborationRemoteTextSelection/React/')
  await expect(page.locator('.output-group')).toHaveText('Block 1, offset 11')
  await page.getByRole('button', { name: 'Insert text before the local caret' }).click()
  await expect(page.locator('.output-group')).toHaveText('Block 1, offset 13')
})
