import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { InlineMath } from './InlineMath.js'

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

  // Types a trailing `$` and returns whether an input rule handled it.
  const typeTrailingDollar = (initialText: string) => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, InlineMath],
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: initialText }],
          },
        ],
      },
    })

    editor.commands.setTextSelection(editor.state.doc.nodeSize)

    return editor.view.someProp('handleTextInput', f =>
      f(editor.view, editor.state.selection.from, editor.state.selection.from, '$'),
    )
  }

  it('replaces only the math when the preceding character is not a space', () => {
    typeTrailingDollar('x$$a$')

    expect(editor.getJSON().content).toEqual([
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'x' },
          { type: 'inlineMath', attrs: { latex: 'a' } },
        ],
      },
    ])
  })

  it('matches math at the very start of a paragraph', () => {
    typeTrailingDollar('$$a$')

    expect(editor.getJSON().content).toEqual([
      {
        type: 'paragraph',
        content: [{ type: 'inlineMath', attrs: { latex: 'a' } }],
      },
    ])
  })

  it('skips a rejected match and still matches the one that follows it', () => {
    // The first `$$a$$` is rejected, but a valid match starts at its trailing `$$`.
    typeTrailingDollar('$$$a$$b$')

    expect(editor.getJSON().content).toEqual([
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: '$$$a' },
          { type: 'inlineMath', attrs: { latex: 'b' } },
        ],
      },
    ])
  })

  it('does not match when the closing delimiter is followed by a third $', () => {
    expect(typeTrailingDollar('$$a$$')).toBeFalsy()
  })
})
