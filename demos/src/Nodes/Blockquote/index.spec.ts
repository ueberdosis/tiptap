import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Blockquote'
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

      test('parses blockquote tags correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<blockquote><p>Example Text</p></blockquote>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<blockquote><p>Example Text</p></blockquote>')
      })

      test('parses blockquote tags without paragraphs correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<blockquote>Example Text</blockquote>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<blockquote><p>Example Text</p></blockquote>')
      })

      test('button makes the selected line a blockquote', async ({ page }) => {
        await expect(page.locator('.tiptap blockquote')).toHaveCount(0)
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap blockquote')).toContainText('Example Text')
      })

      test('button wraps all nodes in one blockquote', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p>Example Text</p><p>Example Text</p>')
          el.editor.commands.selectAll()
        })
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap blockquote')).toHaveCount(1)
      })

      test('button toggles the blockquote', async ({ page }) => {
        const editor = await getEditor(page)
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap blockquote')).toContainText('Example Text')
        const isActive = await editor.evaluate((el: any) => el.editor.isActive('blockquote'))
        expect(isActive).toBe(true)
      })

      test('keyboard shortcut makes selected line a blockquote', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor.commands.focus()
          el.editor.commands.selectAll()
        })
        await editor.press(`${mod}+Shift+b`)
        await expect(page.locator('.tiptap blockquote')).toContainText('Example Text')
      })

      test('markdown shortcut creates blockquote', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('> Quote')
        await expect(page.locator('.tiptap blockquote')).toContainText('Quote')
      })
    })
  })
})
