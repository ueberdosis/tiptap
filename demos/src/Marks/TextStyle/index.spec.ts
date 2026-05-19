import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'TextStyle'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Marks'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await getEditor(page)
      })

      test('merges styles of a span with one child span', async ({ page }) => {
        const spans = page.locator('.tiptap > p:nth-child(4) > span')
        await expect(spans).toHaveCount(1)
        await expect(spans).toHaveText('red serif')
        await expect(spans).toHaveAttribute('style', 'color: #FF0000; font-family: serif')
      })

      test('merges styles of a span with one nested child span into the descendant span', async ({ page }) => {
        const spans = page.locator('.tiptap > p:nth-child(5) > span')
        await expect(spans).toHaveCount(1)
        await expect(spans).toHaveText('blue serif')
        await expect(spans).toHaveAttribute('style', 'color: #0000FF; font-family: serif')
      })

      test('merges styles of a span with multiple child spans into all child spans', async ({ page }) => {
        const spans = page.locator('.tiptap > p:nth-child(6) > span')
        await expect(spans).toHaveCount(2)
        await expect(spans.nth(0)).toHaveText('green serif ')
        await expect(spans.nth(0)).toHaveAttribute('style', 'color: #00FF00; font-family: serif')
        await expect(spans.nth(1)).toHaveText('red serif')
        await expect(spans.nth(1)).toHaveAttribute('style', 'color: #FF0000; font-family: serif')
      })

      test('merges styles of descendant spans into each descendant span when the parent span has no style', async ({
        page,
      }) => {
        const spans = page.locator('.tiptap > p:nth-child(7) > span')
        await expect(spans).toHaveCount(4)
        await expect(spans.nth(0)).toHaveText('blue')
        await expect(spans.nth(0)).toHaveAttribute('style', 'color: #0000FF')
        await expect(spans.nth(1)).toHaveText('green ')
        await expect(spans.nth(1)).toHaveAttribute('style', 'color: #00FF00')
        await expect(spans.nth(2)).toHaveText('green serif')
        await expect(spans.nth(2)).toHaveAttribute('style', 'color: #00FF00; font-family: serif')
      })

      test('merges styles of a span with nested root text and descendant spans into each descendant span', async ({
        page,
      }) => {
        const spans = page.locator('.tiptap > p:nth-child(8) > span')
        await expect(spans).toHaveCount(4)
        await expect(spans.nth(0)).toHaveText('blue ')
        await expect(spans.nth(0)).toHaveAttribute('style', 'color: #0000FF')
        await expect(spans.nth(1)).toHaveText('green ')
        await expect(spans.nth(1)).toHaveAttribute('style', 'color: #00FF00')
        await expect(spans.nth(2)).toHaveText('green serif ')
        await expect(spans.nth(2)).toHaveAttribute('style', 'color: #00FF00; font-family: serif')
        await expect(spans.nth(3)).toHaveText('blue serif')
        await expect(spans.nth(3)).toHaveAttribute('style', 'color: #0000FF; font-family: serif')
      })
    })
  })
})
