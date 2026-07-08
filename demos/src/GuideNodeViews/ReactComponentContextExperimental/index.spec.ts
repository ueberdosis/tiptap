import { expect, test } from '@playwright/test'

const demoName = 'ReactComponentContextExperimental'
const frameworkPaths = ['React']
const demoPath = '/src/GuideNodeViews'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('renders the context value inside the node view', async ({ page }) => {
        await expect(page.locator('.tiptap .react-component label')).toContainText(
          'Hi from react context!',
        )
      })

      test('renders the node view without wrapper DOM', async ({ page }) => {
        const component = page.locator('.tiptap .react-component')

        await expect(component).toHaveCount(1)
        expect(await page.locator('.tiptap [data-node-view-wrapper]').count()).toBe(0)
        expect(await page.locator('.tiptap .react-renderer').count()).toBe(0)
      })

      test('updates attributes through the component button', async ({ page }) => {
        const button = page.locator('.tiptap .react-component button')

        await expect(button).toContainText('clicked 0 times')
        await button.click()
        await expect(button).toContainText('clicked 1 times')
      })
    })
  })
})
