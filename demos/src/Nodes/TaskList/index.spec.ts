import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'TaskList'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Nodes'

const isMac = process.platform === 'darwin'
const mod = isMac ? 'Meta' : 'Control'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await setEditorContent(page, '<p>Example Text</p>')
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
      })

      test('parses task lists correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent(
            '<ul data-type="taskList"><li data-checked="true" data-type="taskItem"><p>Example Text</p></li></ul>',
          )
          return el.editor.getHTML()
        })
        expect(html).toBe(
          '<ul data-type="taskList"><li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Example Text</p></div></li></ul>',
        )
      })

      test('button makes selected line a task list item', async ({ page }) => {
        await expect(page.locator('.tiptap ul')).toHaveCount(0)
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap ul[data-type="taskList"] li')).toContainText('Example Text')
      })

      test('button toggles the task list', async ({ page }) => {
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap ul[data-type="taskList"]')).toContainText('Example Text')
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap ul')).toHaveCount(0)
      })

      test('keyboard shortcut creates a task list', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor.commands.focus()
          el.editor.commands.selectAll()
        })
        await editor.press(`${mod}+Shift+9`)
        await expect(page.locator('.tiptap ul li')).toContainText('Example Text')
      })

      test('creates a task list from "[ ]"', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('[ ] List Item 1')
        await page.keyboard.press('Enter')
        await page.keyboard.type('List Item 2')
        await expect(page.locator('.tiptap li').nth(0)).toContainText('List Item 1')
        await expect(page.locator('.tiptap li').nth(0)).toHaveAttribute('data-checked', 'false')
        await expect(page.locator('.tiptap li').nth(1)).toContainText('List Item 2')
      })

      test('creates a checked task list from "[x]"', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('[x] List Item 1')
        await page.keyboard.press('Enter')
        await page.keyboard.type('List Item 2')
        await expect(page.locator('.tiptap li').nth(0)).toContainText('List Item 1')
        await expect(page.locator('.tiptap li').nth(0)).toHaveAttribute('data-checked', 'true')
      })
    })
  })
})
