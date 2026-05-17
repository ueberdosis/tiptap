import {
  editorEval,
  expect,
  getEditorHTML,
  getEditorJSON,
  getEditorText,
  pasteIntoEditor,
  pressShortcut,
  setEditorContent,
  test,
  typeInEditor,
  typeText,
  waitForEditor,
  withEditor,
} from '../../../../../tests/e2e/support/index.js'

test.describe('/src/Extensions/FontSize/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/FontSize/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should set the font-size of the selected text', async ({ page }) => {
    await expect(page.locator('[data-test-id="28px"]').first()).not.toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )
    await page.locator('[data-test-id="28px"]').first().click()
    await expect(page.locator('[data-test-id="28px"]').first()).toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )

    await expect(page.locator('.tiptap').locator('span').first()).toHaveAttribute('style', 'font-size: 28px')
  })

  test('should remove the font-size of the selected text', async ({ page }) => {
    await page.locator('[data-test-id="28px"]').first().click()
    await expect(page.locator('.tiptap').locator('span').first()).toHaveAttribute('style', 'font-size: 28px')
    await page.locator('[data-test-id="unsetFontSize"]').first().click()
    await expect(page.locator('span')).toHaveCount(0)
  })
})
