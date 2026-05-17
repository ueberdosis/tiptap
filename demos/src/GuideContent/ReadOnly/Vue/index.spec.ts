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

test.describe('/src/GuideContent/ReadOnly/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/GuideContent/ReadOnly/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)
  })

  test('should be read-only', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.setEditable(false)
    }, undefined)
    await page.locator('.tiptap').first().click()
    await typeText(page, 'Edited: ')

    await expect(page.locator('.tiptap p').first().first()).not.toContainText('Edited: ')
  })

  test('should be editable', async ({ page }) => {
    await page.locator('#editable').first().click()
    page.locator('.tiptap')

    await page.locator('.tiptap').first().click()
    await typeText(page, 'Edited: ')

    await expect(page.locator('.tiptap p').first().filter({ hasText: 'Edited: ' }).first()).toBeAttached()
  })
})
