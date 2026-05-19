import { expect, test } from '@playwright/test'

import { clickButton, getEditor } from '../../../test/helpers.js'

const demoName = 'Images'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
          window.prompt = () => 'https://placehold.co/400x400'
        })
        await page.goto(fullDemoPath)
        await getEditor(page)
      })

      test('finds image elements inside editor', async ({ page }) => {
        await expect(page.locator('.tiptap img')).toHaveCount(2)
      })

      test('allows removing images', async ({ page }) => {
        const editor = await getEditor(page)

        await expect(page.locator('.tiptap img')).toHaveCount(2)

        await page.locator('.tiptap img').first().click()
        await expect(page.locator('.tiptap img.ProseMirror-selectednode')).toBeVisible()

        await editor.press('Backspace')

        await expect(page.locator('.tiptap img')).toHaveCount(1)
      })

      test('allows images to be added via URL', async ({ page }) => {
        await clickButton(page, 'Add image from URL')
        await expect(page.locator('.tiptap img')).toHaveCount(3)
      })
    })
  })
})
