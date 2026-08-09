import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Emoji'
const frameworkPaths = ['React']
const demoPath = '/src/Nodes'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await setEditorContent(page, '<p></p>')
        const editor = await getEditor(page)
        await editor.click()
      })

      test('inserts :smile: via typing', async ({ page }) => {
        await page.keyboard.type(':smile:')
        await expect(page.locator('.tiptap [data-type="emoji"][data-name="smile"]')).toHaveCount(1)
      })

      test('insert button inserts an emoji node', async ({ page }) => {
        await page.getByRole('button', { name: 'Insert ⚡' }).click()
        await expect(page.locator('.tiptap [data-type="emoji"][data-name="zap"]')).toHaveCount(1)
      })

      test('arrow left navigates past emoji at start of paragraph', async ({ page }) => {
        // Set content with an emoji at the start followed by text
        await setEditorContent(
          page,
          '<p><span data-type="emoji" data-name="smile">😄</span>hello</p>',
        )
        const editor = await getEditor(page)

        // Place cursor right after the emoji (before "hello")
        await editor.click()
        await page.keyboard.press('Home')
        await page.keyboard.press('ArrowRight')

        // Now press ArrowLeft — cursor should move before the emoji (position 0)
        await page.keyboard.press('ArrowLeft')

        // Type a character to verify cursor is at position 0 (before emoji)
        await page.keyboard.type('X')

        // The "X" should appear before the emoji
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toMatch(/X.*data-type="emoji"/)
      })

      test('arrow right navigates past emoji node', async ({ page }) => {
        // Set content with text followed by an emoji
        await setEditorContent(
          page,
          '<p>hi<span data-type="emoji" data-name="zap">⚡</span>there</p>',
        )
        const editor = await getEditor(page)

        // Place cursor at start and move right past "hi" to be just before the emoji
        await editor.click()
        await page.keyboard.press('Home')
        await page.keyboard.press('ArrowRight')
        await page.keyboard.press('ArrowRight')

        // Now press ArrowRight — cursor should skip over the emoji
        await page.keyboard.press('ArrowRight')

        // Type a character to verify cursor is after the emoji (before "there")
        await page.keyboard.type('Y')

        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toMatch(/data-type="emoji".*Y.*there/)
      })
    })
  })
})
