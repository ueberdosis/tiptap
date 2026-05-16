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

test.describe('/src/GuideContent/StaticRenderHTML/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/GuideContent/StaticRenderHTML/Vue/')
  })

  test('should render the content as an HTML string', async ({ page }) => {
    await expect(page.locator('pre code').first()).toBeAttached()

    await expect(
      page.locator('pre code').filter({ hasText: '<p>Example <strong>Text</strong></p>' }).first(),
    ).toBeAttached()
  })
})
