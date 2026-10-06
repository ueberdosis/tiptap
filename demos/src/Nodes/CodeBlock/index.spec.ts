import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'CodeBlock'
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

      test('parses code blocks correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<pre><code>Example Text</code></pre>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<pre><code>Example Text</code></pre>')
      })

      test('parses code blocks with language correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<pre><code class="language-css">Example Text</code></pre>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<pre><code class="language-css">Example Text</code></pre>')
      })

      test('button makes the selected line a code block', async ({ page }) => {
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap pre')).toContainText('Example Text')
      })

      test('button toggles the code block', async ({ page }) => {
        const editor = await getEditor(page)
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap pre')).toContainText('Example Text')
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap pre')).toHaveCount(0)
      })

      test('keyboard shortcut creates a code block', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor.commands.focus()
          el.editor.commands.selectAll()
        })
        await editor.press(`${mod}+Alt+c`)
        await expect(page.locator('.tiptap pre')).toContainText('Example Text')
      })

      test('parses language from HTML code block', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) =>
          el.editor.commands.setContent(
            '<pre><code class="language-css">body { display: none; }</code></pre>',
          ),
        )
        await expect(page.locator('.tiptap pre>code.language-css')).toHaveCount(1)
      })

      test('creates code block from backtick markdown shortcut', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('``` Code')
        await expect(page.locator('.tiptap pre>code')).toContainText('Code')
      })

      test('creates code block from tilde markdown shortcut', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('~~~ Code')
        await expect(page.locator('.tiptap pre>code')).toContainText('Code')
      })

      test('creates code block for js with backticks', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('```js Code')
        await expect(page.locator('.tiptap pre>code.language-js')).toContainText('Code')
      })

      test('reverts the markdown shortcut when pressing backspace', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('``` ')
        await page.keyboard.press('Backspace')
        await expect(page.locator('.tiptap pre')).toHaveCount(0)
      })
    })
  })
})
