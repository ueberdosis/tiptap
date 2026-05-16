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

test.describe('/src/Extensions/Focus/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/Focus/React/')
  })

  test('should have class', async ({ page }) => {
    await expect(page.locator('.tiptap p').first().first()).toHaveClass(new RegExp('(^|\\s)' + 'has-focus' + '(\\s|$)'))
  })
})
