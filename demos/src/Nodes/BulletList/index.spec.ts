import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'BulletList'
const frameworkPaths = ['React', 'Vue', 'Svelte']
const demoPath = '/src/Nodes'

const isMac = process.platform === 'darwin'
const mod = isMac ? 'Meta' : 'Control'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await setEditorContent(page, '<p>Example Text</p>')
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
      })

      test('parses unordered lists correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<ul><li><p>Example Text</p></li></ul>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<ul><li><p>Example Text</p></li></ul>')
      })

      test('parses unordered lists without paragraphs correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<ul><li>Example Text</li></ul>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<ul><li><p>Example Text</p></li></ul>')
      })

      test('button makes selected line a bullet list item', async ({ page }) => {
        await expect(page.locator('.tiptap ul')).toHaveCount(0)
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap ul li')).toContainText('Example Text')
      })

      test('button toggles the bullet list', async ({ page }) => {
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap ul')).toContainText('Example Text')
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap ul')).toHaveCount(0)
      })

      test('keyboard shortcut creates a bullet list', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor.commands.focus()
          el.editor.commands.selectAll()
        })
        await editor.press(`${mod}+Shift+8`)
        await expect(page.locator('.tiptap ul li')).toContainText('Example Text')
      })
      ;[
        ['asterisk', '*'],
        ['dash', '-'],
        ['plus', '+'],
      ].forEach(([name, char]) => {
        test(`creates a bullet list from a ${name}`, async ({ page }) => {
          const editor = await getEditor(page)
          await editor.evaluate((el: any) => el.editor.commands.clearContent())
          await editor.click()
          await page.keyboard.type(`${char} List Item 1`)
          await page.keyboard.press('Enter')
          await editor.type('List Item 2')
          await expect(page.locator('.tiptap li').nth(0)).toContainText('List Item 1')
          await expect(page.locator('.tiptap li').nth(1)).toContainText('List Item 2')
        })
      })

      test('removes the bullet list after pressing backspace', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('* ')
        await page.keyboard.press('Backspace')
        await editor.type('Example')
        await expect(page.locator('.tiptap p')).toContainText('* Example')
      })
    })
  })
})
