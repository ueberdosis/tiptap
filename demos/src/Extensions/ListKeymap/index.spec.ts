import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'ListKeymap'
const frameworkPaths = ['React']
const demoPath = '/src/Extensions'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
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

      test('backspace at the start of a non-first item lifts it out of the list', async ({
        page,
      }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(editor, '<ul><li><p>A</p></li><li><p>B</p></li></ul>', 'B')
        await editor.press('Backspace')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<ul><li><p>A</p></li></ul><p>B</p>')
      })

      test('backspace at the start of a middle item splits the list around it', async ({
        page,
      }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(
          editor,
          '<ul><li><p>A</p></li><li><p>B</p></li><li><p>C</p></li></ul>',
          'B',
        )
        await editor.press('Backspace')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<ul><li><p>A</p></li></ul><p>B</p><ul><li><p>C</p></li></ul>')
      })

      test('lift then merge: two backspaces collapse a child back into the previous item', async ({
        page,
      }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(editor, '<ul><li><p>A</p></li><li><p>B</p></li></ul>', 'B')
        await editor.press('Backspace')
        await editor.press('Backspace')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<ul><li><p>AB</p></li></ul>')
      })
    })
  })
})
