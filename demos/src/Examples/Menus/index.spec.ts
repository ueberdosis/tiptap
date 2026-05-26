import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'Menus'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Examples'

const marks = [
  { button: 'Bold', tag: 'strong' },
  { button: 'Italic', tag: 'em' },
  { button: 'Strike', tag: 's' },
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

      test('should show menu when the editor is empty', async ({ page }) => {
        await expect(page.locator('.floating-menu').first()).toBeVisible()
      })

      test('should show menu when text is selected', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.type('Test')
        await editor.evaluate((el: any) => el.editor.commands.selectAll())

        await expect(page.locator('.bubble-menu').first()).toBeVisible()
      })

      marks.forEach(m => {
        test(`should apply ${m.button} correctly`, async ({ page }) => {
          const editor = await getEditor(page)

          await editor.click()
          await editor.type('Test')
          await editor.evaluate((el: any) => el.editor.commands.selectAll())

          await page
            .locator('.bubble-menu')
            .getByRole('button', { name: m.button, exact: true })
            .click()

          await expect(page.locator(`.tiptap p ${m.tag}`)).toBeVisible()
        })
      })
    })
  })
})
