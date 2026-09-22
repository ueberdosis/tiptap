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

        await editor.evaluate((el: any) => el.editor.commands.setTextSelection(2))

        await editor.press('ArrowLeft')

        await editor.type('X')

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

        await editor.evaluate((el: any) => el.editor.commands.setTextSelection(3))

        await editor.press('ArrowRight')

        await editor.type('Y')

        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toMatch(/data-type="emoji".*Y.*there/)
      })
    })
  })
})
