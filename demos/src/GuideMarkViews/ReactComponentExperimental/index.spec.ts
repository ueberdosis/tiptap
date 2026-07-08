import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'ReactComponentExperimental'
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
          '<p>Example Text</p><p><react-component>Mark View Text</react-component></p>',
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

      test('renders the mark view without wrapper DOM', async ({ page }) => {
        // The component's own element is the mark's element: no
        // ReactRenderer host and no auto-injected content element
        const markView = page.locator('.tiptap [data-test-id="mark-view"]')

        await expect(markView).toHaveCount(1)
        expect(await page.locator('.tiptap .react-renderer').count()).toBe(0)
        expect(await page.locator('.tiptap [data-mark-view-content]').count()).toBe(0)
      })

      test('allows clicking the button', async ({ page }) => {
        const button = page.locator('.tiptap [data-test-id="count-button"]')
        await expect(button).toContainText('This button has been clicked 0 times.')
        await button.click()
        await expect(button).toContainText('This button has been clicked 1 times.')
      })

      test('updates mark attributes from the component', async ({ page }) => {
        const markView = page.locator('.tiptap [data-test-id="mark-view"]')

        await expect(markView).toHaveAttribute('data-count', '0')
        await page.locator('.tiptap [data-test-id="count-button"]').click()
        await page.locator('.tiptap [data-test-id="update-attributes-button"]').click()
        await expect(markView).toHaveAttribute('data-count', '1')
      })

      test('keeps typing inside the mark view working', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => el.editor.commands.setTextSelection(20))
        await page.locator('.tiptap [data-test-id="mark-view-content-wrapper"]').click()
        await page.keyboard.type('X')
        await expect(
          page.locator('.tiptap [data-test-id="mark-view-content-wrapper"]'),
        ).toContainText('X')
      })
    })
  })
})
