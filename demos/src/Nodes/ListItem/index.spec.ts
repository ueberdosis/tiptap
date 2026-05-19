import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'ListItem'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Nodes'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await setEditorContent(page, '<ul><li>Example Text</li></ul>')
        const editor = await getEditor(page)
        await editor.click()
        await editor.evaluate((el: any) => el.editor.commands.focus('end'))
      })

      test('adds a new list item on Enter', async ({ page }) => {
        await page.keyboard.press('Enter')
        await page.keyboard.type('2nd Item')
        await expect(page.locator('.tiptap li').nth(0)).toContainText('Example Text')
        await expect(page.locator('.tiptap li').nth(1)).toContainText('2nd Item')
      })

      test('sinks the list item on Tab', async ({ page }) => {
        await page.keyboard.press('Enter')
        await page.keyboard.press('Tab')
        await page.keyboard.type('2nd Level')
        await expect(page.locator('.tiptap li:nth-child(1) li')).toContainText('2nd Level')
      })

      test('lifts the list item on Shift+Tab', async ({ page }) => {
        await page.keyboard.press('Enter')
        await page.keyboard.press('Tab')
        await page.keyboard.press('Shift+Tab')
        await page.keyboard.type('1st Level')
        await expect(page.locator('.tiptap li').nth(1)).toContainText('1st Level')
      })
    })
  })
})
