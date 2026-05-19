import { expect, test } from '@playwright/test'

const demoName = 'Mathematics'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Extensions'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('includes katex-rendered inline and block nodes', async ({ page }) => {
        await expect(page.locator('.tiptap span[data-type="inline-math"]')).toHaveCount(21)
        await expect(page.locator('.tiptap div[data-type="block-math"]')).toHaveCount(1)
        await expect(page.locator('.tiptap span[data-type="inline-math"] .katex')).toHaveCount(21)
        await expect(page.locator('.tiptap div[data-type="block-math"] .katex')).toHaveCount(1)
      })
    })
  })
})
