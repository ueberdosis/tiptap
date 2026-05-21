import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'Highlight'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Marks'

const isMac = process.platform === 'darwin'
const mod = isMac ? 'Meta' : 'Control'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor.chain().setContent('<p>Example Text</p>').selectAll().run()
        })
      })

      test('button highlights selected text', async ({ page }) => {
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap mark')).toContainText('Example Text')
      })

      test('highlights text in a specific color', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.toggleHighlight({ color: 'red' }))
        await expect(page.locator('.tiptap mark')).toHaveAttribute('data-color', 'red')
        await expect(page.locator('.tiptap mark')).toContainText('Example Text')
      })

      test('updates attributes of existing marks', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor
            .chain()
            .setContent('<p><mark style="background-color: blue;">Example Text</mark></p>')
            .selectAll()
            .toggleHighlight({ color: 'rgb(255, 0, 0)' })
            .run()
        })
        await expect(page.locator('.tiptap mark')).toHaveCSS('background-color', 'rgb(255, 0, 0)')
      })

      test('removes existing marks with same attributes', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor
            .chain()
            .setContent('<p><mark style="background-color: rgb(255, 0, 0);">Example Text</mark></p>')
            .selectAll()
            .toggleHighlight({ color: 'rgb(255, 0, 0)' })
            .run()
        })
        await expect(page.locator('.tiptap mark')).toHaveCount(0)
      })

      test('isActive: any attributes', async ({ page }) => {
        const editor = await getEditor(page)
        const isActive = await editor.evaluate((el: any) => {
          el.editor.chain().setContent('<p><mark data-color="red">Example Text</mark></p>').selectAll().run()
          return el.editor.isActive('highlight')
        })
        expect(isActive).toBe(true)
      })

      test('isActive: same attributes', async ({ page }) => {
        const editor = await getEditor(page)
        const isActive = await editor.evaluate((el: any) => {
          el.editor
            .chain()
            .setContent('<p><mark style="background-color: rgb(255, 0, 0);">Example Text</mark></p>')
            .selectAll()
            .run()
          return el.editor.isActive('highlight', { color: 'rgb(255, 0, 0)' })
        })
        expect(isActive).toBe(true)
      })

      test('isActive: other attributes', async ({ page }) => {
        const editor = await getEditor(page)
        const isActive = await editor.evaluate((el: any) => {
          el.editor
            .chain()
            .setContent('<p><mark style="background-color: rgb(255, 0, 0);">Example Text</mark></p>')
            .selectAll()
            .run()
          return el.editor.isActive('highlight', { color: 'rgb(0, 0, 0)' })
        })
        expect(isActive).toBe(false)
      })

      test('button toggles highlight on selected text', async ({ page }) => {
        const editor = await getEditor(page)
        await page.locator('button').first().click()
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap mark')).toHaveCount(0)
      })

      test('keyboard shortcut highlights selected text', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor.commands.focus()
          el.editor.commands.selectAll()
        })
        await editor.press(`${mod}+Shift+h`)
        await expect(page.locator('.tiptap mark')).toContainText('Example Text')
      })
    })
  })
})
