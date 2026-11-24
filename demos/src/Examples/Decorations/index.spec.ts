import { expect, test } from '@playwright/test'

import { focusEditorEnd, getEditor } from '../../../test/helpers.js'

const demoName = 'Decorations'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(frameworkPath, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('renders inline, widget and node decorations for the initial term', async ({ page }) => {
        const editor = await getEditor(page)

        await expect(editor.locator('.decoration-highlight')).toHaveCount(2)
        await expect(editor.locator('.decoration-marker')).toHaveCount(2)

        for (const highlight of await editor.locator('.decoration-highlight').all()) {
          await expect(highlight).toHaveText(/tiptap/i)
        }

        await expect(editor.locator('h2')).toHaveCount(2)
        await expect(editor.locator('h2.decoration-heading')).toHaveCount(2)
      })

      test('updates the highlights when the search term changes', async ({ page }) => {
        const editor = await getEditor(page)

        await page.getByPlaceholder('Search term').fill('keymaps')

        await expect(editor.locator('.decoration-highlight')).toHaveCount(1)
        await expect(editor.locator('.decoration-highlight')).toHaveText('keymaps')
        await expect(editor.locator('.decoration-marker')).toHaveCount(1)

        await page.getByPlaceholder('Search term').fill('')

        await expect(editor.locator('.decoration-highlight')).toHaveCount(0)
        await expect(editor.locator('.decoration-marker')).toHaveCount(0)
        await expect(editor.locator('h2.decoration-heading')).toHaveCount(2)
      })

      test('maps and renders decorations for content typed by the user', async ({ page }) => {
        const editor = await getEditor(page)

        await focusEditorEnd(page)
        await page.keyboard.type(' Tiptap rocks.')

        await expect(editor.locator('.decoration-highlight')).toHaveCount(3)
        await expect(editor.locator('.decoration-marker')).toHaveCount(3)
        await expect(editor.locator('.decoration-highlight').last()).toHaveText('Tiptap')
        await expect(editor.locator('p').last()).toContainText('Tiptap rocks.')
      })

      test('decorates a heading added by the user', async ({ page }) => {
        const editor = await getEditor(page)

        await focusEditorEnd(page)
        await page.keyboard.press('Enter')
        await page.keyboard.type('## Fresh heading')

        await expect(editor.locator('h2')).toHaveCount(3)
        await expect(editor.locator('h2.decoration-heading')).toHaveCount(3)
        await expect(editor.locator('h2.decoration-heading').last()).toHaveText('Fresh heading')
      })
    })
  })
})
