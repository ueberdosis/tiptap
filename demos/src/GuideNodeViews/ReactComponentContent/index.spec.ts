import { expect, test } from '@playwright/test'

const demoPath = '/src/GuideNodeViews/ReactComponentContent/React/'

test.describe('GuideNodeViews/ReactComponentContent/React', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(demoPath)
  })

  test('renders the initial NodeView content', async ({ page }) => {
    await expect(page.locator('.tiptap .react-component .content')).toHaveText(
      'This is editable. You can create a new component by pressing Mod+Enter.',
    )
  })
})
