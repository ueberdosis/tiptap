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

test.describe('/src/Extensions/LineHeight/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/LineHeight/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should set line-height 1.5 for the selected text', async ({ page }) => {
    await expect(page.locator('[data-test-id="1.5"]').first()).not.toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )
    await page.locator('[data-test-id="1.5"]').first().click()
    await expect(page.locator('[data-test-id="1.5"]').first()).toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )

    await expect(page.locator('.tiptap').locator('span').first()).toHaveAttribute('style', 'line-height: 1.5')
  })

  test('should set line-height 2.0 for the selected text', async ({ page }) => {
    await expect(page.locator('[data-test-id="2.0"]').first()).not.toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )
    await page.locator('[data-test-id="2.0"]').first().click()
    await expect(page.locator('[data-test-id="2.0"]').first()).toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )

    await expect(page.locator('.tiptap').locator('span').first()).toHaveAttribute('style', 'line-height: 2.0')
  })

  test('should set line-height 4.0 for the selected text', async ({ page }) => {
    await expect(page.locator('[data-test-id="4.0"]').first()).not.toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )
    await page.locator('[data-test-id="4.0"]').first().click()
    await expect(page.locator('[data-test-id="4.0"]').first()).toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )

    await expect(page.locator('.tiptap').locator('span').first()).toHaveAttribute('style', 'line-height: 4.0')
  })

  test('should remove the line-height of the selected text', async ({ page }) => {
    await page.locator('[data-test-id="1.5"]').first().click()
    await expect(page.locator('.tiptap').locator('span').first()).toHaveAttribute('style', 'line-height: 1.5')

    await page.locator('[data-test-id="unsetLineHeight"]').first().click()
    await expect(page.locator('.tiptap span')).toHaveCount(0)
  })
})
