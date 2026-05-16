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

test.describe('/src/Extensions/TableOfContents/Vue', () => {
  test.beforeAll(async ({ page }) => {
    await page.goto('/src/Extensions/TableOfContents/Vue')
  })

  // TODO: Write tests
})
