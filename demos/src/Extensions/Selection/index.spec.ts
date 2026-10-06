import { expect, test } from '@playwright/test'

const demoName = 'Selection'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Extensions'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('first span has selection class', async ({ page }) => {
        await expect(page.locator('.tiptap span').first()).toHaveClass(/selection/)
      })
    })
  })
})
