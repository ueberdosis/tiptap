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

test.describe('/src/Examples/Dropcursor/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/Dropcursor/React/')
  })

  // TODO: Write tests
})
