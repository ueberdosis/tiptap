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

test.describe('/src/Marks/Underline/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Marks/Underline/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should parse u tags correctly', async ({ page }) => {
    await setEditorContent(page, '<p><u>Example Text</u></p>')
    expect(await getEditorHTML(page)).toBe('<p><u>Example Text</u></p>')
  })

  test('should transform any tag with text decoration underline to u tags', async ({ page }) => {
    await setEditorContent(page, '<p><span style="text-decoration: underline">Example Text</span></p>')
    expect(await getEditorHTML(page)).toBe('<p><u>Example Text</u></p>')
  })

  test('the button should underline the selected text', async ({ page }) => {
    await page.locator('button').first().click()

    await expect(page.locator('.tiptap').locator('u')).toContainText('Example Text')
  })

  test('the button should toggle the selected text underline', async ({ page }) => {
    await page.locator('button').first().click()

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')

    await page.locator('button').first().click()

    await expect(page.locator('.tiptap').locator('u')).toHaveCount(0)
  })

  test('should underline the selected text when the keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { modKey: true, key: 'u' })
    await expect(page.locator('.tiptap').locator('u')).toContainText('Example Text')
  })

  test('should toggle the selected text underline when the keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { modKey: true, key: 'u' })
    await pressShortcut(page, { modKey: true, key: 'u' })
    await expect(page.locator('.tiptap').locator('u')).toHaveCount(0)
  })
})
