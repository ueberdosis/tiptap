import { Editor, Extension, InputRule } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Collaboration from '@tiptap/extension-collaboration'
import Document from '@tiptap/extension-document'
import Italic from '@tiptap/extension-italic'
import { BulletList, ListItem } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Strike from '@tiptap/extension-strike'
import Text from '@tiptap/extension-text'
import { UndoRedo } from '@tiptap/extensions'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import * as Y from 'yjs'

const DecliningRule = Extension.create({
  name: 'decliningRule',
  priority: 200,
  addInputRules() {
    return [new InputRule({ find: /^-\s$/, handler: () => null })]
  },
})

const CustomListRule = Extension.create({
  name: 'customListRule',
  priority: 201,
  addInputRules() {
    return [
      new InputRule({
        find: /^-\s$/,
        handler: ({ chain, range, state }) => {
          const $from = state.doc.resolve(range.from)

          chain()
            .setTextSelection({ from: $from.start(), to: $from.end() })
            .toggleBulletList()
            .command(({ tr }) => {
              tr.delete(tr.selection.from, tr.selection.from + 2)
              return true
            })
            .run()
        },
      }),
    ]
  },
})

describe('input rule undo with collaboration', () => {
  let editor: Editor
  let element: HTMLElement
  let document: Y.Doc

  afterEach(() => {
    editor?.destroy()
    element?.remove()
    document?.destroy()
  })

  const createEditor = async (collaboration: boolean, customRule = false) => {
    element = window.document.createElement('div')
    window.document.body.appendChild(element)
    document = new Y.Doc()

    editor = new Editor({
      element,
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        Italic,
        Strike,
        BulletList,
        ListItem,
        DecliningRule,
        ...(customRule ? [CustomListRule] : []),
        ...(collaboration ? [Collaboration.configure({ document })] : []),
        ...(!collaboration ? [UndoRedo] : []),
      ],
    })

    await new Promise<void>(resolve => setTimeout(resolve, 10))
  }

  const type = (text: string) => {
    for (const character of text) {
      const { from, to } = editor.state.selection
      const handled = editor.view.someProp('handleTextInput', handler =>
        handler(editor.view, from, to, character),
      )

      if (!handled) {
        editor.commands.insertContent(character)
      }
    }
  }

  it('restores a list marker with collaboration undo', async () => {
    await createEditor(true)
    type('- ')

    expect(editor.getHTML()).toBe('<ul><li><p></p></li></ul>')

    editor.commands.undo()

    expect(editor.getHTML()).toBe('<p>- </p>')

    editor.commands.redo()

    expect(editor.getHTML()).toBe('<ul><li><p></p></li></ul>')
  })

  it('restores a marker removed by a custom list input rule', async () => {
    await createEditor(true, true)
    type('- ')

    expect(editor.getHTML()).toBe('<ul><li><p></p></li></ul>')

    editor.commands.undo()

    expect(editor.getHTML()).toBe('<p>- </p>')
  })

  it('restores a list marker with normal history undo', async () => {
    await createEditor(false)
    type('- ')

    editor.commands.undo()

    expect(editor.getHTML()).toBe('<p>- </p>')

    editor.commands.redo()

    expect(editor.getHTML()).toBe('<ul><li><p></p></li></ul>')
  })

  it.each([
    { input: '**bold**', output: '<p><strong>bold</strong></p>' },
    { input: '*italic*', output: '<p><em>italic</em></p>' },
    { input: '~~strike~~', output: '<p><s>strike</s></p>' },
  ])('restores $input with Backspace', async ({ input, output }) => {
    await createEditor(true)
    type(input)

    expect(editor.getHTML()).toBe(output)

    editor.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))

    expect(editor.getHTML()).toBe(`<p>${input}</p>`)
  })

  it('restores bold delimiters with Backspace without collaboration', async () => {
    await createEditor(false)
    type('**bold**')

    expect(editor.getHTML()).toBe('<p><strong>bold</strong></p>')

    editor.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))

    expect(editor.getHTML()).toBe('<p>**bold**</p>')
  })
})
