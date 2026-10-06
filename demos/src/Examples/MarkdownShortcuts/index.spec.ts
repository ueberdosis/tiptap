import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'MarkdownShortcuts'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.clearContent()
        })
      })
      ;[1, 2, 3, 4, 5, 6].forEach(level => {
        test(`should make a h${level}`, async ({ page }) => {
          const editor = await getEditor(page)

          await editor.click()
          await editor.type(`${'#'.repeat(level)} Headline`)

          await expect(page.locator(`.tiptap h${level}`)).toContainText('Headline')
        })
      })

      test('should create inline code', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.type('`$foobar`')

        await expect(page.locator('.tiptap code')).toContainText('$foobar')
      })

      test('should create a code block without language', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.type('``` ')
        await editor.press('Enter')
        await editor.type('const foo = bar')
        await editor.press('Enter')
        await editor.type('```')

        await expect(page.locator('.tiptap pre')).toContainText('const foo = bar')
      })
      ;['*', '-', '+'].forEach(symbol => {
        test(`should create a bullet list from ${symbol}`, async ({ page }) => {
          const editor = await getEditor(page)

          await editor.click()
          await editor.type(`${symbol} foobar`)

          await expect(page.locator('.tiptap ul')).toContainText('foobar')
        })
      })

      test('should create a ordered list', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.type('1. foobar')

        await expect(page.locator('.tiptap ol')).toContainText('foobar')
      })

      test('should create a blockquote', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.type('> foobar')

        await expect(page.locator('.tiptap blockquote')).toContainText('foobar')
      })
    })
  })
})
