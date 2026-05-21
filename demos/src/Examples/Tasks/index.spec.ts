import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'Tasks'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Examples'

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

      test('should always use task items', async ({ page }) => {
        await expect(page.locator('.tiptap input[type="checkbox"]')).toHaveCount(1)
      })

      test('should create new tasks', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.type('Cook food')
        await editor.press('Enter')
        await editor.type('Eat food')
        await editor.press('Enter')
        await editor.type('Clean dishes')

        await expect(page.locator('.tiptap input[type="checkbox"]')).toHaveCount(3)
      })

      test('should check and uncheck tasks on click', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.type('Cook food')
        await editor.press('Enter')
        await editor.type('Eat food')
        await editor.press('Enter')
        await editor.type('Clean dishes')

        const checkboxes = page.locator('.tiptap input[type="checkbox"]')

        await checkboxes.nth(0).check({ force: true })
        await expect(page.locator('.tiptap input[type="checkbox"]:checked')).toHaveCount(1)

        await checkboxes.nth(1).check({ force: true })
        await expect(page.locator('.tiptap input[type="checkbox"]:checked')).toHaveCount(2)

        await checkboxes.nth(0).uncheck({ force: true })
        await expect(page.locator('.tiptap input[type="checkbox"]:checked')).toHaveCount(1)

        await checkboxes.nth(1).uncheck({ force: true })
        await expect(page.locator('.tiptap input[type="checkbox"]:checked')).toHaveCount(0)
      })
    })
  })
})
