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

test.describe('/src/Extensions/Mathematics/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/Mathematics/React/')
  })

  test('should include katex-rendered inline and block nodes', async ({ page }) => {
    page.locator('.tiptap')

    await expect(page.locator('.tiptap span[data-type="inline-math"]')).toHaveCount(21)
    await expect(page.locator('.tiptap div[data-type="block-math"]')).toHaveCount(1)

    await expect(page.locator('.tiptap span[data-type="inline-math"] .katex')).toHaveCount(21)
    await expect(page.locator('.tiptap div[data-type="block-math"] .katex')).toHaveCount(1)
  })
})
