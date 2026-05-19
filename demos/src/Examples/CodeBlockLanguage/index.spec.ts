import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'CodeBlockLanguage'
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

      test('should have hljs classes for syntax highlighting', async ({ page }) => {
        const count = await page.locator('[class^=hljs]').count()

        expect(count).toBeGreaterThan(0)
      })

      test('should have different count of hljs classes after switching language', async ({ page }) => {
        const initialCount = await page.locator('[class^=hljs]').count()
        expect(initialCount).toBeGreaterThan(0)

        await page.locator('.tiptap select').selectOption('java')

        await expect.poll(async () => page.locator('[class^=hljs]').count(), { timeout: 5000 }).not.toBe(initialCount)
      })
    })
  })
})
