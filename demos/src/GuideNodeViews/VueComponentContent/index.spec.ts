import { expect, test } from '@playwright/test'

const demoPath = '/src/GuideNodeViews/VueComponentContent/Vue/'

test.describe('GuideNodeViews/VueComponentContent/Vue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(demoPath)
  })

  test('renders the initial NodeView content', async ({ page }) => {
    await expect(page.locator('.tiptap .vue-component .content')).toHaveText('This is editable.')
  })

  test('keeps edited content across unmount and remount', async ({ page }) => {
    const editor = page.locator('.tiptap')
    await editor.click()
    await page.keyboard.press('ControlOrMeta+End')
    await page.keyboard.type(' Kept after remount')
    await page.getByRole('button', { name: 'Unmount editor', exact: true }).click()
    await expect(editor).toHaveCount(0)
    await page.getByRole('button', { name: 'Mount editor', exact: true }).click()
    await expect(editor).toContainText('Kept after remount')
  })
})
