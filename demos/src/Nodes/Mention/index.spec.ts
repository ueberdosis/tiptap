import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoPath = '/src/Nodes'
const demoName = 'Mention'

test.describe(`${demoPath}/${demoName}`, () => {
  test.describe('React', () => {
    const fullDemoPath = `${demoPath}/${demoName}/React/`

    test.beforeEach(async ({ page }) => {
      await page.goto(fullDemoPath)
    })

    test('inserts a mention', async ({ page }) => {
      const editor = await getEditor(page)
      await editor.evaluate((el: any) =>
        el.editor.commands.setContent(
          '<p><span data-type="mention" data-id="1" data-label="John Doe">@John Doe</span></p>',
        ),
      )
      await expect(page.locator('.tiptap span.mention')).toHaveAttribute('data-id', '1')
      await expect(page.locator('.tiptap span.mention')).toContainText('@John Doe')
    })

    test('opens a dropdown menu when @ is typed', async ({ page }) => {
      const editor = await getEditor(page)
      await editor.evaluate((el: any) => el.editor.commands.clearContent())
      await editor.click()
      await page.keyboard.type('@')
      await expect(page.locator('.dropdown-menu')).toBeVisible()
    })

    test('shows correct options in the dropdown menu', async ({ page }) => {
      const editor = await getEditor(page)
      await editor.evaluate((el: any) => el.editor.commands.clearContent())
      await editor.click()
      await page.keyboard.type('@')
      await expect(page.locator('.dropdown-menu button')).toHaveCount(5)
      await expect(page.locator('.dropdown-menu button').nth(0)).toContainText('Lea Thompson')
      await expect(page.locator('.dropdown-menu button').nth(0)).toHaveClass(/is-selected/)
    })

    test('inserts Cyndi Lauper mention when clicked', async ({ page }) => {
      const editor = await getEditor(page)
      await editor.evaluate((el: any) => el.editor.commands.clearContent())
      await editor.click()
      await page.keyboard.type('@')
      await page.locator('.dropdown-menu button').nth(1).click()
      await expect(page.locator('.tiptap span.mention')).toHaveAttribute('data-id', 'Cyndi Lauper')
    })

    test('closes the dropdown menu on Escape', async ({ page }) => {
      const editor = await getEditor(page)
      await editor.evaluate((el: any) => el.editor.commands.clearContent())
      await editor.click()
      await page.keyboard.type('@')
      await expect(page.locator('.dropdown-menu')).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(page.locator('.dropdown-menu')).toHaveCount(0)
    })

    test('inserts Tom Cruise via arrow keys and Enter', async ({ page }) => {
      const editor = await getEditor(page)
      await editor.evaluate((el: any) => el.editor.commands.clearContent())
      await editor.click()
      await page.keyboard.type('@')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      await expect(page.locator('.tiptap span.mention')).toHaveAttribute('data-id', 'Tom Cruise')
    })

    test('shows "No result" for unknown query', async ({ page }) => {
      const editor = await getEditor(page)
      await editor.evaluate((el: any) => el.editor.commands.clearContent())
      await editor.click()
      await page.keyboard.type('@nonexistent')
      await expect(page.locator('.dropdown-menu')).toContainText('No result')
    })

    test('filters to a single match for "@mado"', async ({ page }) => {
      const editor = await getEditor(page)
      await editor.evaluate((el: any) => el.editor.commands.clearContent())
      await editor.click()
      await page.keyboard.type('@mado')
      await expect(page.locator('.dropdown-menu button')).toHaveCount(1)
      await expect(page.locator('.dropdown-menu button').first()).toContainText('Madonna')
    })

    test('inserts Madonna for "@mado" and Enter', async ({ page }) => {
      const editor = await getEditor(page)
      await editor.evaluate((el: any) => el.editor.commands.clearContent())
      await editor.click()
      await page.keyboard.type('@mado')
      await page.keyboard.press('Enter')
      await expect(page.locator('.tiptap span.mention')).toHaveAttribute('data-id', 'Madonna')
    })
  })

  test.describe('Vue', () => {
    test('loads the editor', async ({ page }) => {
      await page.goto(`${demoPath}/${demoName}/Vue/`)
      const editor = await getEditor(page)
      await expect(editor).toBeVisible()
    })
  })
})
