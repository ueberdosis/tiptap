import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Blockquote'
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

      test('parses blockquote tags correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<blockquote><p>Example Text</p></blockquote>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<blockquote><p>Example Text</p></blockquote>')
      })

      test('parses blockquote tags without paragraphs correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<blockquote>Example Text</blockquote>')
          return el.editor.getHTML()
        })
        expect(html).toBe('<blockquote><p>Example Text</p></blockquote>')
      })

      test('button makes the selected line a blockquote', async ({ page }) => {
        await expect(page.locator('.tiptap blockquote')).toHaveCount(0)
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap blockquote')).toContainText('Example Text')
      })

      test('button wraps all nodes in one blockquote', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p>Example Text</p><p>Example Text</p>')
          el.editor.commands.selectAll()
        })
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap blockquote')).toHaveCount(1)
      })

      test('button toggles the blockquote', async ({ page }) => {
        const editor = await getEditor(page)
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap blockquote')).toContainText('Example Text')
        const isActive = await editor.evaluate((el: any) => el.editor.isActive('blockquote'))
        expect(isActive).toBe(true)
      })

      test('keyboard shortcut makes selected line a blockquote', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => {
          el.editor.commands.focus()
          el.editor.commands.selectAll()
        })
        await editor.press(`${mod}+Shift+b`)
        await expect(page.locator('.tiptap blockquote')).toContainText('Example Text')
      })

      test('markdown shortcut creates blockquote', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('> Quote')
        await expect(page.locator('.tiptap blockquote')).toContainText('Quote')
      })

      const placeCaretBefore = async (
        editor: Awaited<ReturnType<typeof getEditor>>,
        content: string,
        target: string,
      ) => {
        await editor.evaluate(
          (el: any, { content: innerContent, target: innerTarget }: any) => {
            el.editor.commands.setContent(innerContent)
            let caret = -1
            el.editor.state.doc.descendants((node: any, pos: number) => {
              if (caret !== -1 || !node.isText) return
              const offset = node.text.indexOf(innerTarget)
              if (offset !== -1) caret = pos + offset
            })
            if (caret === -1) throw new Error(`Could not find "${innerTarget}" in the document`)
            el.editor.chain().focus().setTextSelection({ from: caret, to: caret }).run()
          },
          { content, target },
        )
      }

      test('backspace at the start of a non-first child lifts it out of the blockquote', async ({
        page,
      }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(editor, '<blockquote><p>A</p><p>B</p></blockquote>', 'B')
        await editor.press('Backspace')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<blockquote><p>A</p></blockquote><p>B</p>')
      })

      test('backspace at the start of a middle child splits the blockquote around it', async ({
        page,
      }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(editor, '<blockquote><p>A</p><p>B</p><p>C</p></blockquote>', 'B')
        await editor.press('Backspace')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe(
          '<blockquote><p>A</p></blockquote><p>B</p><blockquote><p>C</p></blockquote>',
        )
      })

      test('backspace at the start of a paragraph after a blockquote merges into its last textblock', async ({
        page,
      }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(editor, '<blockquote><p>A</p></blockquote><p>B</p>', 'B')
        await editor.press('Backspace')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<blockquote><p>AB</p></blockquote>')
      })

      test('lift then merge: two backspaces collapse a child back into the previous text', async ({
        page,
      }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(editor, '<blockquote><p>A</p><p>B</p></blockquote>', 'B')
        await editor.press('Backspace')
        await editor.press('Backspace')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<blockquote><p>AB</p></blockquote>')
      })
    })
  })
})
