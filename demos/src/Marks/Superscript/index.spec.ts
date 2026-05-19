import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Superscript'
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

      test('transforms inline style to sup tags', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p><span style="vertical-align: super">Example Text</span></p>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p><sup>Example Text</sup></p>')
      })

      test('omits inline style with a different vertical-align', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p><span style="vertical-align: middle">Example Text</span></p>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p>Example Text</p>')
      })

      test('button makes the selected text superscript', async ({ page }) => {
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap sup')).toContainText('Example Text')
      })

      test('button toggles superscript on selected text', async ({ page }) => {
        const editor = await getEditor(page)
        await page.locator('button').first().click()
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap sup')).toHaveCount(0)
      })
    })
  })
})
