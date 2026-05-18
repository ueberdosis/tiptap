import { expect, test } from '@playwright/test'

import { clickButton, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Cut'
const frameworkPaths = ['React']
const demoPath = '/src/Commands'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.beforeEach(async ({ page }) => {
      await page.goto(fullDemoPath)
    })

    test.describe(`${frameworkPath}`, () => {
      test('cuts content to start of document', async ({ page }) => {
        const editor = page.locator('.tiptap')

        await setEditorContent(page, '<p>Hello world</p>')

        // Wait for content to be set
        await expect(editor).toContainText('Hello world')

        // Click in the paragraph to focus
        await page.locator('.tiptap p').click()

        // Move cursor to end of "world" using keyboard
        await page.keyboard.press('End')

        // Select "world" by moving left with Shift
        await page.keyboard.press('Shift+ArrowLeft')
        await page.keyboard.press('Shift+ArrowLeft')
        await page.keyboard.press('Shift+ArrowLeft')
        await page.keyboard.press('Shift+ArrowLeft')
        await page.keyboard.press('Shift+ArrowLeft')

        // Click "Cut content to start of document"
        await clickButton(page, 'Cut content to start of document')

        // Verify content is cut - should be empty
        await expect(editor.locator('p').first()).toHaveText('worldHello ')
      })

      test('cuts content to end of document', async ({ page }) => {
        const editor = page.locator('.tiptap')

        await setEditorContent(page, '<p>Hello world</p>')

        // Wait for content to be set
        await expect(editor).toContainText('Hello world')

        // Click in the paragraph to focus
        await page.locator('.tiptap p').click()

        // Move cursor to start using keyboard
        await page.keyboard.press('Home')

        // Select "Hello" by moving right with Shift
        await page.keyboard.press('Shift+ArrowRight')
        await page.keyboard.press('Shift+ArrowRight')
        await page.keyboard.press('Shift+ArrowRight')
        await page.keyboard.press('Shift+ArrowRight')
        await page.keyboard.press('Shift+ArrowRight')

        // Click "Cut content to end of document"
        await clickButton(page, 'Cut content to end of document')

        // Verify content is cut - first paragraph has " world", second has "Hello"
        await expect(editor.locator('p').nth(0)).toHaveText(' world')
        await expect(editor.locator('p').nth(1)).toHaveText('Hello')
      })
    })
  })
})
