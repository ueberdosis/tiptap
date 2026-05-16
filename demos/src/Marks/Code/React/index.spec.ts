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

test.describe('/src/Marks/Code/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Marks/Code/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should parse code tags correctly', async ({ page }) => {
    await setEditorContent(page, '<p><code>Example Text</code></p>')
    expect(await getEditorHTML(page)).toBe('<p><code>Example Text</code></p>')

    await setEditorContent(page, '<code>Example Text</code>')
    expect(await getEditorHTML(page)).toBe('<p><code>Example Text</code></p>')
  })

  test('should mark the selected text as inline code', async ({ page }) => {
    await page.locator('button').first().click()

    await expect(page.locator('.tiptap').locator('code')).toContainText('Example Text')
  })

  test('should toggle the selected text as inline code', async ({ page }) => {
    await page.locator('button').first().click()

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')

    await page.locator('button').first().click()

    await expect(page.locator('.tiptap code')).toHaveCount(0)
  })

  test('should make the selected text bold when the keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { modKey: true, key: 'e' })
    await expect(page.locator('.tiptap').locator('code')).toContainText('Example Text')
  })

  test('should toggle the selected text bold when the keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { modKey: true, key: 'e' })
    await expect(page.locator('.tiptap').locator('code')).toContainText('Example Text')

    await pressShortcut(page, { modKey: true, key: 'e' })

    await expect(page.locator('.tiptap code')).toHaveCount(0)
  })

  test('should make inline code from the markdown shortcut', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '`Example`')
    await expect(page.locator('.tiptap').locator('code')).toContainText('Example')
  })

  test('should not create inline code when using space', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '``{leftArrow}$foobar{rightArrow} ')
    await expect(page.locator('.tiptap').locator('code')).toHaveCount(0)
  })

  test('should create code when closing with backtick', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '``{leftArrow}$foobar{rightArrow} {backSpace}{backSpace}`')
    await expect(page.locator('.tiptap').locator('code')).toContainText('$foobar')
  })
})
