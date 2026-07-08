import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoPath = '/src/Nodes'
const demoName = 'MentionExperimental'

test.describe(`${demoPath}/${demoName}`, () => {
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

  test('shows initial items in the dropdown menu', async ({ page }) => {
    const editor = await getEditor(page)
    await editor.evaluate((el: any) => el.editor.commands.clearContent())
    await editor.click()
    await page.keyboard.type('@')
    // With minQueryLength=2 and empty query, initialItems are shown immediately
    await expect(page.locator('.dropdown-menu button')).toHaveCount(3)
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

  test('shows filtered results after reaching minQueryLength', async ({ page }) => {
    const editor = await getEditor(page)
    await editor.evaluate((el: any) => el.editor.commands.clearContent())
    await editor.click()
    await page.keyboard.type('@mado')
    // Wait for the async fetch (debounce 300ms + fetch 300ms) to resolve
    await expect(page.locator('.dropdown-menu button')).toHaveCount(1, { timeout: 2000 })
    await expect(page.locator('.dropdown-menu button').first()).toContainText('Madonna')
  })
})
