import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'Images'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await getEditor(page)
      })

      test('removes a selected image with Backspace', async ({ page }) => {
        const editor = await getEditor(page)

        await expect(page.locator('.tiptap img')).toHaveCount(2)

        await page.locator('.tiptap img').first().click()
        await expect(page.locator('.tiptap img.ProseMirror-selectednode')).toBeVisible()

        await editor.press('Backspace')

        await expect(page.locator('.tiptap img')).toHaveCount(1)
      })
    })
  })
})
