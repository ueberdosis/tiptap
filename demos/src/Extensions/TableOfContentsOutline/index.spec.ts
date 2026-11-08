import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'TableOfContentsOutline'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Extensions'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('starts the outline at depth 1 for a document that starts at H2', async ({ page }) => {
        const rows = page.locator('.outline li')

        await expect(rows).toHaveCount(7)
        await expect(rows.first()).toHaveAttribute('style', /--depth: 1/)
        await expect(rows.nth(1)).toHaveAttribute('style', /--depth: 2/)
      })

      test('follows a new heading', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) =>
          el.editor.commands.insertContentAt(0, '<h2>New first section</h2>'),
        )

        await expect(page.locator('.outline li').first()).toHaveText(/New first section/)
      })

      test('hides a level', async ({ page }) => {
        await page.getByRole('button', { name: 'H4' }).click()

        await expect(page.locator('.outline li[data-level="4"]')).toHaveCount(0)
        await expect(page.locator('.outline li')).toHaveCount(5)
      })

      test('limits the depth', async ({ page }) => {
        await page.getByRole('button', { name: '1', exact: true }).click()

        await expect(page.locator('.outline li')).toHaveCount(3)
      })

      test('puts the cursor in a heading when a row is clicked', async ({ page }) => {
        await page.locator('.outline button', { hasText: 'Publishing' }).click()

        const editor = await getEditor(page)
        const parentText = await editor.evaluate(
          (el: any) => el.editor.state.selection.$from.parent.textContent,
        )

        expect(parentText).toBe('Publishing')
      })
    })
  })
})
