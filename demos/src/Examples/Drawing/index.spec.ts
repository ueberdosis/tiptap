import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'Drawing'
const frameworkPaths = ['Vue']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('should have a working tiptap instance', async ({ page }) => {
        const editor = await getEditor(page)
        const hasEditor = await editor.evaluate((el: any) => !!el.editor)

        expect(hasEditor).toBe(true)
      })

      test('should have a svg canvas', async ({ page }) => {
        await expect(page.locator('.tiptap svg')).toBeVisible()
      })

      test('should draw on the svg canvas', async ({ page }) => {
        await getEditor(page)
        await expect(page.locator('.tiptap svg')).toBeVisible()

        const color = await page.locator('input').nth(0).inputValue()
        const size = await page.locator('input').nth(1).inputValue()

        const svg = page.locator('.tiptap svg')
        const box = await svg.boundingBox()

        if (!box) {throw new Error('SVG bounding box not found')}

        await page.mouse.move(box.x + 50, box.y + 50)
        await page.mouse.down()
        await page.mouse.move(box.x + 150, box.y + 150)
        await page.mouse.up()

        const path = page.locator('.tiptap svg path').first()
        await expect(path).toHaveAttribute('stroke-width', size)
        await expect(path).toHaveAttribute('stroke', color.toUpperCase())
      })
    })
  })
})
