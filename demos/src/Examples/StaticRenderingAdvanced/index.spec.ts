import { expect, test } from '@playwright/test'

const demoName = 'StaticRenderingAdvanced'
const frameworkPaths = ['React']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('should render the content as HTML', async ({ page }) => {
        await expect(page.locator('p').first()).toBeVisible()
      })
    })
  })
})
