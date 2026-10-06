import { expect, test } from '@playwright/test'

const demoName = 'Focus'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Extensions'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('first paragraph has has-focus class', async ({ page }) => {
        await expect(page.locator('.tiptap p').first()).toHaveClass(/has-focus/)
      })
    })
  })
})
