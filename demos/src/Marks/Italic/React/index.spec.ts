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

test.describe('/src/Marks/Italic/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Marks/Italic/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('i tags should be transformed to em tags', async ({ page }) => {
    await setEditorContent(page, '<p><i>Example Text</i></p>')
    expect(await getEditorHTML(page)).toBe('<p><em>Example Text</em></p>')
  })

  test('i tags with normal font style should be omitted', async ({ page }) => {
    await setEditorContent(page, '<p><i style="font-style: normal">Example Text</i></p>')
    expect(await getEditorHTML(page)).toBe('<p>Example Text</p>')
  })

  test('generic tags with italic style should be transformed to strong tags', async ({ page }) => {
    await setEditorContent(page, '<p><span style="font-style: italic">Example Text</span></p>')
    expect(await getEditorHTML(page)).toBe('<p><em>Example Text</em></p>')
  })

  test('the button should make the selected text italic', async ({ page }) => {
    await page.locator('button').first().click()

    await expect(page.locator('.tiptap').locator('em').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('the button should toggle the selected text italic', async ({ page }) => {
    await page.locator('button').first().click()

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')

    await page.locator('button').first().click()

    await expect(page.locator('.tiptap em')).toHaveCount(0)
  })

  test('the keyboard shortcut should make the selected text italic', async ({ page }) => {
    await pressShortcut(page, { modKey: true, key: 'i' })
    await expect(page.locator('.tiptap').locator('em').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('the keyboard shortcut should toggle the selected text italic', async ({ page }) => {
    await pressShortcut(page, { modKey: true, key: 'i' })
    await pressShortcut(page, { modKey: true, key: 'i' })
    await expect(page.locator('.tiptap').locator('em')).toHaveCount(0)
  })
})
