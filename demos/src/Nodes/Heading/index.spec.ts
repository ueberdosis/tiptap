import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Heading'
const frameworkPaths = ['React', 'Vue', 'Svelte']
const demoPath = '/src/Nodes'

const isMac = process.platform === 'darwin'
const mod = isMac ? 'Meta' : 'Control'

const headings = ['<h1>Example Text</h1>', '<h2>Example Text</h2>', '<h3>Example Text</h3>']

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

      headings.forEach(html => {
        test(`parses ${html} correctly`, async ({ page }) => {
          const editor = await getEditor(page)
          const result = await editor.evaluate((el: any, content: string) => {
            el.editor.commands.setContent(content)
            return el.editor.getHTML()
          }, html)
          expect(result).toBe(html)
        })
      })

      test('omits disabled heading levels', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<h4>Example Text</h4>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<p>Example Text</p>')
      })
      ;[1, 2, 3].forEach(level => {
        test(`button makes selected line h${level}`, async ({ page }) => {
          await page
            .locator('button')
            .nth(level - 1)
            .click()
          await expect(page.locator(`.tiptap h${level}`)).toContainText('Example Text')
        })

        test(`keyboard shortcut makes paragraph h${level}`, async ({ page }) => {
          const editor = await getEditor(page)
          await editor.evaluate((el: any) => {
            el.editor.commands.focus()
            el.editor.commands.selectAll()
          })
          await editor.press(`${mod}+Alt+${level}`)
          await expect(page.locator(`.tiptap h${level}`)).toContainText('Example Text')
        })

        test(`creates h${level} from markdown shortcut`, async ({ page }) => {
          const editor = await getEditor(page)
          await editor.evaluate((el: any) => el.editor.commands.clearContent())
          await editor.click()
          await page.keyboard.type(`${'#'.repeat(level)} Headline`)
          await expect(page.locator(`.tiptap h${level}`)).toContainText('Headline')
        })
      })

      test('button toggles the heading', async ({ page }) => {
        await page.locator('button').nth(0).click()
        await expect(page.locator('.tiptap h1')).toContainText('Example Text')
        await page.locator('button').nth(0).click()
        await expect(page.locator('.tiptap h1')).toHaveCount(0)
      })
    })
  })
})
