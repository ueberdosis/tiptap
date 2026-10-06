import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Strike'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Marks'

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
      ;[
        ['<p><s>Example Text</s></p>', '<p><s>Example Text</s></p>'],
        ['<p><del>Example Text</del></p>', '<p><s>Example Text</s></p>'],
        ['<p><strike>Example Text</strike></p>', '<p><s>Example Text</s></p>'],
        [
          '<p><span style="text-decoration: line-through">Example Text</span></p>',
          '<p><s>Example Text</s></p>',
        ],
      ].forEach(([input, expected]) => {
        test(`parses ${input}`, async ({ page }) => {
          const editor = await getEditor(page)
          const html = await editor.evaluate((el: any, content: string) => {
            el.editor.commands.setContent(content)
            return el.editor.getHTML()
          }, input)
          expect(html).toBe(expected)
        })
      })

      test('button strikes selected text', async ({ page }) => {
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap s')).toContainText('Example Text')
      })

      test('button toggles strike on selected text', async ({ page }) => {
        const editor = await getEditor(page)
        await page.locator('button').first().click()
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap s')).toHaveCount(0)
      })

      test('keyboard shortcut strikes selected text', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor.commands.focus()
          el.editor.commands.selectAll()
        })
        await editor.press(`${mod}+Shift+s`)
        await expect(page.locator('.tiptap s')).toContainText('Example Text')
      })

      test('markdown shortcut creates striked text', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('~~Strike~~')
        await expect(page.locator('.tiptap s')).toContainText('Strike')
      })
    })
  })
})
