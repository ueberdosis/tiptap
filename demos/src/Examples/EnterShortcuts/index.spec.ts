import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'EnterShortcuts'
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
          el.editor.commands.setContent('<p>Example Text</p>')
        })
      })

      test('should update the hint html on Meta+Enter', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.press('Meta+Enter')

        await expect(page.locator('.hint')).toContainText('Meta-Enter was the last shortcut')
      })

      test('should update the hint html on Shift+Enter', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.press('Shift+Enter')

        await expect(page.locator('.hint')).toContainText('Shift-Enter was the last shortcut')
      })

      test('should update the hint html on Ctrl+Enter', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.press('Control+Enter')

        await expect(page.locator('.hint')).toContainText('Ctrl-Enter was the last shortcut')
      })
    })
  })
})
