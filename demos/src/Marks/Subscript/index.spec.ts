import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Subscript'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Marks'

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

      test('transforms inline style to sub tags', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p><span style="vertical-align: sub">Example Text</span></p>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p><sub>Example Text</sub></p>')
      })

      test('omits inline style with a different vertical-align', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p><b style="vertical-align: middle">Example Text</b></p>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p>Example Text</p>')
      })

      test('button makes the selected text subscript', async ({ page }) => {
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap sub')).toContainText('Example Text')
      })

      test('button toggles subscript on selected text', async ({ page }) => {
        const editor = await getEditor(page)
        await page.locator('button').first().click()
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap sub')).toHaveCount(0)
      })
    })
  })
})
