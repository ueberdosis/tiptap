import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'BackgroundColor'
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

      test('sets the background color of the selected text', async ({ page }) => {
        const purple = page.locator('[data-testid="setPurple"]')

        await expect(purple).not.toHaveClass(/is-active/)
        await purple.click()
        await expect(purple).toHaveClass(/is-active/)
        await expect(page.locator('.tiptap span').first()).toHaveAttribute('style', 'background-color: #958DF1')
      })

      test('removes the background color of the selected text', async ({ page }) => {
        await page.locator('[data-testid="setPurple"]').click()
        await expect(page.locator('.tiptap span')).toHaveCount(1)

        await page.locator('[data-testid="unsetBackgroundColor"]').click()
        await expect(page.locator('.tiptap span')).toHaveCount(0)
      })

      test('changes background color with color picker', async ({ page }) => {
        await page.locator('input[type=color]').evaluate((el: HTMLInputElement) => {
          el.value = '#ff0000'
          el.dispatchEvent(new Event('input', { bubbles: true }))
        })

        await expect(page.locator('.tiptap span').first()).toHaveAttribute('style', 'background-color: #ff0000')
      })

      test('matches background color and color picker color values', async ({ page }) => {
        await page.locator('[data-testid="setPurple"]').click()
        await expect(page.locator('input[type=color]')).toHaveValue('#958df1')
      })

      test('toggles is-active state when applied and unset', async ({ page }) => {
        const purple = page.locator('[data-testid="setPurple"]')
        await purple.click()
        await expect(purple).toHaveClass(/is-active/)

        await page.locator('[data-testid="unsetBackgroundColor"]').click()
        await expect(purple).not.toHaveClass(/is-active/)
      })
    })
  })
})
