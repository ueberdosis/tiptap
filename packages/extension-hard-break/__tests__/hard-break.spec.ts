import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { __parseFromClipboard } from '@tiptap/pm/view'
import { describe, expect, it } from 'vitest'

import { HardBreak } from '../src/index.js'

describe('HardBreak', () => {
  it('preserves trailing hard breaks when pasting Tiptap clipboard HTML', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, HardBreak],
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: Array.from({ length: 6 }, () => ({ type: 'hardBreak' })),
          },
        ],
      },
    })
    const originalSlice = editor.state.doc.slice(0, editor.state.doc.content.size)
    const { dom } = editor.view.serializeForClipboard(originalSlice)
    const clipboardHTML = dom.innerHTML
    const parsedSlice = __parseFromClipboard(editor.view, '', clipboardHTML, false, editor.state.selection.$from)

    expect(parsedSlice.content.toJSON()).toEqual(originalSlice.content.toJSON())
  })
})
