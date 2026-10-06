import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'HorizontalRule'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Nodes'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await setEditorContent(page, '<p>Example Text</p>')
      })

      test('parses horizontal rules correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p>Example Text</p><hr>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p>Example Text</p><hr>')
      })

      test('parses horizontal rules with self-closing tag', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p>Example Text</p><hr />')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p>Example Text</p><hr>')
      })

      test('button adds a horizontal rule', async ({ page }) => {
        await expect(page.locator('.tiptap hr')).toHaveCount(0)
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap hr')).toHaveCount(1)
      })

      test('markdown shortcut --- adds a horizontal rule', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('---')
        await expect(page.locator('.tiptap hr')).toHaveCount(1)
      })

      test('markdown shortcut ___ adds a horizontal rule', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('___ ')
        await expect(page.locator('.tiptap hr')).toHaveCount(1)
      })

      test('replaces selection correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html1 = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p>Example Text</p><p>Example Text</p>')
          el.editor.commands.setTextSelection({ from: 0, to: 15 })
          el.editor.commands.setHorizontalRule()
          return el.editor.getHTML()
        })
        expect(html1).toBe('<hr><p>Example Text</p>')

        const html2 = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p>Example Text</p><p>Example Text</p>')
          el.editor.commands.setTextSelection({ from: 13, to: 15 })
          el.editor.commands.setHorizontalRule()
          return el.editor.getHTML()
        })
        expect(html2).toBe('<p>Example Text</p><hr><p>Example Text</p>')
      })
    })
  })
})
