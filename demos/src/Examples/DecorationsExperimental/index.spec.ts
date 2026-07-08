import { expect, test } from '@playwright/test'

const demoName = 'DecorationsExperimental'
const frameworkPaths = ['React']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('highlights matches with inline decorations', async ({ page }) => {
        await page.locator('input[type="text"]').fill('decoration')

        const hits = page.locator('.tiptap .search-hit')

        await expect(hits.first()).toBeVisible()
        expect(await hits.count()).toBeGreaterThan(1)
        // The document text itself is untouched
        await expect(page.locator('.tiptap')).toContainText('highlight matches with')
      })

      test('renders a React widget badge per match', async ({ page }) => {
        await page.locator('input[type="text"]').fill('decoration')

        const badges = page.locator('.tiptap .match-badge')
        const hits = page.locator('.tiptap .search-hit')

        expect(await badges.count()).toBe(await hits.count())
        await expect(badges.first()).toHaveText('1')
      })

      test('clears decorations when the term is emptied', async ({ page }) => {
        const input = page.locator('input[type="text"]')

        await input.fill('decoration')
        await expect(page.locator('.tiptap .search-hit').first()).toBeVisible()
        await input.fill('')
        expect(await page.locator('.tiptap .search-hit').count()).toBe(0)
        expect(await page.locator('.tiptap .match-badge').count()).toBe(0)
      })

      test('marks the block containing the cursor with a node decoration', async ({ page }) => {
        await page.locator('.tiptap h2').click()
        await expect(page.locator('.tiptap h2.active-block')).toHaveCount(1)

        await page.locator('.tiptap p').first().click()
        await expect(page.locator('.tiptap h2.active-block')).toHaveCount(0)
        await expect(page.locator('.tiptap p.active-block')).toHaveCount(1)
      })

      test('keeps highlights in sync while typing', async ({ page }) => {
        await page.locator('input[type="text"]').fill('zebra')
        expect(await page.locator('.tiptap .search-hit').count()).toBe(0)

        await page.locator('.tiptap p').first().click()
        await page.keyboard.type(' zebra')
        await expect(page.locator('.tiptap .search-hit')).toHaveCount(1)
      })
    })
  })
})
