import { expect, test } from '@playwright/test'

import { runEditor } from '../../../helpers.js'

test.describe('React', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/src/Commands/Cut/React/')
    await page.waitForSelector('.tiptap')
  })

  test('should apply the paragraph style when the keyboard shortcut is pressed', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.setContent('<h1>Example Text</h1>')
    })

    // Select all text in the editor
    await page.locator('.tiptap').focus()
    await page.keyboard.press('Control+A')

    await page.locator('.tiptap').focus()
    // Simulate mod+alt+0 (Control+Alt+0 or Command+Alt+0)
    await page.keyboard.press('Control+Alt+0')
    // Check that the content is now in a <p> tag
    await expect(page.locator('.tiptap p:first-child')).toContainText('Example Text')
  })
})
