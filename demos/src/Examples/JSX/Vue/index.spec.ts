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

test.describe('/src/Examples/JSX/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/JSX/Vue/')
  })

  test('should have a working tiptap instance', async ({ page }) => {
    // eslint-disable-next-line
    expect(editor).to.not.be.null
  })

  test('should have paragraphs colored as red', async ({ page }) => {
    await expect(page.locator('.tiptap p')).toHaveCSS('color', 'rgb(255, 0, 0)')
  })
})
