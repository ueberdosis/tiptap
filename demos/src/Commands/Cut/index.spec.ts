import { expect, test } from '@playwright/test'

import { clickButton, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Cut'
const frameworkPaths = ['React']
const demoPath = '/src/Commands'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.beforeEach(async ({ page }) => {
      await page.goto(fullDemoPath)
    })

    test.describe(`${frameworkPath}`, () => {
      test('cuts content to start of document', async ({ page }) => {
        const editor = page.locator('.tiptap')

        await setEditorContent(page, '<p>Hello world</p>')
        await expect(editor).toContainText('Hello world')

        // Select "world" (positions 7..12 in "Hello world")
        await editor.evaluate((el: any) => {
          el.editor.commands.setTextSelection({ from: 7, to: 12 })
        })

        await clickButton(page, 'Cut content to start of document')

        await expect(editor.locator('p').first()).toHaveText('worldHello ')
      })

      test('cuts content to end of document', async ({ page }) => {
        const editor = page.locator('.tiptap')

        await setEditorContent(page, '<p>Hello world</p>')
        await expect(editor).toContainText('Hello world')

        // Select "Hello" (positions 1..6 in "Hello world")
        await editor.evaluate((el: any) => {
          el.editor.commands.setTextSelection({ from: 1, to: 6 })
        })

        await clickButton(page, 'Cut content to end of document')

        await expect(editor.locator('p').nth(0)).toHaveText(' world')
        await expect(editor.locator('p').nth(1)).toHaveText('Hello')
      })
    })
  })
})
