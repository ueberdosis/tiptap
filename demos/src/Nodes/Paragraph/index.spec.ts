import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'Paragraph'
const frameworkPaths = ['React', 'Vue', 'Svelte']
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

      test('parses paragraphs correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const results = await editor.evaluate((el: any) => {
          const inputs = [
            '<p>Example Text</p>',
            '<p><x-unknown>Example Text</x-unknown></p>',
            '<p style="display: block;">Example Text</p>',
          ]
          return inputs.map(input => {
            el.editor.commands.setContent(input)
            return el.editor.getHTML()
          })
        })
        results.forEach(html => expect(html).toBe('<p>Example Text</p>'))
      })

      test('wraps text in a paragraph by default', async ({ page }) => {
        await page.keyboard.type('Example Text')
        await expect(page.locator('.tiptap p')).toContainText('Example Text')
      })

      test('enter creates a new paragraph', async ({ page }) => {
        await page.keyboard.type('First Paragraph')
        await page.keyboard.press('Enter')
        await page.keyboard.type('Second Paragraph')
        await expect(page.locator('.tiptap p')).toHaveCount(2)
        await expect(page.locator('.tiptap p').nth(0)).toContainText('First Paragraph')
        await expect(page.locator('.tiptap p').nth(1)).toContainText('Second Paragraph')
      })

      test('backspace removes the second paragraph', async ({ page }) => {
        await page.keyboard.press('Enter')
        await expect(page.locator('.tiptap p')).toHaveCount(2)
        await page.keyboard.press('Backspace')
        await expect(page.locator('.tiptap p')).toHaveCount(1)
      })
    })
  })
})
