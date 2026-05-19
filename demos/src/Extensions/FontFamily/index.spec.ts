import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoPath = '/src/Extensions'
const demoName = 'FontFamily'

test.describe(`${demoPath}/${demoName}`, () => {
  test.describe('React', () => {
    const fullDemoPath = `${demoPath}/${demoName}/React/`

    test.beforeEach(async ({ page }) => {
      await page.goto(fullDemoPath)
      await setEditorContent(page, '<p>Example Text</p>')
      const editor = await getEditor(page)
      await editor.evaluate((el: any) => el.editor.commands.selectAll())
    })

    test('sets the font-family of the selected text', async ({ page }) => {
      const button = page.locator('[data-test-id="monospace"]')
      await expect(button).not.toHaveClass(/is-active/)
      await button.click()
      await expect(button).toHaveClass(/is-active/)
      await expect(page.locator('.tiptap span').first()).toHaveAttribute('style', 'font-family: monospace')
    })

    test('removes the font-family of the selected text', async ({ page }) => {
      await page.locator('[data-test-id="monospace"]').click()
      await expect(page.locator('.tiptap span')).toHaveCount(1)
      await page.locator('[data-test-id="unsetFontFamily"]').click()
      await expect(page.locator('.tiptap span')).toHaveCount(0)
    })

    test('allows CSS variables as a font-family', async ({ page }) => {
      const button = page.locator('[data-test-id="css-variable"]')
      await expect(button).not.toHaveClass(/is-active/)
      await button.click()
      await expect(button).toHaveClass(/is-active/)
      await expect(page.locator('.tiptap span').first()).toHaveAttribute(
        'style',
        'font-family: var(--title-font-family)',
      )
    })

    test('allows fonts containing multiple font families', async ({ page }) => {
      const button = page.locator('[data-test-id="comic-sans"]')
      await button.click()
      await expect(page.locator('.tiptap span').first()).toHaveAttribute(
        'style',
        'font-family: "Comic Sans MS", "Comic Sans"',
      )
    })

    test('allows fonts containing a space and number as a font-family', async ({ page }) => {
      const button = page.locator('[data-test-id="exo2"]')
      await button.click()
      await expect(page.locator('.tiptap span').first()).toHaveAttribute('style', 'font-family: "Exo 2"')
    })
  })

  test.describe('Vue', () => {
    const fullDemoPath = `${demoPath}/${demoName}/Vue/`

    test('loads the editor', async ({ page }) => {
      await page.goto(fullDemoPath)
      const editor = await getEditor(page)
      await expect(editor).toBeVisible()
    })
  })
})
