import { expect, test } from '@playwright/test'

const demoName = 'GenerateText'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/GuideContent'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('renders the generated text', async ({ page }) => {
        await expect(page.locator('pre code')).toContainText('This is a paragraph.')
      })
    })
  })
})
