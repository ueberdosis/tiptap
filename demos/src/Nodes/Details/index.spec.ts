import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Details'
const frameworkPaths = ['Vue']
const demoPath = '/src/Nodes'

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

      test('parses details tags correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<details><summary>Summary</summary><p>Content</p></details>')
          return el.editor.getHTML()
        })
        expect(html).toBe(
          '<details class="details"><summary>Summary</summary><div data-type="detailsContent"><p>Content</p></div></details><p></p>',
        )
      })

      test('setDetails makes the selected line a details node', async ({ page }) => {
        await expect(page.locator('.tiptap [data-type="details"]')).toHaveCount(0)
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap [data-type="details"] [data-type="detailsContent"]')).toContainText(
          'Example Text',
        )
      })

      test('unsetDetails makes the line a paragraph node', async ({ page }) => {
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap [data-type="details"]')).toHaveCount(1)
        await page.locator('button').nth(1).click()
        await expect(page.locator('.tiptap [data-type="details"]')).toHaveCount(0)
      })
    })
  })
})
