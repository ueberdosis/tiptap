import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'ReadOnly'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/GuideContent'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
      })

      test('is read-only', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.setEditable(false))
        await editor.click()
        await page.keyboard.type('Edited: ')

        await expect(page.locator('.tiptap p').first()).not.toContainText('Edited:')
      })

      test('is editable', async ({ page }) => {
        await page.locator('#editable').click()
        const editor = await getEditor(page)
        await editor.click()
        await page.keyboard.type('Edited: ')

        await expect(page.locator('.tiptap p').first()).toContainText('Edited:')
      })
    })
  })
})
