import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'TextAlign'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Extensions'

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

      test('parses a null alignment correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p>Example Text</p>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p>Example Text</p>')
      })
      ;['left', 'center', 'right', 'justify'].forEach(alignment => {
        test(`parses ${alignment} align text correctly`, async ({ page }) => {
          const editor = await getEditor(page)
          const html = await editor.evaluate((el: any, a: string) => {
            el.editor.commands.setContent(`<p style="text-align: ${a}">Example Text</p>`)
            return el.editor.getHTML()
          }, alignment)
          expect(html).toBe(`<p style="text-align: ${alignment};">Example Text</p>`)
        })
      })

      test('keeps the text aligned when toggling headings', async ({ page }) => {
        const editor = await getEditor(page)
        const result = await editor.evaluate((el: any) => {
          const alignments = ['center', 'right', 'justify']
          const headings = [1, 2]
          const out: string[] = []
          alignments.forEach(alignment => {
            headings.forEach(level => {
              el.editor.commands.setContent(`<p style="text-align: ${alignment}">Example Text</p>`)
              el.editor.commands.toggleHeading({ level })
              out.push(el.editor.getHTML())
            })
          })
          return out
        })

        const alignments = ['center', 'right', 'justify']
        const headings = [1, 2]
        const expected: string[] = []
        alignments.forEach(alignment => {
          headings.forEach(level => {
            expected.push(`<h${level} style="text-align: ${alignment};">Example Text</h${level}>`)
          })
        })
        expect(result).toEqual(expected)
      })

      test('aligns the text left on the 1st button', async ({ page }) => {
        await page.locator('button').nth(0).click()
        await expect(page.locator('.tiptap p')).toHaveCSS('text-align', 'left')
      })

      test('aligns the text center on the 2nd button', async ({ page }) => {
        await page.locator('button').nth(1).click()
        await expect(page.locator('.tiptap p')).toHaveCSS('text-align', 'center')
      })

      test('aligns the text right on the 3rd button', async ({ page }) => {
        await page.locator('button').nth(2).click()
        await expect(page.locator('.tiptap p')).toHaveCSS('text-align', 'right')
      })

      test('aligns the text justified when pressing the keyboard shortcut', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.click()
        await page.keyboard.press(`${mod}+Shift+J`)
        await expect(page.locator('.tiptap p')).toHaveCSS('text-align', 'justify')
      })
    })
  })
})
