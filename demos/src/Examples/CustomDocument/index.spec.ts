import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'CustomDocument'
const frameworkPaths = ['React', 'Vue']
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

      test('should have a headline and a paragraph', async ({ page }) => {
        await expect(page.locator('.tiptap h1')).toHaveText('It’ll always have a heading …')
        await expect(page.locator('.tiptap p').first()).toHaveText(
          '… if you pass a custom document. That’s the beauty of having full control over the schema.',
        )
      })

      test('should have a tooltip for a paragraph on a new line', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.evaluate((el: any) => el.editor.commands.focus('end'))
        await page.keyboard.press('Enter')

        await expect(page.locator('.tiptap p[data-placeholder]').first()).toHaveAttribute(
          'data-placeholder',
          'Can you add some further context?',
        )
      })

      test('should have a headline after clearing the document', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.chain().focus().clearContent().run()
        })

        await expect(page.locator('.tiptap h1[data-placeholder]')).toHaveAttribute(
          'data-placeholder',
          'What’s the title?',
        )
        await expect(page.locator('.tiptap h1[data-placeholder]')).toHaveAttribute(
          'class',
          'is-empty is-editor-empty',
        )
      })

      test('should have a headline after clearing & enter paragraph automatically after adding a headline', async ({
        page,
      }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.chain().focus().clearContent().insertContent('Hello world').run()
        })
        await editor.click()
        await page.keyboard.press('End')
        await page.keyboard.press('Enter')

        await expect(page.locator('.tiptap h1')).toHaveText('Hello world')
        await expect(page.locator('.tiptap p[data-placeholder]').first()).toHaveAttribute(
          'data-placeholder',
          'Can you add some further context?',
        )

        await editor.type('This is a paragraph for this test document')
        await expect(page.locator('.tiptap p').first()).toHaveText(
          'This is a paragraph for this test document',
        )
      })
    })
  })
})
