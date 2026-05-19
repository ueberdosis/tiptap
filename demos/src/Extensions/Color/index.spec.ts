import { expect, test } from '@playwright/test'

import { clickButton, getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Color'
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

      test('sets the color of the selected text', async ({ page }) => {
        const purpleButton = page.getByRole('button', { name: 'Purple', exact: true })

        await expect(purpleButton).not.toHaveClass(/is-active/)
        await purpleButton.click()
        await expect(purpleButton).toHaveClass(/is-active/)
        await expect(page.locator('.tiptap span').first()).toHaveAttribute('style', 'color: #958DF1')
      })

      test('removes the color of the selected text', async ({ page }) => {
        await clickButton(page, 'Purple')
        await expect(page.locator('.tiptap span')).toHaveCount(1)

        await clickButton(page, 'Unset color')
        await expect(page.locator('.tiptap span')).toHaveCount(0)
      })

      test('changes text color with color picker', async ({ page }) => {
        await page.locator('input[type=color]').evaluate((el: HTMLInputElement) => {
          el.value = '#ff0000'
          el.dispatchEvent(new Event('input', { bubbles: true }))
        })

        await expect(page.locator('.tiptap span').first()).toHaveAttribute('style', 'color: #ff0000')
      })

      test('matches text and color picker color values', async ({ page }) => {
        await clickButton(page, 'Purple')
        await expect(page.locator('input[type=color]')).toHaveValue('#958df1')
      })
    })
  })
})
