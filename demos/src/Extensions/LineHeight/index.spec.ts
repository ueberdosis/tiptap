import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'LineHeight'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Extensions'

const cases: { id: string; style: string }[] = [
  { id: '1.5', style: 'line-height: 1.5' },
  { id: '2.0', style: 'line-height: 2.0' },
  { id: '4.0', style: 'line-height: 4.0' },
]

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

      cases.forEach(({ id, style }) => {
        test(`sets line-height ${id} for the selected text`, async ({ page }) => {
          const button = page.locator(`[data-test-id="${id}"]`)
          await expect(button).not.toHaveClass(/is-active/)
          await button.click()
          await expect(button).toHaveClass(/is-active/)
          await expect(page.locator('.tiptap span').first()).toHaveAttribute('style', style)
        })
      })

      test('removes the line-height of the selected text', async ({ page }) => {
        await page.locator('[data-test-id="1.5"]').click()
        await expect(page.locator('.tiptap span').first()).toHaveAttribute('style', 'line-height: 1.5')

        await page.locator('[data-test-id="unsetLineHeight"]').click()
        await expect(page.locator('.tiptap span')).toHaveCount(0)
      })
    })
  })
})
