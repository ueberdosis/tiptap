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
    })
  })
})
