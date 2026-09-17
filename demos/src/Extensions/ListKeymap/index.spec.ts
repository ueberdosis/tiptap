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

      const placeCaretInEmptyParagraph = async (
        editor: Awaited<ReturnType<typeof getEditor>>,
        content: string,
      ) => {
        await editor.evaluate(
          (el: any, { content: innerContent }: any) => {
            el.editor.commands.setContent(innerContent)
            let caret = -1
            el.editor.state.doc.descendants((node: any, pos: number) => {
              if (caret !== -1) return
              if (node.type.name === 'paragraph' && node.content.size === 0) {
                caret = pos + 1
              }
            })
            if (caret === -1) throw new Error('Could not find an empty paragraph in the document')
            el.editor.chain().focus().setTextSelection({ from: caret, to: caret }).run()
          },
          { content },
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

      test('tab in a paragraph after a list sinks it into the last item', async ({ page }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(editor, '<ul><li><p>A</p></li></ul><p>B</p>', 'B')
        await editor.press('Tab')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<ul><li><p>A</p><p>B</p></li></ul>')
      })

      test('tab in an empty paragraph after a list sinks the empty paragraph in', async ({
        page,
      }) => {
        const editor = await getEditor(page)
        await placeCaretInEmptyParagraph(editor, '<ul><li><p>A</p></li></ul><p></p>')
        await editor.press('Tab')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<ul><li><p>A</p><p></p></li></ul>')
      })

      test('tab targets the last item of a multi-item list', async ({ page }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(editor, '<ul><li><p>A</p></li><li><p>X</p></li></ul><p>B</p>', 'B')
        await editor.press('Tab')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<ul><li><p>A</p></li><li><p>X</p><p>B</p></li></ul>')
      })

      test('tab in a paragraph not preceded by a list does nothing', async ({ page }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(editor, '<p>A</p><p>B</p>', 'B')
        await editor.press('Tab')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<p>A</p><p>B</p>')
      })

      test('tab in the first paragraph of the document does nothing', async ({ page }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(editor, '<p>A</p>', 'A')
        await editor.press('Tab')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<p>A</p>')
      })

      test('tab from mid-paragraph does nothing', async ({ page }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(editor, '<ul><li><p>A</p></li></ul><p>Hello</p>', 'ello')
        await editor.press('Tab')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<ul><li><p>A</p></li></ul><p>Hello</p>')
      })

      test('tab inside a non-first list item still nests via sinkListItem', async ({ page }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(editor, '<ul><li><p>A</p></li><li><p>B</p></li></ul>', 'B')
        await editor.press('Tab')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<ul><li><p>A</p><ul><li><p>B</p></li></ul></li></ul>')
      })

      test('backspace at the start of a sunken paragraph merges into the previous textblock', async ({
        page,
      }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(editor, '<ul><li><p>A</p><p>B</p></li></ul>', 'B')
        await editor.press('Backspace')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<ul><li><p>AB</p></li></ul>')
      })

      test('tab then backspace round-trips an empty paragraph', async ({ page }) => {
        const editor = await getEditor(page)
        await placeCaretInEmptyParagraph(editor, '<ul><li><p>A</p></li></ul><p></p>')
        await editor.press('Tab')
        await editor.press('Backspace')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<ul><li><p>A</p></li></ul>')
      })

      test('tab in a list item after a task sublist joins it as a task item', async ({ page }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(
          editor,
          '<ul><li><p>A</p><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>T</p></li></ul></li><li><p>B</p></li></ul>',
          'B',
        )
        await editor.press('Tab')
        const json = await editor.evaluate((el: any) => el.editor.getJSON())
        const items = json.content[0].content
        expect(items).toHaveLength(1)
        const sublist = items[0].content[1]
        expect(sublist.type).toBe('taskList')
        expect(sublist.content.map((item: any) => item.type)).toEqual(['taskItem', 'taskItem'])
        expect(sublist.content[1].content[0].content[0].text).toBe('B')
      })

      test('tab in a bullet item after an ordered sublist joins the ordered sublist', async ({
        page,
      }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(
          editor,
          '<ul><li><p>A</p><ol><li><p>one</p></li></ol></li><li><p>B</p></li></ul>',
          'B',
        )
        await editor.press('Tab')
        const html = await editor.evaluate((el: any) => el.editor.getHTML())
        expect(html).toBe('<ul><li><p>A</p><ol><li><p>one</p></li><li><p>B</p></li></ol></li></ul>')
      })

      test('shift+tab in a nested task item lifts it into the bullet list as a list item', async ({
        page,
      }) => {
        const editor = await getEditor(page)
        await placeCaretBefore(
          editor,
          '<ul><li><p>A</p><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>T</p></li><li data-type="taskItem" data-checked="true"><p>U</p></li></ul></li></ul>',
          'T',
        )
        await editor.press('Shift+Tab')
        const json = await editor.evaluate((el: any) => el.editor.getJSON())
        const items = json.content[0].content
        expect(items.map((item: any) => item.type)).toEqual(['listItem', 'listItem'])
        expect(items[0].content).toHaveLength(1)
        expect(items[1].content[0].content[0].text).toBe('T')
        const sublist = items[1].content[1]
        expect(sublist.type).toBe('taskList')
        expect(sublist.content[0].attrs.checked).toBe(true)
        expect(sublist.content[0].content[0].content[0].text).toBe('U')
      })
    })
  })
})
