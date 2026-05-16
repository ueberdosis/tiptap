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

test.describe('/src/Extensions/FontFamily/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/FontFamily/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should set the font-family of the selected text', async ({ page }) => {
    await expect(page.locator('[data-test-id="monospace"]').first()).not.toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )
    await page.locator('[data-test-id="monospace"]').first().click()
    await expect(page.locator('[data-test-id="monospace"]').first()).toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )

    await expect(page.locator('.tiptap').locator('span').first()).toHaveAttribute('style', 'font-family: monospace')
  })

  test('should remove the font-family of the selected text', async ({ page }) => {
    await page.locator('[data-test-id="monospace"]').first().click()

    await expect(page.locator('.tiptap span').first()).toBeAttached()

    await page.locator('[data-test-id="unsetFontFamily"]').first().click()

    await expect(page.locator('.tiptap span')).toHaveCount(0)
  })

  test('should allow CSS variables as a font-family', async ({ page }) => {
    await expect(page.locator('[data-test-id="css-variable"]').first()).not.toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )
    await page.locator('[data-test-id="css-variable"]').first().click()
    await expect(page.locator('[data-test-id="css-variable"]').first()).toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )

    await expect(page.locator('.tiptap').locator('span').first()).toHaveAttribute(
      'style',
      'font-family: var(--title-font-family)',
    )
  })

  test('should allow fonts containing multiple font families', async ({ page }) => {
    await expect(page.locator('[data-test-id="comic-sans"]').first()).not.toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )
    await page.locator('[data-test-id="comic-sans"]').first().click()
    await expect(page.locator('[data-test-id="comic-sans"]').first()).toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )

    await expect(page.locator('.tiptap').locator('span').first()).toHaveAttribute(
      'style',
      'font-family: "Comic Sans MS", "Comic Sans"',
    )
  })

  test('should allow fonts containing a space and number as a font-family', async ({ page }) => {
    await expect(page.locator('[data-test-id="exo2"]').first()).not.toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )
    await page.locator('[data-test-id="exo2"]').first().click()
    await expect(page.locator('[data-test-id="exo2"]').first()).toHaveClass(
      new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'),
    )

    await expect(page.locator('.tiptap').locator('span').first()).toHaveAttribute('style', 'font-family: "Exo 2"')
  })
})
