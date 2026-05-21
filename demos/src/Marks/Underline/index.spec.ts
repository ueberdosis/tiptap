import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Underline'
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

      test('parses u tags', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p><u>Example Text</u></p>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p><u>Example Text</u></p>')
      })

      test('transforms any tag with text-decoration underline to u tags', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p><span style="text-decoration: underline">Example Text</span></p>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p><u>Example Text</u></p>')
      })

      test('button underlines selected text', async ({ page }) => {
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap u')).toContainText('Example Text')
      })

      test('button toggles underline on selected text', async ({ page }) => {
        const editor = await getEditor(page)
        await page.locator('button').first().click()
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap u')).toHaveCount(0)
      })

      test('keyboard shortcut underlines selected text', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor.commands.focus()
          el.editor.commands.selectAll()
        })
        await editor.press(`${mod}+u`)
        await expect(page.locator('.tiptap u')).toContainText('Example Text')
      })
    })
  })
})
