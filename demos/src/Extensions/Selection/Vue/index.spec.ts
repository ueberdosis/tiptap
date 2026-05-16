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

test.describe('/src/Extensions/Selection/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/Selection/Vue/')
  })

  test('should have class', async ({ page }) => {
    await expect(page.locator('.tiptap span').first().first()).toHaveClass(
      new RegExp('(^|\\s)' + 'selection' + '(\\s|$)'),
    )
  })
})
