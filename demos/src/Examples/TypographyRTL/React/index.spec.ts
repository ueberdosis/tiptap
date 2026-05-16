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

test.describe('/src/Examples/TypographyRTL/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/TypographyRTL/React/')
  })

  test.describe('Automatic RTL detection', () => {
    test.beforeEach(async ({ page }) => {
      await waitForEditor(page, '.editor-auto .tiptap')
      await page.evaluate(__expr => {
        const editor = (document.querySelector('.editor-auto .tiptap') as any).editor
        editor.commands.clearContent()
      }, undefined)
    })

    test('should use RTL double quotes when textDirection is rtl', async ({ page }) => {
      await page.locator('.editor-auto .tiptap').first().click()
      await typeText(page, '"hello"')
      await expect(page.locator('.editor-auto .tiptap').filter({ hasText: '”hello“' }).first()).toBeAttached()
    })

    test('should use RTL single quotes when textDirection is rtl', async ({ page }) => {
      await page.locator('.editor-auto .tiptap').first().click()
      await typeText(page, "'world'")
      await expect(page.locator('.editor-auto .tiptap').filter({ hasText: '’world‘' }).first()).toBeAttached()
    })
  })

  test.describe('Explicit RTL configuration', () => {
    test.beforeEach(async ({ page }) => {
      await waitForEditor(page, '.editor-explicit .tiptap')
      await page.evaluate(__expr => {
        const editor = (document.querySelector('.editor-explicit .tiptap') as any).editor
        editor.commands.clearContent()
      }, undefined)
    })

    test('should use RTL double quotes when configured', async ({ page }) => {
      await page.locator('.editor-explicit .tiptap').first().click()
      await typeText(page, '"hello"')
      await expect(page.locator('.editor-explicit .tiptap').filter({ hasText: '”hello“' }).first()).toBeAttached()
    })

    test('should use RTL single quotes when configured', async ({ page }) => {
      await page.locator('.editor-explicit .tiptap').first().click()
      await typeText(page, "'world'")
      await expect(page.locator('.editor-explicit .tiptap').filter({ hasText: '’world‘' }).first()).toBeAttached()
    })
  })
})
