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

test.describe('/src/GuideContent/GenerateHTML/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/GuideContent/GenerateHTML/React/')
  })

  test('should render the content as an HTML string', async ({ page }) => {
    await expect(page.locator('pre code').first()).toBeAttached()

    await expect(
      page.locator('pre code').filter({ hasText: '<p>Example <strong>Text</strong></p>' }).first(),
    ).toBeAttached()
  })
})
