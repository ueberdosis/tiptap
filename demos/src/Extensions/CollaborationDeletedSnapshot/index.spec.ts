import { expect, test } from '@playwright/test'

test('preserves the attributes and text of a deleted paragraph', async ({ page }) => {
  await page.goto('/src/Extensions/CollaborationDeletedSnapshot/React/')
  await page
    .getByRole('button', { name: 'Delete the first paragraph and compare snapshots' })
    .click()
  await expect(page.locator('.ProseMirror p[data-id="original"]')).toHaveText('Original text')
  await expect(page.locator('.ProseMirror del')).toHaveText('Original text')
})
