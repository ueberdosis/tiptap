import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'RubyText'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Marks'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('renders the annotation as non-editable text', async ({ page }) => {
        await setEditorContent(page, '<p><ruby>漢字<rt>かんじ</rt></ruby></p>')

        const rt = page.locator('.tiptap rt').first()

        await expect(rt).toHaveText('かんじ')
        await expect(rt).toHaveAttribute('contenteditable', 'false')
      })

      test('arrow keys leave ruby base text in both directions', async ({ page }) => {
        await setEditorContent(page, '<p>before<ruby>漢字<rt>かんじ</rt></ruby>after</p>')

        const editor = await getEditor(page)
        const boundaries = await editor.evaluate((el: any) => {
          let from = 0
          let to = 0

          el.editor.state.doc.descendants((node: any, pos: number) => {
            if (node.isText && node.marks.some((mark: any) => mark.type.name === 'rubyText')) {
              from = pos
              to = pos + node.text.length
            }
          })

          return { from, to }
        })

        await editor.evaluate(
          (el: any, position: number) => el.editor.commands.setTextSelection(position),
          boundaries.to,
        )
        await editor.focus()
        await page.keyboard.press('ArrowRight')
        expect(await editor.evaluate((el: any) => el.editor.state.selection.from)).toBeGreaterThan(
          boundaries.to,
        )

        await editor.evaluate(
          (el: any, position: number) => el.editor.commands.setTextSelection(position),
          boundaries.from,
        )
        await editor.focus()
        await page.keyboard.press('ArrowLeft')
        expect(await editor.evaluate((el: any) => el.editor.state.selection.from)).toBeLessThan(
          boundaries.from,
        )
      })

      test('edits an annotation inline', async ({ page }) => {
        await setEditorContent(page, '<p><ruby>漢字<rt>かんじ</rt></ruby></p>')

        const editor = await getEditor(page)
        const rt = page.locator('.tiptap rt').first()

        await rt.click()
        const input = rt.locator('input')
        await input.fill('かんじ（新）')
        await input.press('Enter')

        expect(await editor.evaluate((el: any) => el.editor.getHTML())).toContain('かんじ（新）')
        await expect(rt).toHaveText('かんじ（新）')
      })

      test('submitting ruby text applies annotation to selection', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await page.keyboard.press('Home')
        await page.keyboard.press('Shift+ArrowRight')
        await page.keyboard.press('Shift+ArrowRight')

        await page.getByTestId('ruby-text-input').fill('とうきょう')
        await page.getByTestId('ruby-text-input').press('Enter')

        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toContain('とうきょう')
        expect(html).toContain('東京')
      })
    })
  })
})
