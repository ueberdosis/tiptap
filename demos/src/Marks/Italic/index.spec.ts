import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Italic'
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

      test('i tags transform to em tags', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p><i>Example Text</i></p>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p><em>Example Text</em></p>')
      })

      test('omits i tags with normal font style', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p><i style="font-style: normal">Example Text</i></p>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p>Example Text</p>')
      })

      test('generic tags with italic style transform to em tags', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p><span style="font-style: italic">Example Text</span></p>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p><em>Example Text</em></p>')
      })

      test('button makes selected text italic', async ({ page }) => {
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap em')).toContainText('Example Text')
      })

      test('button toggles selected text italic', async ({ page }) => {
        const editor = await getEditor(page)
        await page.locator('button').first().click()
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap em')).toHaveCount(0)
      })

      test('keyboard shortcut makes selected text italic', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor.commands.focus()
          el.editor.commands.selectAll()
        })
        await editor.press(`${mod}+i`)
        await expect(page.locator('.tiptap em')).toContainText('Example Text')
      })

      test('markdown shortcut creates italic text', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('*Italic* ')
        await expect(page.locator('.tiptap em')).toContainText('Italic')
      })
    })
  })
})
