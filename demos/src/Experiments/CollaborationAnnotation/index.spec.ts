import { expect, test } from '@playwright/test'

const demoName = 'CollaborationAnnotation'
const frameworkPaths = ['Vue']
const demoPath = '/src/Experiments'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('renders two editors', async ({ page }) => {
        await expect(page.locator('.tiptap')).toHaveCount(2)
      })
    })
  })
})
