import { expect, test } from '@playwright/test'

const demoPath = '/src/GuideNodeViews/VueComponentContent/Vue/'

test.describe('GuideNodeViews/VueComponentContent/Vue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(demoPath)
  })

  test('renders the initial NodeView content', async ({ page }) => {
    await expect(page.locator('.tiptap .vue-component .content')).toHaveText('This is editable.')
  })
})
