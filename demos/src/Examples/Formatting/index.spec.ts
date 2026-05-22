import { expect, test } from '@playwright/test'

import { clickButton, getEditor } from '../../../test/helpers.js'

const demoName = 'Formatting'
const frameworkPaths = ['React', 'Vue', 'Svelte']
const demoPath = '/src/Examples'

const marks = [{ label: 'Highlight', mark: 'mark' }]

const alignments = [
  { label: 'Left', alignment: 'left' },
  { label: 'Center', alignment: 'center' },
  { label: 'Right', alignment: 'right' },
  { label: 'Justify', alignment: 'justify' },
]

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.chain().focus().clearContent().run()
        })
      })

      marks.forEach(m => {
        test(`sets ${m.label}`, async ({ page }) => {
          const editor = await getEditor(page)

          await editor.click()
          await editor.type('Hello world.')
          await editor.evaluate((el: any) => el.editor.commands.selectAll())
          await clickButton(page, m.label)

          await expect(page.locator(`.tiptap ${m.mark}`)).toBeVisible()
        })
      })

      alignments.forEach(a => {
        test(`sets ${a.label}`, async ({ page }) => {
          const editor = await getEditor(page)

          await editor.click()
          await editor.type('Hello world.')
          await editor.evaluate((el: any) => el.editor.commands.selectAll())
          await clickButton(page, a.label)

          if (a.alignment !== 'left') {
            await expect(page.locator('.tiptap p').first()).toHaveCSS('text-align', a.alignment)
          }
        })
      })
    })
  })
})
