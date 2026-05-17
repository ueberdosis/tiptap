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

test.describe('/src/GuideContent/ReadOnly/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/GuideContent/ReadOnly/React/')
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

    /* invoke('attr') value */ await page.locator('.tiptap').first().getAttribute('tabindex')
    await expect(page.locator('.tiptap')).toHaveCount(0)
  })

  test('should be editable', async ({ page }) => {
    await page.locator('#editable').first().click()
    page.locator('.tiptap')

    await page.locator('.tiptap').first().click()
    await typeText(page, 'Edited: ')

    await expect(page.locator('.tiptap p').first().filter({ hasText: 'Edited: ' }).first()).toBeAttached()

    expect(await page.locator('.tiptap').first().getAttribute('tabindex')).toBe('0')
  })
})
