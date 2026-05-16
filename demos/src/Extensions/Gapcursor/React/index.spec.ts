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

test.describe('/src/Examples/Gapcursor/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/Gapcursor/React/')
  })

  // TODO: Write tests
})
