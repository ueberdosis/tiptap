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

test.describe('/src/GuideGettingStarted/VModel/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/GuideGettingStarted/VModel/Vue/')
  })

  // TODO: Write tests
})
