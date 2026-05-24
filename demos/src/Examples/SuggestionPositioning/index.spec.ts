import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoPath = '/src/Examples/SuggestionPositioning'

test.describe(demoPath, () => {
  test.describe('React', () => {
    const fullDemoPath = `${demoPath}/React/`

    test.beforeEach(async ({ page }) => {
      await page.goto(fullDemoPath)
    })

    test('opens a dropdown menu when @ is typed', async ({ page }) => {
      const editor = await getEditor(page)
      await editor.evaluate((el: any) => el.editor.commands.clearContent())
      await editor.click()
      await page.keyboard.type('@')
      await expect(page.locator('.dropdown-menu')).toBeVisible()
    })

    test('shows matching items in the dropdown', async ({ page }) => {
      const editor = await getEditor(page)
      await editor.evaluate((el: any) => el.editor.commands.clearContent())
      await editor.click()
      await page.keyboard.type('@a')
      await expect(page.locator('.dropdown-menu button')).toHaveCount(5)
      await expect(page.locator('.dropdown-menu button').first()).toContainText('Alice')
    })

    test('selects an item via click and inserts a mention', async ({ page }) => {
      const editor = await getEditor(page)
      await editor.evaluate((el: any) => el.editor.commands.clearContent())
      await editor.click()
      await page.keyboard.type('@')
      await page.locator('.dropdown-menu button').first().click()
      await expect(page.locator('.tiptap span.mention')).toBeVisible()
    })

    test('inserts Bob via arrow keys and Enter', async ({ page }) => {
      const editor = await getEditor(page)
      await editor.evaluate((el: any) => el.editor.commands.clearContent())
      await editor.click()
      await page.keyboard.type('@')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      await expect(page.locator('.tiptap span.mention')).toHaveAttribute('data-id', 'bob')
    })
  })

  test.describe('Vue', () => {
    test('loads the editor', async ({ page }) => {
      await page.goto(`${demoPath}/Vue/`)
      const editor = await getEditor(page)
      await expect(editor).toBeVisible()
    })
  })
})
