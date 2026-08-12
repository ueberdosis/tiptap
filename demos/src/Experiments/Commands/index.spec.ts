import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'Commands'
const frameworkPaths = ['Vue']
const demoPath = '/src/Experiments'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
      })

      test('opens a popup after typing a slash and inserts the chosen item', async ({ page }) => {
        const items = [{ tag: 'h1' }, { tag: 'h2' }, { tag: 'strong' }, { tag: 'em' }]
        const editor = await getEditor(page)
        const dropdown = page.locator('.dropdown-menu')

        await items.reduce(async (prev, item, i) => {
          await prev
          await editor.click()
          await editor.evaluate((el: any) => el.editor.commands.clearContent())
          await editor.type('/')
          await expect(dropdown).toBeVisible()
          await dropdown.locator('button').nth(i).click()
          await editor.evaluate(
            (el: any, text: string) => el.editor.commands.insertContent(text),
            `I am a ${item.tag}`,
          )
          await expect(page.locator(`.tiptap ${item.tag}`)).toHaveText(`I am a ${item.tag}`)
        }, Promise.resolve())
      })

      test('closes the popup without any command via esc', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.click()
        await editor.type('/')
        await expect(page.locator('.dropdown-menu')).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(page.locator('.dropdown-menu')).toHaveCount(0)
      })

      test('opens the popup when the cursor is after a slash', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.click()
        await editor.type('/')
        await expect(page.locator('.dropdown-menu')).toBeVisible()
        await page.keyboard.press('ArrowLeft')
        await expect(page.locator('.dropdown-menu')).toHaveCount(0)
        await page.keyboard.press('ArrowRight')
        await expect(page.locator('.dropdown-menu')).toBeVisible()
      })
    })
  })
})
