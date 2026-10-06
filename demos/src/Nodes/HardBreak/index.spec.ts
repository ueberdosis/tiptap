import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'HardBreak'
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
      })

      test('parses hard breaks correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p>Example<br>Text</p>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p>Example<br>Text</p>')
      })

      test('parses hard breaks with self-closing tag', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p>Example<br />Text</p>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p>Example<br>Text</p>')
      })

      test('button adds a line break', async ({ page }) => {
        await expect(page.locator('.tiptap br')).toHaveCount(0)
        await page.locator('button').first().click()
        const count = await page.locator('.tiptap br').count()
        expect(count).toBeGreaterThan(0)
      })

      test('Shift+Enter adds a line break', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.click()
        await page.keyboard.press('Shift+Enter')
        const count = await page.locator('.tiptap br').count()
        expect(count).toBeGreaterThan(0)
      })

      test('Mod+Enter adds a line break', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.click()
        await page.keyboard.press(`${mod}+Enter`)
        const count = await page.locator('.tiptap br').count()
        expect(count).toBeGreaterThan(0)
      })
    })
  })
})
