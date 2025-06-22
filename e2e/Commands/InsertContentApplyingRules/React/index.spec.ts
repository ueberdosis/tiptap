import test from '@playwright/test'

import { getEditorHTML, runEditor } from '../../../helpers.js'

test.describe('React', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/src/Commands/InsertContentApplyingRules/React/')
    await page.waitForSelector('.tiptap')

    await runEditor(page, editor => {
      editor.commands.clearContent()
    })
  })

  test('should apply list InputRule', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.insertContent('-', {
        applyInputRules: true,
      })
      editor.commands.insertContent(' ', {
        applyInputRules: true,
      })
    })

    const html = await getEditorHTML(page)

    await test.expect(html).toContain('<ul><li><p><br class="ProseMirror-trailingBreak"></p></li></ul>')
  })

  test('should apply markdown using a PasteRule', async ({ page }) => {
    await runEditor(page, editor => {
      editor.commands.insertContentAt(1, '*This is an italic text*', {
        applyPasteRules: true,
      })
    })

    const html = await getEditorHTML(page)

    await test.expect(html).toContain('<p><em>This is an italic text</em></p>')
  })
})
