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

test.describe('/src/GuideContent/StaticRenderReact/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/GuideContent/StaticRenderReact/React/')
  })

  test('should render the content as HTML', async ({ page }) => {
    await expect(page.locator('p')).toHaveCount(1)
    await expect(page.locator('p')).toContainText('Example')

    await expect(page.locator('p strong')).toHaveCount(1)
    await expect(page.locator('p strong')).toContainText('Text')
  })
})
