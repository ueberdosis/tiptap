import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'UniqueID'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Extensions'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await getEditor(page)
      })

      test('headings have unique IDs', async ({ page }) => {
        await expect(page.locator('.tiptap h1').first()).toHaveAttribute('data-id', /.+/)
      })

      test('paragraphs have unique IDs', async ({ page }) => {
        await expect(page.locator('.tiptap p').first()).toHaveAttribute('data-id', /.+/)
      })
    })
  })
})
