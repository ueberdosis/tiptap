import { expect, test } from '@playwright/test'

const demoPath = '/src/GuideNodeViews/ReactComponentContent/React/'

test.describe('GuideNodeViews/ReactComponentContent/React', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(demoPath)
  })

  test('renders the initial NodeView content', async ({ page }) => {
    await expect(page.locator('.tiptap .react-component .content')).toHaveText(
      'This is editable. Press Enter to split the content, Shift+Enter for a line break, or Mod+Enter for a new component.',
    )
  })
})
