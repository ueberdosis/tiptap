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

test.describe('/src/Experiments/IsolatingClear/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Experiments/IsolatingClear/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<h1>Example Text</h1>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should apply the paragraph style when the keyboard shortcut is pressed', async ({ page }) => {
    await expect(page.locator('.tiptap h1').first()).toBeAttached()

    await pressShortcut(page, { modKey: true, altKey: true, key: '0' })
    await expect(page.locator('.tiptap').locator('p').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })
})
