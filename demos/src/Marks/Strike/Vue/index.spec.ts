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

test.describe('/src/Marks/Strike/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Marks/Strike/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should parse s tags correctly', async ({ page }) => {
    await setEditorContent(page, '<p><s>Example Text</s></p>')
    expect(await getEditorHTML(page)).toBe('<p><s>Example Text</s></p>')
  })

  test('should transform del tags to s tags', async ({ page }) => {
    await setEditorContent(page, '<p><del>Example Text</del></p>')
    expect(await getEditorHTML(page)).toBe('<p><s>Example Text</s></p>')
  })

  test('should transform strike tags to s tags', async ({ page }) => {
    await setEditorContent(page, '<p><strike>Example Text</strike></p>')
    expect(await getEditorHTML(page)).toBe('<p><s>Example Text</s></p>')
  })

  test('should transform any tag with text decoration line through to s tags', async ({ page }) => {
    await setEditorContent(page, '<p><span style="text-decoration: line-through">Example Text</span></p>')
    expect(await getEditorHTML(page)).toBe('<p><s>Example Text</s></p>')
  })

  test('the button should strike the selected text', async ({ page }) => {
    await page.locator('button').first().click()

    await expect(page.locator('.tiptap').locator('s').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('the button should toggle the selected text striked', async ({ page }) => {
    await page.locator('button').first().click()

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')

    await page.locator('button').first().click()

    await expect(page.locator('.tiptap').locator('s')).toHaveCount(0)
  })

  test('should strike the selected text when the keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { modKey: true, shiftKey: true, key: 's' })
    await expect(page.locator('.tiptap').locator('s').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('should toggle the selected text striked when the keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { modKey: true, shiftKey: true, key: 's' })
    await pressShortcut(page, { modKey: true, shiftKey: true, key: 's' })
    await expect(page.locator('.tiptap').locator('s')).toHaveCount(0)
  })

  test('should make a striked text from the markdown shortcut', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '~~Strike~~')
    await expect(page.locator('.tiptap').locator('s').filter({ hasText: 'Strike' }).first()).toBeAttached()
  })
})
