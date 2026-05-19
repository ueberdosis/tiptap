import { expect, test } from '@playwright/test'

const demoName = 'StaticRenderReact'
const frameworkPaths = ['React']
const demoPath = '/src/GuideContent'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('renders the content as HTML', async ({ page }) => {
        await expect(page.locator('p').first()).toContainText('Example')
        await expect(page.locator('p strong').first()).toContainText('Text')
      })
    })
  })
})
