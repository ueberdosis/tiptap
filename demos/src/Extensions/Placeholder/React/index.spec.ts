import { expect, test } from '@playwright/test'

import { getEditor } from '../../../../test/helpers.js'

test('updates the placeholder without restarting the editor', async ({ page }) => {
  await page.goto('/src/Extensions/Placeholder/React/')
  const editor = await getEditor(page)
  await expect(editor.locator('p')).toHaveAttribute('data-placeholder', 'Write something …')
  await page.getByLabel('Placeholder').fill('New prompt')
  await expect(editor.locator('p')).toHaveAttribute('data-placeholder', 'New prompt')
  await editor.fill('Hello')
  await page.getByLabel('Placeholder').fill('Another prompt')
  await expect(editor).toHaveText('Hello')
})
