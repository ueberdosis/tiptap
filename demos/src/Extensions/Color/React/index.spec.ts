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

test.describe('/src/Extensions/Color/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/Color/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should set the color of the selected text', async ({ page }) => {
    await expect(page.locator('[data-testid="setPurple"]').first()).not.toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )
    await page.locator('[data-testid="setPurple"]').first().click()
    await expect(page.locator('[data-testid="setPurple"]').first()).toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )

    await expect(page.locator('.tiptap').locator('span').first()).toHaveAttribute('style', 'color: #958DF1')
  })

  test('should remove the color of the selected text', async ({ page }) => {
    await page.locator('[data-testid="setPurple"]').first().click()

    await expect(page.locator('.tiptap span').first()).toBeAttached()

    await page.locator('[data-testid="unsetColor"]').first().click()

    await expect(page.locator('.tiptap span')).toHaveCount(0)
  })

  test('should change text color with color picker', async ({ page }) => {
    /* invoke('val') value */ await page.locator('input[type=color]').first().inputValue()
    // TODO(playwright-migration): trigger(...)

    await expect(page.locator('.tiptap').locator('span').first()).toHaveAttribute('style', 'color: #ff0000')
  })

  test('should match text and color picker color values', async ({ page }) => {
    await page.locator('[data-testid="setPurple"]').first().click()

    await expect(page.locator('input[type=color]').first()).toHaveValue('#958df1')
  })

  test('should preserve color on new lines', async ({ page }) => {
    await page.locator('[data-testid="setPurple"]').first().click()
    await page.locator('.ProseMirror').first().click()
    await typeText(page, 'Example Text{enter}')

    await expect(page.locator('[data-testid="setPurple"]').first()).toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )
  })

  test('should unset color on new lines after unset clicked', async ({ page }) => {
    await page.locator('[data-testid="setPurple"]').first().click()
    await page.locator('.ProseMirror').first().click()
    await typeText(page, 'Example Text{enter}')
    await page.locator('[data-testid="unsetColor"]').first().click()
    await page.locator('.ProseMirror').first().click()
    await typeText(page, 'Example Text')

    await expect(page.locator('[data-testid="setPurple"]').first()).not.toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )
  })
})
