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

test.describe('/src/Extensions/TypographyWithOverrides/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/TypographyWithOverrides/React/')
  })

  test.beforeEach(async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)
  })

  test('should use correct override for rightArrow', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '-> Hello!')
    await expect(page.locator('.tiptap')).toContainText('=====> Hello!')
  })
})
