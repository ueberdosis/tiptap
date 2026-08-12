import { expect, test } from '@playwright/test'

import { focusEditorEnd, getEditor } from '../../../test/helpers.js'

const demoName = 'DecorationComponents'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(frameworkPath, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('renders one counter per paragraph, indexed and starting at zero', async ({ page }) => {
        const editor = await getEditor(page)
        const counters = page.locator('.decoration-counter')

        await expect(counters).toHaveCount(2)
        await expect(counters).toHaveText(['¶ 1 · 👍 0', '¶ 2 · 👍 0'])

        // The heading must stay undecorated, only paragraphs get a counter.
        await expect(editor.locator('p .decoration-counter')).toHaveCount(2)
        await expect(editor.locator('h2 .decoration-counter')).toHaveCount(0)
      })

      test('increments only the clicked counter', async ({ page }) => {
        const counters = page.locator('.decoration-counter')

        await expect(counters).toHaveCount(2)

        await counters.nth(0).click()
        await counters.nth(0).click()
        await counters.nth(0).click()
        await counters.nth(1).click()

        await expect(counters).toHaveText(['¶ 1 · 👍 3', '¶ 2 · 👍 1'])
      })

      test('adds a counter with the next index for a new paragraph', async ({ page }) => {
        const counters = page.locator('.decoration-counter')

        await expect(counters).toHaveCount(2)

        await focusEditorEnd(page)
        await page.keyboard.press('Enter')
        await page.keyboard.type('A third paragraph.')

        await expect(counters).toHaveCount(3)
        await expect(counters).toHaveText(['¶ 1 · 👍 0', '¶ 2 · 👍 0', '¶ 3 · 👍 0'])
      })

      test('keeps a widget mounted when its paragraph is edited and split', async ({ page }) => {
        const editor = await getEditor(page)
        const counters = page.locator('.decoration-counter')
        const duplicateKeyWarnings: string[] = []

        page.on('console', message => {
          if (
            message.type() === 'warning' &&
            message.text().includes('Duplicate widget decoration key')
          ) {
            duplicateKeyWarnings.push(message.text())
          }
        })

        await expect(counters).toHaveCount(2)

        await counters.nth(0).click()
        await expect(counters.nth(0)).toContainText('👍 1')

        const firstParagraph = editor.locator('p').nth(0)
        await firstParagraph.click()
        await page.keyboard.press('End')
        await page.keyboard.type(' edited')
        await page.keyboard.press('Enter')

        await expect(counters).toHaveCount(3)
        await expect(counters.nth(0)).toContainText('¶ 1')
        await expect(counters.nth(1)).toContainText('¶ 2')
        await expect(counters.nth(2)).toContainText('¶ 3')
        await expect(counters.filter({ hasText: '👍 1' })).toHaveCount(1)
        expect(duplicateKeyWarnings).toEqual([])
      })

      test('keeps widget state independent between paragraphs', async ({ page }) => {
        const counters = page.locator('.decoration-counter')

        await expect(counters).toHaveCount(2)
        await counters.nth(0).click()
        await counters.nth(1).click()

        await expect(counters.nth(0)).toContainText('👍 1')
        await expect(counters.nth(1)).toContainText('👍 1')
      })

      test('removes widgets when their paragraphs are removed', async ({ page }) => {
        const editor = await getEditor(page)
        const counters = page.locator('.decoration-counter')

        await expect(counters).toHaveCount(2)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent(
            '<h2>Decoration components</h2><p>Only one paragraph remains.</p>',
          )
        })

        await expect(counters).toHaveCount(1)
        await expect(counters.first()).toContainText('¶ 1')
      })

      test('recreates widgets cleanly after navigation', async ({ page }) => {
        const counters = page.locator('.decoration-counter')

        await counters.first().click()
        await expect(counters.first()).toContainText('👍 1')

        await page.goto(`/src/Examples/Decorations/${frameworkPath}/`)
        await page.goto(fullDemoPath)

        await expect(page.locator('.decoration-counter')).toHaveCount(2)
        await expect(page.locator('.decoration-counter').first()).toContainText('👍 0')
      })
    })
  })
})
