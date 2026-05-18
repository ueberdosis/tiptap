import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'InsertContentApplyingRules'
const frameworkPaths = ['React']
const demoPath = '/src/Commands'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.clearContent()
        })
      })

      test('should apply list InputRule', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.insertContent('-', { applyInputRules: true })
          el.editor.commands.insertContent(' ', { applyInputRules: true })
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<ul><li><p><br class="ProseMirror-trailingBreak"></p></li></ul>')
      })

      test('should apply markdown using a PasteRule', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.insertContentAt(1, '*This is an italic text*', { applyPasteRules: true })
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<p><em>This is an italic text</em></p>')
      })
    })
  })
})
