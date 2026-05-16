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

test.describe('/src/Commands/InsertContentApplyingRules/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Commands/InsertContentApplyingRules/React/')
  })

  test.beforeEach(async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)
  })

  test('should apply list InputRule', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent('-', { applyInputRules: true })
    }, undefined)

    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContent(' ', { applyInputRules: true })
    }, undefined)

    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<ul><li><p><br class="ProseMirror-trailingBreak"></p></li></ul>',
    )
  })

  test('should apply markdown using a PasteRule', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertContentAt(1, '*This is an italic text*', { applyPasteRules: true })
    }, undefined)

    expect(await page.locator('.tiptap').first().innerHTML()).toContain('<p><em>This is an italic text</em></p>')
  })
})
