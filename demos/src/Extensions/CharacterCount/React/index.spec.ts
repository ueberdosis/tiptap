import { expect, test } from '@playwright/test'

import { getEditor } from '../../../../test/helpers.js'

test('updates the character limit without losing content', async ({ page }) => {
  await page.goto('/src/Extensions/CharacterCount/React/')
  const editor = await getEditor(page)
  const content = 'a'.repeat(150)
  await editor.fill(content)
  await page.getByRole('button', { name: '140 characters', exact: true }).click()
  await expect(editor).toHaveText(content)
  await expect(page.locator('.character-count')).toContainText('150 / 140 characters')
  await editor.press('End')
  await editor.press('b')
  await expect(editor).toHaveText(content)
  await page.getByRole('button', { name: 'No limit', exact: true }).click()
  await editor.press('End')
  await editor.press('b')
  await expect(editor).toHaveText(`${content}b`)
})
