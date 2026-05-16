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

test.describe('/src/Examples/StaticRenderingAdvanced/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/StaticRenderingAdvanced/React/')
  })

  test('should render the content as HTML', async ({ page }) => {
    await expect(page.locator('p')).toHaveCount(1)
  })
})
