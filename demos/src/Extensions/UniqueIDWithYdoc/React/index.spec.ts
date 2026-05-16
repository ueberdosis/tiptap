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

test.describe('/src/Extensions/UniqueID/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/UniqueID/React/')
  })

  test('has a heading with an unique ID', async ({ page }) => {
    await expect(page.locator('.ProseMirror h1').first()).toHaveAttribute('data-id', /.*/)
  })

  test('has a paragraph with an unique ID', async ({ page }) => {
    await expect(page.locator('.ProseMirror p').first()).toHaveAttribute('data-id', /.*/)
  })
})
