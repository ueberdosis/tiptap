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

test.describe('/src/Extensions/Color/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/Color/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should set the color of the selected text', async ({ page }) => {
    await expect(page.locator('button').first().first()).not.toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )
    await page.locator('button').first().click()
    await expect(page.locator('button').first().first()).toHaveClass(new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'))

    await expect(page.locator('.tiptap').locator('span').first()).toHaveAttribute('style', 'color: #958DF1')
  })

  test('should remove the color of the selected text', async ({ page }) => {
    await page.locator('button').first().click()

    await expect(page.locator('.tiptap span').first()).toBeAttached()

    await page.locator('button').last().click()

    await expect(page.locator('.tiptap span')).toHaveCount(0)
  })

  test('should change text color with color picker', async ({ page }) => {
    /* invoke('val') value */ await page.locator('input[type=color]').first().inputValue()
    // TODO(playwright-migration): trigger(...)

    await expect(page.locator('.tiptap').locator('span').first()).toHaveAttribute('style', 'color: #ff0000')
  })

  test('should match text and color picker color values', async ({ page }) => {
    await page.locator('button').first().click()

    await expect(page.locator('input[type=color]').first()).toHaveValue('#958df1')
  })
})
