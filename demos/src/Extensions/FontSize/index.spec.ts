import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'FontSize'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Extensions'

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

      test('sets the font-size of the selected text', async ({ page }) => {
        const button = page.locator('[data-test-id="28px"]')
        await expect(button).not.toHaveClass(/is-active/)
        await button.click()
        await expect(button).toHaveClass(/is-active/)
        await expect(page.locator('.tiptap span').first()).toHaveAttribute('style', 'font-size: 28px')
      })

      test('removes the font-size of the selected text', async ({ page }) => {
        await page.locator('[data-test-id="28px"]').click()
        await expect(page.locator('.tiptap span').first()).toHaveAttribute('style', 'font-size: 28px')
        await page.locator('[data-test-id="unsetFontSize"]').click()
        await expect(page.locator('.tiptap span')).toHaveCount(0)
      })
    })
  })
})
