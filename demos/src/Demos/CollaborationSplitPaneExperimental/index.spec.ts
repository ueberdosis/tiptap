import { expect, test } from '@playwright/test'

const demoName = 'CollaborationSplitPaneExperimental'
const frameworkPaths = ['React']
const demoPath = '/src/Demos'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await expect(page.locator('.tiptap')).toHaveCount(2)
      })

      test('seeds both panes from the shared document', async ({ page }) => {
        await expect(page.locator('.tiptap').nth(0)).toContainText('collaborative document')
        await expect(page.locator('.tiptap').nth(1)).toContainText('collaborative document')
      })

      test('syncs typing from pane A to pane B', async ({ page }) => {
        const paneA = page.locator('.tiptap').nth(0)
        const paneB = page.locator('.tiptap').nth(1)

        await paneA.locator('p').first().click()
        await page.keyboard.type('Hello from A! ')

        await expect(paneB).toContainText('Hello from A!')
      })

      test('syncs typing from pane B back to pane A', async ({ page }) => {
        const paneA = page.locator('.tiptap').nth(0)
        const paneB = page.locator('.tiptap').nth(1)

        await paneB.locator('p').first().click()
        await page.keyboard.type('Hello from B! ')

        await expect(paneA).toContainText('Hello from B!')
      })

      test('syncs formatting applied through the menu', async ({ page }) => {
        const paneA = page.locator('.tiptap').nth(0)
        const paneB = page.locator('.tiptap').nth(1)

        await paneA.locator('p').first().click()
        await page.keyboard.press('ControlOrMeta+a')
        await page.locator('.column-half').nth(0).getByRole('button', { name: 'Bold' }).click()

        await expect(paneB.locator('strong').first()).toBeVisible()
      })
    })
  })
})
