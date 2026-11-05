import { expect, test } from '@playwright/test'

test('viewing incompatible history keeps the live shared text', async ({ page }) => {
  await page.goto('/src/Reproductions/CollaborationSnapshotRepair/React/')
  const editor = page.locator('.tiptap')
  await expect(editor).toHaveText('Historic contentImportant content')

  await page.getByRole('button', { name: 'View snapshot' }).click()
  await expect(editor).toHaveText('Historic content')
  await expect(page.locator('.output-group')).toHaveText('Live shared text: Important content')

  await page.getByRole('button', { name: 'Return to live document' }).click()
  await expect(editor).toHaveText('Historic contentImportant content')
})
