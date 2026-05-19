import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'CustomParagraph'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('should have a working tiptap instance', async ({ page }) => {
        const editor = await getEditor(page)
        const hasEditor = await editor.evaluate((el: any) => !!el.editor)

        expect(hasEditor).toBe(true)
      })

      test('should have a paragraph and text length', async ({ page }) => {
        await expect(page.locator('.tiptap p').first()).toHaveText(
          'Each line shows the number of characters in the paragraph.',
        )
        await expect(page.locator('.tiptap .label').first()).toHaveText('58')
      })

      test('should have new paragraph', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.chain().focus().setContent('<p>First line</p>').run()
        })
        await editor.click()
        await editor.press('End')
        await editor.press('Enter')

        await expect(page.locator('.tiptap p').nth(1)).toHaveText('')
        await expect(page.locator('.tiptap .label').nth(1)).toHaveText('0')
      })
    })
  })
})
