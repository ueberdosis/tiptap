import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'IsolatingClear'
const frameworkPaths = ['React']
const demoPath = '/src/Experiments'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await setEditorContent(page, '<h1>Example Text</h1>')
        const editor = await getEditor(page)
        await editor.click()
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
      })

      test('applies the paragraph style when the keyboard shortcut is pressed', async ({ page }) => {
        const editor = await getEditor(page)

        await expect(editor.locator('h1')).toHaveCount(1)

        const isMac = process.platform === 'darwin'
        await editor.press(isMac ? 'Meta+Alt+0' : 'Control+Alt+0')

        await expect(editor.locator('p').first()).toContainText('Example Text')
        await expect(editor.locator('h1')).toHaveCount(0)
      })
    })
  })
})
