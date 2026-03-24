import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { skipTrailingNodeMeta,TrailingNode } from '@tiptap/extensions'
import { afterEach, describe, expect, it } from 'vitest'

describe('extension-trailing-node', () => {
  let editor: Editor | null = null

  afterEach(() => {
    if (editor) {
      editor.destroy()
      editor = null
    }
  })

  it('only skips trailing node insertion for the current transaction cycle', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Heading, TrailingNode],
      content: '<h1>Title</h1><p>End</p>',
    })

    const headingSize = editor.state.doc.firstChild!.nodeSize

    editor.view.dispatch(
      editor.state.tr.delete(headingSize, editor.state.doc.content.size).setMeta(skipTrailingNodeMeta, true),
    )

    expect(editor.getJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Title' }],
        },
      ],
    })

    editor.commands.setTextSelection(1)

    expect(editor.getJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Title' }],
        },
        {
          type: 'paragraph',
        },
      ],
    })
  })
})
