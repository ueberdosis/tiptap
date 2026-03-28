import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

import { InlineMath } from '../src/index.js'

describe('InlineMath', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('preserves previous character to input rule match', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, InlineMath],
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello $$x$' }],
          },
        ],
      },
    })

    editor.commands.setTextSelection(editor.state.doc.nodeSize)

    editor.view.someProp('handleTextInput', f =>
      f(editor.view, editor.state.selection.from, editor.state.selection.from, '$'),
    )

    expect(editor.getJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              // Ensure previous character is preserved (e.g., space)
              text: 'Hello ',
            },
            {
              type: 'inlineMath',
              attrs: { latex: 'x' },
            },
          ],
        },
      ],
    })
  })

  it('ensure unmatched triple $ expressions', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, InlineMath],
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello $$$x$' }],
          },
        ],
      },
    })

    editor.commands.setTextSelection(editor.state.doc.nodeSize)

    const handled = editor.view.someProp('handleTextInput', f =>
      f(editor.view, editor.state.selection.from, editor.state.selection.from, '$'),
    )

    // Expect no input rule to match
    expect(handled).toBeFalsy()
  })
})
