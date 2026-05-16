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

test.describe('/src/Marks/Subscript/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Marks/Subscript/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should transform inline style to sub tags', async ({ page }) => {
    await setEditorContent(page, '<p><span style="vertical-align: sub">Example Text</span></p>')
    expect(await getEditorHTML(page)).toBe('<p><sub>Example Text</sub></p>')
  })

  test('sould omit inline style with a different vertical align', async ({ page }) => {
    await setEditorContent(page, '<p><b style="vertical-align: middle">Example Text</b></p>')
    expect(await getEditorHTML(page)).toBe('<p>Example Text</p>')
  })

  test('the button should make the selected text bold', async ({ page }) => {
    await page.locator('button').first().click()

    await expect(page.locator('.tiptap').locator('sub').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('the button should toggle the selected text bold', async ({ page }) => {
    await page.locator('button').first().click()
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
    await page.locator('button').first().click()
    await expect(page.locator('.tiptap sub')).toHaveCount(0)
  })
})
