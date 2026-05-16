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

test.describe('/src/Extensions/FontFamily/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/FontFamily/Vue/')
  })

  // TODO: Write tests
})
