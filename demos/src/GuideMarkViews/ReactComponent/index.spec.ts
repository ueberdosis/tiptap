import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'ReactComponent'
const frameworkPaths = ['React']
const demoPath = '/src/GuideMarkViews'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await setEditorContent(
          page,
          '<p>Example Text</p><react-component>Mark View Text</react-component>',
        )
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
      })

      test('shows the markview', async ({ page }) => {
        await expect(page.locator('.tiptap [data-test-id="mark-view"]')).toHaveCount(1)
      })

      test('shows the markview content in the markview', async ({ page }) => {
        await expect(
          page.locator('.tiptap [data-test-id="mark-view-content-wrapper"]'),
        ).toContainText('Mark View Text')
      })

      test('allows clicking the button', async ({ page }) => {
        const button = page.locator('.tiptap [data-test-id="count-button"]')
        await expect(button).toContainText('This button has been clicked 0 times.')
        await button.click()
        await expect(button).toContainText('This button has been clicked 1 times.')
      })

      test('renders update-attributes button', async ({ page }) => {
        await expect(page.locator('.tiptap [data-test-id="mark-view"]')).toHaveAttribute(
          'data-count',
          '0',
        )
        await expect(
          page.locator('.tiptap [data-test-id="update-attributes-button"]'),
        ).toBeVisible()
      })
    })
  })
})
