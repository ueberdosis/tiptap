import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'Minimal'
const frameworkPaths = ['React', 'Vue', 'Solid']
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

      test('text should be wrapped in a paragraph by default', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.type('Example Text')

        await expect(page.locator('.tiptap p')).toContainText('Example Text')
      })

      test('should parse paragraphs correctly', async ({ page }) => {
        const editor = await getEditor(page)

        const result = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p>Example Text</p>')
          const first = el.editor.getHTML()
          el.editor.commands.setContent('<p style="color:DodgerBlue;">Example Text</p>')
          return [first, el.editor.getHTML()]
        })

        expect(result).toEqual(['<p>Example Text</p>', '<p>Example Text</p>'])
      })

      test('enter should make a new paragraph', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.type('First Paragraph')
        await editor.press('Enter')
        await editor.type('Second Paragraph')

        await expect(page.locator('.tiptap p')).toHaveCount(2)
      })

      test('backspace should remove the last paragraph', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.press('Enter')
        await expect(page.locator('.tiptap p')).toHaveCount(2)

        await editor.press('Backspace')
        await expect(page.locator('.tiptap p')).toHaveCount(1)
      })
    })
  })
})
