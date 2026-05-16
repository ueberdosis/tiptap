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

test.describe('/src/Marks/Bold/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Marks/Bold/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should transform b tags to strong tags', async ({ page }) => {
    await setEditorContent(page, '<p><b>Example Text</b></p>')
    expect(await getEditorHTML(page)).toBe('<p><strong>Example Text</strong></p>')
  })

  test('sould omit b tags with normal font weight inline style', async ({ page }) => {
    await setEditorContent(page, '<p><b style="font-weight: normal">Example Text</b></p>')
    expect(await getEditorHTML(page)).toBe('<p>Example Text</p>')
  })

  test('should transform any tag with bold inline style to strong tags', async ({ page }) => {
    await setEditorContent(page, '<p><span style="font-weight: bold">Example Text</span></p>')
    expect(await getEditorHTML(page)).toBe('<p><strong>Example Text</strong></p>')

    await setEditorContent(page, '<p><span style="font-weight: bolder">Example Text</span></p>')
    expect(await getEditorHTML(page)).toBe('<p><strong>Example Text</strong></p>')

    await setEditorContent(page, '<p><span style="font-weight: 500">Example Text</span></p>')
    expect(await getEditorHTML(page)).toBe('<p><strong>Example Text</strong></p>')

    await setEditorContent(page, '<p><span style="font-weight: 900">Example Text</span></p>')
    expect(await getEditorHTML(page)).toBe('<p><strong>Example Text</strong></p>')
  })

  test('the button should make the selected text bold', async ({ page }) => {
    await page.locator('button').first().click()

    await expect(page.locator('.tiptap').locator('strong').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('the button should toggle the selected text bold', async ({ page }) => {
    await page.locator('button').first().click()
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
    await page.locator('button').first().click()
    await expect(page.locator('.tiptap strong')).toHaveCount(0)
  })

  test('should make the selected text bold when the keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { modKey: true, key: 'b' })
    await expect(page.locator('.tiptap').locator('strong').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('should toggle the selected text bold when the keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { modKey: true, key: 'b' })
    await expect(page.locator('.tiptap').locator('strong').filter({ hasText: 'Example Text' }).first()).toBeAttached()

    await pressShortcut(page, { modKey: true, key: 'b' })

    await expect(page.locator('.tiptap strong')).toHaveCount(0)
  })

  test('should make a bold text from the default markdown shortcut', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '**Bold**')
    await expect(page.locator('.tiptap').locator('strong').filter({ hasText: 'Bold' }).first()).toBeAttached()
  })

  test('should make a bold text from the alternative markdown shortcut', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '__Bold__')
    await expect(page.locator('.tiptap').locator('strong').filter({ hasText: 'Bold' }).first()).toBeAttached()
  })
})
