import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'OrderedList'
const frameworkPaths = ['React', 'Vue']
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

      test('parses ordered lists correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<ol><li><p>Example Text</p></li></ol>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<ol><li><p>Example Text</p></li></ol>')
      })

      test('parses ordered lists without paragraphs correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<ol><li>Example Text</li></ol>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<ol><li><p>Example Text</p></li></ol>')
      })

      test('button makes the selected line an ordered list item', async ({ page }) => {
        await expect(page.locator('.tiptap ol')).toHaveCount(0)
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap ol li')).toContainText('Example Text')
      })

      test('button toggles the ordered list', async ({ page }) => {
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap ol')).toContainText('Example Text')
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap ol')).toHaveCount(0)
      })

      test('keyboard shortcut creates an ordered list', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor.commands.focus()
          el.editor.commands.selectAll()
        })
        await editor.press(`${mod}+Shift+7`)
        await expect(page.locator('.tiptap ol li')).toContainText('Example Text')
      })

      test('creates an ordered list from "1."', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('1. List Item 1')
        await page.keyboard.press('Enter')
        await editor.type('List Item 2')
        await expect(page.locator('.tiptap li').nth(0)).toContainText('List Item 1')
        await expect(page.locator('.tiptap li').nth(1)).toContainText('List Item 2')
      })

      test('removes the ordered list after backspace', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('1. ')
        await page.keyboard.press('Backspace')
        await editor.type('Example')
        await expect(page.locator('.tiptap p')).toContainText('1. Example')
      })

      // ── Type attribute tests ──

      test('preserves type="a" attribute in HTML output', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent(
            '<ol type="a"><li><p>Item A</p></li><li><p>Item B</p></li></ol>',
          )
          return el.editor.getHTML()
        })
        expect(html).toContain('type="a"')
      })

      test('preserves type="I" attribute in HTML output', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<ol type="I"><li><p>Item 1</p></li></ol>')
          return el.editor.getHTML()
        })
        expect(html).toContain('type="I"')
      })

      test('does not render type attribute for default type', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<ol><li><p>Item</p></li></ol>')
          return el.editor.getHTML()
        })
        expect(html).not.toContain('type')
      })
    })
  })
})
