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

test.describe('/src/GuideContent/GenerateJSON/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/GuideContent/GenerateJSON/Vue/')
  })

  test('should render the content as an HTML string', async ({ page }) => {
    await expect(page.locator('pre code')).toHaveCount(1)

    await expect(page.locator('pre code')).toContainText(
      `{ "type": "doc", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Example " }, { "type": "text", "marks": [ { "type": "bold" } ], "text": "Text" } ] } ] }`,
    )
  })
})
