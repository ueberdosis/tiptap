import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'Community'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await getEditor(page)
      })

      test('should count the characters correctly', async ({ page }) => {
        await expect(page.locator('.character-count')).toContainText('44 / 280 characters')

        const editor = await getEditor(page)

        await editor.click()
        await editor.evaluate((el: any) => el.editor.commands.focus('end'))
        await page.keyboard.type(' Hello World')

        await expect(page.locator('.character-count')).toContainText('56 / 280 characters')

        await editor.evaluate((el: any) => {
          el.editor.chain().focus().clearContent().run()
        })
        await page.keyboard.type('Hello World')

        await expect(page.locator('.character-count')).toContainText('11 / 280 characters')
      })

      test('should mention a user', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.chain().focus().clearContent().run()
        })
        await editor.click()
        await editor.type('@')

        const dropdown = page.locator('.dropdown-menu')
        await expect(dropdown).toBeVisible()

        const firstButton = dropdown.locator('button').first()
        const name = await firstButton.innerText()

        await firstButton.click()

        await expect(page.locator('.tiptap')).toHaveText(`@${name} `)
        await expect(page.locator('.character-count')).toContainText('2 / 280 characters')
      })
    })
  })
})
