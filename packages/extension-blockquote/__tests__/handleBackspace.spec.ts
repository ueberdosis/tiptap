import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { TextSelection } from '@tiptap/pm/state'
import { afterEach, describe, expect, it } from 'vitest'

import { Blockquote } from '../src/index.js'
import { handleBackspace } from '../src/handleBackspace.js'

describe('blockquote handleBackspace', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('does not throw when the caret sits at the document start', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Image, Blockquote],
      content: '<img src="https://example.com/a.png">',
    })

    // A block image at the start places the caret as a gap cursor at the very
    // top of the document (position 0, depth 0). A degenerate text selection at
    // position 0 resolves to the same $from, reproducing that code path without
    // pulling in the gap-cursor module.
    const { state, view } = editor
    view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, 0)))

    const blockquoteType = editor.schema.nodes.blockquote

    let result: boolean | undefined
    expect(() => {
      result = handleBackspace(editor, blockquoteType)
    }).not.toThrow()
    expect(result).toBe(false)
  })
})
