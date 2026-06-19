import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Bold'
const frameworkPaths = ['React', 'Vue', 'Solid']
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

      test('transforms b tags to strong tags', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p><b>Example Text</b></p>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p><strong>Example Text</strong></p>')
      })

      test('omits b tags with normal font weight inline style', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p><b style="font-weight: normal">Example Text</b></p>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p>Example Text</p>')
      })

      test('transforms any tag with bold inline style to strong tags', async ({ page }) => {
        const editor = await getEditor(page)
        const results = await editor.evaluate((el: any) => {
          const styles = ['bold', 'bolder', '500', '900']
          return styles.map(s => {
            el.editor.commands.setContent(
              `<p><span style="font-weight: ${s}">Example Text</span></p>`,
            )
            return el.editor.getHTML()
          })
        })
        results.forEach(html => expect(html).toBe('<p><strong>Example Text</strong></p>'))
      })

      test('button makes the selected text bold', async ({ page }) => {
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap strong')).toContainText('Example Text')
      })

      test('button toggles the selected text bold', async ({ page }) => {
        const editor = await getEditor(page)
        await page.locator('button').first().click()
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap strong')).toHaveCount(0)
      })

      test('keyboard shortcut makes selected text bold', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor.commands.focus()
          el.editor.commands.selectAll()
        })
        await editor.press(`${mod}+b`)
        await expect(page.locator('.tiptap strong')).toContainText('Example Text')
      })

      test('markdown shortcut creates bold text', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('**Bold**')
        await expect(page.locator('.tiptap strong')).toContainText('Bold')
      })

      test('alternative markdown shortcut creates bold text', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('__Bold__')
        await expect(page.locator('.tiptap strong')).toContainText('Bold')
      })
    })
  })
})
