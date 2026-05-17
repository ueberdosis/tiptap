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

test.describe('/src/Extensions/BackgroundColor/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/BackgroundColor/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should set the background color of the selected text', async ({ page }) => {
    await expect(page.locator('[data-testid="setPurple"]').first()).not.toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )
    await page.locator('[data-testid="setPurple"]').first().click()
    await expect(page.locator('[data-testid="setPurple"]').first()).toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )

    await expect(page.locator('.tiptap').locator('span').first()).toHaveAttribute('style', 'background-color: #958DF1')
  })

  test('should remove the background color of the selected text', async ({ page }) => {
    await page.locator('[data-testid="setPurple"]').first().click()

    await expect(page.locator('.tiptap span').first()).toBeAttached()

    await page.locator('[data-testid="unsetBackgroundColor"]').first().click()

    await expect(page.locator('.tiptap span')).toHaveCount(0)
  })

  test('should change background color with color picker', async ({ page }) => {
    /* invoke('val') value */ await page.locator('input[type=color]').first().inputValue()
    await page.locator('input[type=color]').first().dispatchEvent('input', {})

    await expect(page.locator('.tiptap').locator('span').first()).toHaveAttribute('style', 'background-color: #ff0000')
  })

  test('should match background color and color picker color values', async ({ page }) => {
    await page.locator('[data-testid="setPurple"]').first().click()

    await expect(page.locator('input[type=color]').first()).toHaveValue('#958df1')
  })

  test('should preserve background color on new lines', async ({ page }) => {
    await page.locator('[data-testid="setPurple"]').first().click()
    await page.locator('.ProseMirror').first().click()
    await typeText(page, 'Example Text{enter}')

    await expect(page.locator('[data-testid="setPurple"]').first()).toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )
  })

  test('should unset background color on new lines after unset clicked', async ({ page }) => {
    await page.locator('[data-testid="setPurple"]').first().click()
    await page.locator('.ProseMirror').first().click()
    await typeText(page, 'Example Text{enter}')
    await page.locator('[data-testid="unsetBackgroundColor"]').first().click()
    await page.locator('.ProseMirror').first().click()
    await typeText(page, 'Example Text')

    await expect(page.locator('[data-testid="setPurple"]').first()).not.toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )
  })
})
