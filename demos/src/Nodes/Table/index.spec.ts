import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'Table'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Nodes'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
      })

      test('creates a 1x1 table', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.insertTable({ cols: 1, rows: 1, withHeaderRow: false }))
        await expect(page.locator('.tiptap td')).toHaveCount(1)
        await expect(page.locator('.tiptap tr')).toHaveCount(1)
      })

      test('creates a 3x1 table', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.insertTable({ cols: 3, rows: 1, withHeaderRow: false }))
        await expect(page.locator('.tiptap td')).toHaveCount(3)
        await expect(page.locator('.tiptap tr')).toHaveCount(1)
      })

      test('creates a 1x3 table', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.insertTable({ cols: 1, rows: 3, withHeaderRow: false }))
        await expect(page.locator('.tiptap td')).toHaveCount(3)
        await expect(page.locator('.tiptap tr')).toHaveCount(3)
      })

      test('creates a 1x3 table with header row', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.insertTable({ cols: 1, rows: 3, withHeaderRow: true }))
        await expect(page.locator('.tiptap th')).toHaveCount(1)
        await expect(page.locator('.tiptap td')).toHaveCount(2)
        await expect(page.locator('.tiptap tr')).toHaveCount(3)
      })

      test('creates a 3x3 table with defaults', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.insertTable())
        await expect(page.locator('.tiptap th')).toHaveCount(3)
        await expect(page.locator('.tiptap td')).toHaveCount(6)
        await expect(page.locator('.tiptap tr')).toHaveCount(3)
      })

      test('sets minimum width on colgroups', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.insertTable({ cols: 3, rows: 1, withHeaderRow: false }))
        await expect(page.locator('.tiptap col').first()).toHaveAttribute('style', 'min-width: 25px;')
      })

      test('generates correct markup for 1x1 table', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.insertTable({ cols: 1, rows: 1, withHeaderRow: false })
          return el.editor.getHTML()
        })
        expect(html).toBe(
          '<table style="min-width: 25px"><colgroup><col style="min-width: 25px"></colgroup><tbody><tr><td colspan="1" rowspan="1"><p></p></td></tr></tbody></table>',
        )
      })

      test('generates correct markup for 1x1 table with header', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.insertTable({ cols: 1, rows: 1, withHeaderRow: true })
          return el.editor.getHTML()
        })
        expect(html).toBe(
          '<table style="min-width: 25px"><colgroup><col style="min-width: 25px"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p></p></th></tr></tbody></table>',
        )
      })
    })
  })
})
