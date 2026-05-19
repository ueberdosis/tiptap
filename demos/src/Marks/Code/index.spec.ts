import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Code'
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

      test('parses code tags correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html1 = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p><code>Example Text</code></p>')
          return el.editor.getHTML()
        })
        expect(html1).toBe('<p><code>Example Text</code></p>')
      })

      test('button marks selected text as inline code', async ({ page }) => {
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap code')).toContainText('Example Text')
      })

      test('button toggles inline code', async ({ page }) => {
        const editor = await getEditor(page)
        await page.locator('button').first().click()
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap code')).toHaveCount(0)
      })

      test('keyboard shortcut creates inline code', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor.commands.focus()
          el.editor.commands.selectAll()
        })
        await editor.press(`${mod}+e`)
        await expect(page.locator('.tiptap code')).toContainText('Example Text')
      })

      test('markdown shortcut creates inline code', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('`Example`')
        await expect(page.locator('.tiptap code')).toContainText('Example')
      })
    })
  })
})
