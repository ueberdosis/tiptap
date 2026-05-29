import { expect, test } from '@playwright/test'

const demoName = 'MultipleEditors'
const frameworkPaths = ['Vue']
const demoPath = '/src/Experiments'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('loads multiple editors', async ({ page }) => {
        await expect(page.locator('.tiptap').first()).toBeVisible()
      })
    })
  })
})
