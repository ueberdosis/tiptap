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
        await setEditorContent(page, '<p>東京</p>')

        const editor = await getEditor(page)

        await editor.click()
        await page.keyboard.press('Home')
        await page.keyboard.press('Shift+ArrowRight')
        await page.keyboard.press('Shift+ArrowRight')

        await expect
          .poll(() =>
            editor.evaluate(
              (el: any) => el.editor.state.selection.to - el.editor.state.selection.from,
            ),
          )
          .toBe(2)

        const rubyTextInput = page.locator('[data-test-id="ruby-text-input"]')

        await rubyTextInput.fill('とうきょう')
        await rubyTextInput.press('Enter')

        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toContain('とうきょう')
        expect(html).toContain('東京')
      })
    })
  })
})
