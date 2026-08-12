import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'Text'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Nodes'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
      })

      test('wraps typed text in a paragraph', async ({ page }) => {
        await page.keyboard.type('Example Text')
        await expect(page.locator('.tiptap p')).toContainText('Example Text')
      })
    })
  })
})
