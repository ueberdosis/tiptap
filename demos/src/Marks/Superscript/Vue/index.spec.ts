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

test.describe('/src/Marks/Superscript/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Marks/Superscript/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should transform inline style to sup tags', async ({ page }) => {
    await setEditorContent(page, '<p><span style="vertical-align: super">Example Text</span></p>')
    expect(await getEditorHTML(page)).toBe('<p><sup>Example Text</sup></p>')
  })

  test('sould omit inline style with a different vertical align', async ({ page }) => {
    await setEditorContent(page, '<p><span style="vertical-align: middle">Example Text</span></p>')
    expect(await getEditorHTML(page)).toBe('<p>Example Text</p>')
  })

  test('the button should make the selected text bold', async ({ page }) => {
    await page.locator('button').first().click()

    await expect(page.locator('.tiptap').locator('sup').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('the button should toggle the selected text bold', async ({ page }) => {
    await page.locator('button').first().click()
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
    await page.locator('button').first().click()
    await expect(page.locator('.tiptap sup')).toHaveCount(0)
  })
})
