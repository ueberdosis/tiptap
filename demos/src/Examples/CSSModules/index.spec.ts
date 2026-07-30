import { expect, test } from '@playwright/test'

const demoName = 'CSSModules'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('should apply the toolbar styles from the CSS module', async ({ page }) => {
        const toolbar = page.locator('.toolbar')

        await expect(toolbar).toBeVisible()
        await expect(toolbar).toHaveCSS('background-color', 'rgb(255, 0, 0)')
        await expect(toolbar).toHaveCSS('padding', '16px')
      })
    })
  })
})
