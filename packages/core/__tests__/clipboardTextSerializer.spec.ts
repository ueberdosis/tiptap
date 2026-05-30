import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { TextSelection } from '@tiptap/pm/state'
import { afterEach, describe, expect, it } from 'vitest'

const callClipboardTextSerializer = (editor: Editor): string => {
  const serializer = editor.view.someProp('clipboardTextSerializer') as
    | ((slice: ReturnType<typeof editor.state.selection.content>) => string)
    | undefined

  if (!serializer) {
    throw new Error('clipboardTextSerializer prop not registered')
  }

  return serializer(editor.state.selection.content())
}

describe('clipboardTextSerializer', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('serializes the selected substring of a single TextSelection', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>hello world</p>',
    })

    const { state, view } = editor
    const from = state.doc.resolve(1)
    const to = state.doc.resolve(6)
    view.dispatch(state.tr.setSelection(new TextSelection(from, to)))

    expect(callClipboardTextSerializer(editor)).toBe('hello')
  })

  it('joins multiple paragraphs with the default block separator', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>first</p><p>second</p>',
    })

    const { state, view } = editor
    view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, 0, state.doc.content.size)))

    expect(callClipboardTextSerializer(editor)).toBe('first\n\nsecond')
  })

  it('honors a custom blockSeparator option', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>first</p><p>second</p>',
      coreExtensionOptions: {
        clipboardTextSerializer: { blockSeparator: ' | ' },
      },
    })

    const { state, view } = editor
    view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, 0, state.doc.content.size)))

    expect(callClipboardTextSerializer(editor)).toBe('first | second')
  })
})
