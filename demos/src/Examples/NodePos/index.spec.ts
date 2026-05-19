import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'NodePos'
const frameworkPaths = ['React']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await getEditor(page)
      })
      ;[
        { testId: 'find-paragraphs', count: 16 },
        { testId: 'find-listitems', count: 12 },
        { testId: 'find-bulletlists', count: 3 },
        { testId: 'find-orderedlists', count: 1 },
        { testId: 'find-blockquotes', count: 3 },
        { testId: 'find-images', count: 4 },
      ].forEach(({ testId, count }) => {
        test(`should get nodes via ${testId}`, async ({ page }) => {
          await page.locator(`button[data-testid="${testId}"]`).click()
          await expect(page.locator('div[data-testid="found-nodes"]')).toBeVisible()
          await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(count)
        })
      })

      test('should get first blockquote', async ({ page }) => {
        await page.locator('button[data-testid="find-first-blockquote"]').click()

        await expect(page.locator('div[data-testid="found-nodes"]')).toBeVisible()

        const nodes = page.locator('div[data-testid="found-node"]')
        await expect(nodes).toHaveCount(1)
        await expect(nodes).toContainText('Here we have a paragraph inside a blockquote.')
        await expect(nodes).not.toContainText('Here we have another paragraph inside a blockquote.')
      })

      test.describe('when querying by attribute', () => {
        ;[
          { testId: 'find-squared-image', expected: 'https://placehold.co/200x200' },
          { testId: 'find-landscape-image', expected: 'https://placehold.co/260x200' },
          { testId: 'find-first-landscape-image-with-all-query', expected: 'https://placehold.co/260x200' },
          { testId: 'find-portrait-image-inside-blockquote', expected: 'https://placehold.co/100x200' },
        ].forEach(({ testId, expected }) => {
          test(`should get node via ${testId}`, async ({ page }) => {
            await page.locator(`button[data-testid="${testId}"]`).click()
            await expect(page.locator('div[data-testid="found-nodes"]')).toBeVisible()

            const nodes = page.locator('div[data-testid="found-node"]')
            await expect(nodes).toHaveCount(1)
            await expect(nodes).toContainText(expected)
          })
        })

        test('should get all landscape images', async ({ page }) => {
          await page.locator('button[data-testid="find-all-landscape-images"]').click()
          await expect(page.locator('div[data-testid="found-nodes"]')).toBeVisible()

          const nodes = page.locator('div[data-testid="found-node"]')
          await expect(nodes).toHaveCount(2)
          await expect(nodes.nth(0)).toContainText('https://placehold.co/260x200')
          await expect(nodes.nth(1)).toContainText('https://placehold.co/260x200')
        })
      })

      test('should find complex nodes', async ({ page }) => {
        await page.locator('button[data-testid="find-first-node"]').click()
        await expect(page.locator('div[data-testid="found-nodes"]')).toBeVisible()
        let nodes = page.locator('div[data-testid="found-node"]')
        await expect(nodes).toHaveCount(1)
        await expect(nodes).toContainText('heading')
        await expect(nodes).toContainText('{"level":1}')

        await page.locator('button[data-testid="find-last-node"]').click()
        nodes = page.locator('div[data-testid="found-node"]')
        await expect(nodes).toHaveCount(1)
        await expect(nodes).toContainText('image')

        await page.locator('button[data-testid="find-last-node-of-first-bullet-list"]').click()
        nodes = page.locator('div[data-testid="found-node"]')
        await expect(nodes).toHaveCount(1)
        await expect(nodes).toContainText('listItem')
        await expect(nodes).toContainText('Unsorted 3')
      })

      test('should not find nodes that do not exist in document', async ({ page }) => {
        await page.locator('button[data-testid="find-nonexistent-node"]').click()
        await expect(page.locator('div[data-testid="found-nodes"]')).toHaveCount(0)
        await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(0)
      })
    })
  })
})
