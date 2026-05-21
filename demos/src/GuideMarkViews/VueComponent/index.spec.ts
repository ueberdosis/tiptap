import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'VueComponent'
const frameworkPaths = ['Vue']
const demoPath = '/src/GuideMarkViews'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await setEditorContent(page, '<p>Example Text</p><vue-component>Mark View Text</vue-component>')
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
      })

      test('shows the markview', async ({ page }) => {
        await expect(page.locator('.tiptap [data-test-id="mark-view"]')).toHaveCount(1)
      })

      test('allows clicking the button', async ({ page }) => {
        const button = page.locator('.tiptap [data-test-id="count-button"]')
        await expect(button).toContainText('This button has been clicked 0 times.')
        await button.click()
        await expect(button).toContainText('This button has been clicked 1 times.')
      })

      test('renders update-attributes button', async ({ page }) => {
        await expect(page.locator('.tiptap [data-test-id="mark-view"]')).toHaveAttribute('data-count', '0')
        await expect(page.locator('.tiptap [data-test-id="update-attributes-button"]')).toBeVisible()
      })
    })
  })
})
