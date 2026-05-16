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
    await expect(page.locator('p').first()).toBeAttached()
    await expect(page.locator('p').filter({ hasText: 'Example' }).first()).toBeAttached()

    await expect(page.locator('p strong').first()).toBeAttached()
    await expect(page.locator('p strong').filter({ hasText: 'Text' }).first()).toBeAttached()
  })
})
