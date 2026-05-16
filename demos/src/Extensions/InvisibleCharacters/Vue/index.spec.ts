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

test.describe('/src/Extensions/InvisibleCharacters/Vue/', () => {
  test.beforeAll(async ({ page }) => {
    await page.goto('/src/Extensions/InvisibleCharacters/Vue/')
  })

  test('should have invisible characters', async ({ page }) => {
    await expect(page.locator('[class*="tiptap-invisible-character"]')).toHaveCount(1)
  })
})
