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

test.describe('/src/Extensions/Focus/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/Focus/Vue/')
  })

  test('should have class', async ({ page }) => {
    await expect(page.locator('.tiptap p').first()).toHaveClass(new RegExp('(^|\\s)' + 'has-focus' + '(\\s|$)'))
  })
})
